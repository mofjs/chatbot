import { Assistant, openai } from "~/utils/openai.ts";
import { getChat, setChat } from "~/utils/chats.ts";
import { getContent, input, send, WAMessage } from "~/utils/wa.ts";

function isTrue(arg?: string | null) {
  if (!arg) return false;
  const s = arg.toLowerCase();
  if (["n", "no", "false", "cancel"].includes(s)) return false;
  if (["y", "yes", "true", "ok"].includes(s)) return true;
  throw new Error("Invalid argument.");
}
class CommandContext {
  constructor(public jid: string) {}

  log(message: string) {
    const text = ["```", message, "```"].join("\n");
    send({ jid: this.jid, content: { text } });
  }

  error(e: unknown) {
    const text = `${e}`.split("\n").map((line) => "> " + line).join("\n");
    send({ jid: this.jid, content: { text } });
  }

  async alert(message: string, timeout = 3000) {
    this.log(message);
    const signal = AbortSignal.timeout(timeout);
    try {
      await input(this.jid, signal);
    } catch {
      // ignore any error
    }
  }

  async confirm(
    message: string,
    timeout = 10_000,
  ) {
    this.log(message);
    const signal = AbortSignal.timeout(timeout);
    try {
      const message = await input(this.jid, signal);
      return isTrue(getContent(message));
    } catch (e) {
      if (e instanceof DOMException && e.name === "TimeoutError") {
        this.error(e);
        return false;
      } else {
        throw e;
      }
    }
  }

  async prompt(message: string, timeout = 60_000) {
    this.log(message);
    const signal = AbortSignal.timeout(timeout);
    return await input(this.jid, signal);
  }
}

export async function handleCommand(waMessage: WAMessage): Promise<void> {
  const jid = waMessage.key.remoteJid;
  if (!jid) return;
  const command = getContent(waMessage)?.replace("/", "").trim();
  if (!command) return;
  const ctx = new CommandContext(jid);
  try {
    switch (command) {
      case "jid":
        await ctx.alert(jid);
        break;
      case "assistants":
        await handleAssistant(ctx);
        break;
      default:
        break;
    }
  } catch (e) {
    ctx.error(e);
  }
}

async function handleAssistant(ctx: CommandContext) {
  const chat = await getChat(ctx.jid);
  if (!chat) throw new Error("Chat are not registered.");
  const datas: Assistant[] = [];
  const res = await openai.beta.assistants.list();
  for await (const page of res.iterPages()) {
    datas.push(...page.getPaginatedItems());
  }
  const message = await ctx.prompt(
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
  const confirmed = await ctx.confirm(
    "Change to this assistant?\n\n" +
      ["name", "description", "model"].map((k) =>
        `${k}: ${chosen[k as keyof Assistant]}`
      ).join("\n"),
  );
  if (confirmed) {
    await setChat({ ...chat, assistant_id: chosen.id });
    await ctx.alert("Assistant changed.");
  } else {
    await ctx.alert("Operation canceled.");
  }
}
