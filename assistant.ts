import { ChatMessage, chat } from "./chat.ts";
import { Payload } from "./wa.d.ts";
import { FUNCTIONS_DEFINITION, callFunction } from "./functions.ts";

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

export function assistant(payload: Payload) {
  if (
    payload.message?.extendedTextMessage?.contextInfo?.mentionedJid?.includes(
      SELF_JID
    )
  ) {
    const content = payload.message.extendedTextMessage.text.replaceAll(
      "@" + PHONE_NUMBER,
      "asisten"
    );
    return chat([...SYSTEM_MESSAGES, { role: "user", content }], {
      max_tokens: 500,
      functions_definition: FUNCTIONS_DEFINITION,
      call_function: callFunction,
    }).catch((err) => `[ERROR] ${err}.`);
  }
}
