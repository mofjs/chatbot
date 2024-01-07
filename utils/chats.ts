import { kv } from "~/utils/kv.ts";
import { env } from "~/utils/env.ts";
import { openai } from "~/utils/openai.ts";
import { send, WAMessage } from "~/utils/wa.ts";

type Chat = {
  jid: string;
  assistant_id?: string;
  thread_id?: string;
  reply_to: "all" | "mentions" | "quotes" | "mentions_or_quotes" | "none";
};

export async function get_chats() {
  const results = kv.list<Chat>({ prefix: ["chats"] });
  const chats = [];
  for await (const { value } of results) {
    chats.push(value);
  }
  return chats;
}

export async function get_chat(jid: string) {
  const result = await kv.get<Chat>(["chats", jid]);
  return result.value;
}

export async function set_chat(chat: Chat) {
  const result = await kv.set(["chats", chat.jid], chat);
  return result.ok;
}

export async function delete_chat(jid: string) {
  await kv.delete(["chats", jid]);
}

export async function handle_message(waMessage: WAMessage) {
  const jid = waMessage.key.remoteJid;
  if (!jid) return;
  const chat = (await kv.get<Chat>(["chats", jid])).value;
  if (!chat || !chat.assistant_id || chat.reply_to === "none") return;
  const contextInfo = waMessage.message?.extendedTextMessage?.contextInfo;
  const isMentioned = contextInfo?.mentionedJid?.includes(env.SELF_JID);
  if (chat.reply_to === "mentions" && !isMentioned) return;
  const isQuoted = contextInfo?.participant === env.SELF_JID;
  if (chat.reply_to === "quotes" && !isQuoted) return;
  if (chat.reply_to === "mentions_or_quotes" && !isMentioned && !isQuoted) {
    return;
  }
  const content = waMessage.message?.conversation ??
    waMessage.message?.extendedTextMessage?.text;
  if (!content) return;
  const message = {
    role: "user" as const,
    content,
  };
  if (!chat.thread_id) {
    const thread = await openai.beta.threads.create({
      messages: [message],
    });
    chat.thread_id = thread.id;
    await kv.set(["chats", jid], chat);
  } else {
    const runs = await openai.beta.threads.runs.list(chat.thread_id, {
      order: "desc",
    });
    for (const run of runs.data) {
      if (run.status === "in_progress") {
        await openai.beta.threads.runs.cancel(chat.thread_id, run.id);
      }
    }
    await openai.beta.threads.messages.create(chat.thread_id, message);
  }
  const run = await openai.beta.threads.runs.create(chat.thread_id, {
    assistant_id: chat.assistant_id,
  });
  const reply = await pollsRun(chat.thread_id, run.id);
  reply?.content?.forEach(async (content) => {
    switch (content.type) {
      case "text":
        send(chat.jid, content.text.value);
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
        const response = await openai.beta.threads.messages.list(thread_id, {
          order: "desc",
          limit: 1,
        });
        const message = response.data.at(0);
        if (message?.role === "assistant") {
          return message;
        }
        return null;
      }
      case "cancelled":
      case "cancelling":
      case "expired":
      case "failed":
        return null;
      default:
        await new Promise((resolve) => setTimeout(resolve, 500));
        break;
    }
  }
}
