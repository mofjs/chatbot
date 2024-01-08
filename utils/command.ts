import { WAMessage, WASendMessage } from "~/utils/wa.ts";
import { openai } from "~/utils/openai.ts";

export async function handleCommand(
  waMessage: WAMessage,
): Promise<WASendMessage | undefined> {
  const jid = waMessage.key.remoteJid;
  if (!jid) return;
  const command = (waMessage.message?.conversation ??
    waMessage.message?.extendedTextMessage?.text)?.replace("/", "").trim();

  switch (command) {
    case "jid":
      return {
        jid,
        content: { text: "```" + jid + "```" },
      };
    case "assistants": {
      const assistants = await openai.beta.assistants.list();
      return {
        jid,
        content: {
          text: "Choose __Assistant__ to interact with.",
          title: "Assistant",
          buttonText: "Choose",
          sections: [{
            title: "All",
            rows: assistants.data.map((assistant) => ({
              title: assistant.name ?? "No Name",
              description: assistant.description ?? "No Description",
            })),
          }],
        },
      };
    }
    default:
      break;
  }
}
