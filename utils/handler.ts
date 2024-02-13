import { env } from "~/utils/env.ts";
import { getChat } from "~/utils/chats.ts";
import { openai } from "~/utils/openai.ts";
import { getContent, send, WAMessage } from "~/utils/wa.ts";
import { handleCommand } from "~/utils/command.ts";
import { execFunctionTool } from "~/utils/function-tool.ts";

export async function handle_message(waMessage: WAMessage) {
  const jid = waMessage.key.remoteJid;
  if (!jid) return;
  const content = getContent(waMessage)?.trim();
  if (!content) return;
  if (content.startsWith("/")) {
    await handleCommand(waMessage);
    return;
  }
  const chat = await getChat(jid);
  if (!chat || !chat.assistant_id || chat.reply_to === "none") return;
  const contextInfo = waMessage.message?.extendedTextMessage?.contextInfo;
  const isMentioned = contextInfo?.mentionedJid?.includes(env.SELF_JID);
  if (chat.reply_to === "mentions" && !isMentioned) return;
  const isQuoted = contextInfo?.participant === env.SELF_JID;
  if (chat.reply_to === "quotes" && !isQuoted) return;
  if (chat.reply_to === "mentions_or_quotes" && !isMentioned && !isQuoted) {
    return;
  }
  const message = {
    role: "user" as const,
    content,
  };
  const runs = await openai.beta.threads.runs.list(chat.thread_id, {
    order: "desc",
  });
  for (const run of runs.data) {
    if (run.status === "in_progress") {
      await openai.beta.threads.runs.cancel(chat.thread_id, run.id);
    }
  }
  await openai.beta.threads.messages.create(chat.thread_id, message);
  const run = await openai.beta.threads.runs.create(chat.thread_id, {
    assistant_id: chat.assistant_id,
  });
  const reply = await pollsRun(chat.thread_id, run.id);
  reply?.content?.forEach(async (content) => {
    switch (content.type) {
      case "text":
        send({ jid: chat.jid, content: { text: content.text.value } });
        break;
      case "image_file": {
        const response = await openai.files.content(content.image_file.file_id);
        const _file = await response.arrayBuffer();
        //TODO: handle image response
        break;
      }
      default:
        break;
    }
  });
}

export async function pollsRun(thread_id: string, run_id: string) {
  while (true) {
    const run = await openai.beta.threads.runs.retrieve(thread_id, run_id);
    switch (run.status) {
      case "completed": {
        const page = await openai.beta.threads.messages.list(thread_id, {
          order: "desc",
          limit: 1,
        });
        const message = page.data.at(0);
        if (message?.role === "assistant") {
          return message;
        }
        return;
      }
      case "requires_action": {
        const tool_calls = run.required_action?.submit_tool_outputs.tool_calls;
        if (!tool_calls) break;
        const tool_outputs = await Promise.all(
          tool_calls.map(async (
            { id, function: { name, arguments: args } },
          ) => ({
            tool_call_id: id,
            output: await execFunctionTool(name, args),
          })),
        );
        await openai.beta.threads.runs.submitToolOutputs(thread_id, run_id, {
          tool_outputs,
        });
        break;
      }
      case "cancelled":
      case "cancelling":
      case "expired":
      case "failed":
        return;
      default:
        await new Promise((resolve) => setTimeout(resolve, 500));
        break;
    }
  }
}
