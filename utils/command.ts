import { Assistant, openai } from "~/utils/openai.ts";
import { getChat, setChat } from "~/utils/chats.ts";
import { getContent, input, send, WAMessage } from "~/utils/wa.ts";

class TimeoutError extends Error {}

function log(jid: string, message: string) {
  send({ jid, content: { text: ["```", message, "```"].join("\n") } });
}

function error(jid: string, e: unknown) {
  const text = `${e}`.split("\n").map((line) => "> " + line).join("\n");
  send({ jid, content: { text } });
}

async function alert(jid: string, message: string, timeout = 3000) {
  log(jid, message);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  try {
    await input(jid, controller.signal);
  } catch {
    // ignore any error
  } finally {
    clearTimeout(timeoutId);
  }
}

function isTrue(arg?: string | null) {
  if (!arg) return false;
  const s = arg.toLowerCase();
  if (["n", "no", "false", "cancel"].includes(s)) return false;
  if (["y", "yes", "true", "ok"].includes(s)) return true;
  throw new Error("Invalid argument.");
}

async function confirm(
  jid: string,
  message: string,
  timeout = 10_000,
) {
  log(jid, message);
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new TimeoutError("Confirm reply timeout!")),
    timeout,
  );
  try {
    const message = await input(jid, controller.signal);
    return isTrue(getContent(message));
  } catch (e) {
    if (e instanceof TimeoutError) {
      error(jid, e);
      return false;
    } else {
      throw e;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

async function prompt(jid: string, message: string, timeout = 60_000) {
  log(jid, message);
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(new TimeoutError("Prompt reply timeout!")),
    timeout,
  );
  try {
    return await input(jid, controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function handleCommand(waMessage: WAMessage): Promise<void> {
  const jid = waMessage.key.remoteJid;
  if (!jid) return;
  const command = getContent(waMessage)?.replace("/", "").trim();
  if (!command) return;
  try {
    switch (command) {
      case "jid":
        await alert(jid, jid);
        break;
      case "assistants":
        await handleAssistant(jid);
        break;
      default:
        break;
    }
  } catch (e) {
    error(jid, e);
  }
}

async function handleAssistant(jid: string) {
  const chat = await getChat(jid);
  if (!chat) throw new Error("Chat are not registered.");
  const datas: Assistant[] = [];
  const res = await openai.beta.assistants.list();
  for await (const page of res.iterPages()) {
    datas.push(...page.getPaginatedItems());
  }
  const message = await prompt(
    jid,
    "Choose Assistant to interact with:\n\n" +
      datas.map((a, i) =>
        `${i + 1}: ${a.name}` +
        (a.id === chat.assistant_id ? " (current)" : "")
      ).join("\n") +
      "\n\nReply with the assistant number:",
  );
  const content = getContent(message);
  if (!content) throw new Error("Message can't be empty.");
  const chosen = datas.at(parseInt(content) - 1);
  if (!chosen) throw new Error("No Assistant with associated number.");
  const confirmed = await confirm(
    jid,
    "Change to this assistant?\n\n" +
      ["name", "description", "model"].map((k) =>
        `${k}: ${chosen[k as keyof Assistant]}`
      ).join("\n"),
  );
  if (confirmed) {
    await setChat({ ...chat, assistant_id: chosen.id });
    await alert(jid, "Assistant changed.");
  } else {
    await alert(jid, "Operation canceled.");
  }
}
