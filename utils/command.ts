import { Assistant, openai } from "~/utils/openai.ts";
import { getChat, setChat } from "~/utils/chats.ts";
import { getContent, input, send, WAMessage } from "~/utils/wa.ts";

function isTrue(arg: string) {
  const s = arg.toLowerCase();
  if (["n", "no", "false", "cancel"].includes(s)) return false;
  if (["y", "yes", "true", "ok"].includes(s)) return true;
  return new Boolean(s);
}

async function alert(jid: string, message: string, timeout = 3000) {
  await send({ jid, content: { text: ["```", message, "```"].join("\n") } });
  const { signal, abort } = new AbortController();
  setTimeout(abort, timeout);
  await input(jid, signal).catch(() => {});
}

async function confirm(
  jid: string,
  message: string,
  timeout = 10_000,
) {
  await send({ jid, content: { text: ["```", message, "```"].join("\n") } });
  const { signal, abort } = new AbortController();
  setTimeout(abort, timeout);
  return input(jid, signal)
    .then((message) => isTrue(getContent(message) ?? ""))
    .catch(() => false);
}

async function prompt(jid: string, message: string, timeout = 60_000) {
  await send({ jid, content: { text: ["```", message, "```"].join("\n") } });
  const { signal, abort } = new AbortController();
  setTimeout(abort, timeout);
  return await input(jid, signal);
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
      case "assistants": {
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
          alert(jid, "Assistant changed.");
        } else {
          alert(jid, "Operation canceled.");
        }
        break;
      }
      default:
        break;
    }
  } catch (error) {
    send({ jid, content: { text: `> ${error}` } });
  }
}
