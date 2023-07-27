import { ChatMessage, chat } from "./chat.ts";
import { Payload } from "./wa.d.ts";

const PHONE_NUMBER = Deno.env.get("PHONE_NUMBER");
const SELF_JID = PHONE_NUMBER + "@s.whatsapp.net";
const SYSTEM_MESSAGES: ChatMessage[] = [
  {
    role: "system",
    content: "You are a helpful assistant.",
  },
  {
    role: "system",
    content: "Only answer in 50 words or less.",
  },
];

export async function assistant(payload: Payload) {
  if (
    payload.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
      SELF_JID
    )
  ) {
    const content = payload.message.extendedTextMessage.text.replaceAll(
      "@" + PHONE_NUMBER,
      "asisten"
    );
    const response = await chat([
      ...SYSTEM_MESSAGES,
      { role: "user", content },
    ]);
    const { choices } = response;
    const choice = choices.pop();
    if (choice?.message.role === "assistant") return choice.message.content;
  }
}
