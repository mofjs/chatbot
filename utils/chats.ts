import { kv } from "~/utils/kv.ts";
import { WAMessage } from "@whiskeysockets/baileys";
import { env } from "~/utils/env.ts";
import { openai } from "~/utils/openai.ts";

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

export async function handle_message(payload: WAMessage) {
  const jid = payload.key.remoteJid;
  if (!jid) return;
  const chat = (await kv.get<Chat>(["chats", jid])).value;
  if (!chat || !chat.assistant_id || chat.reply_to === "none") return;
  const contextInfo = payload.message?.extendedTextMessage?.contextInfo;
  const isMentioned = contextInfo?.mentionedJid?.includes(env.SELF_JID);
  if (chat.reply_to === "mentions" && !isMentioned) return;
  const isQuoted = contextInfo?.participant === env.SELF_JID;
  if (chat.reply_to === "quotes" && !isQuoted) return;
  if (chat.reply_to === "mentions_or_quotes" && !isMentioned && !isQuoted) {
    return;
  }
  const content = payload.message?.conversation ??
    payload.message?.extendedTextMessage?.text ??
    "";
  const message = {
    role: "user" as const,
    content,
  };
  if (!chat.thread_id) {
    const thread = await openai.beta.threads.create({ messages: [message] });
    await kv.set(["chats", jid], { ...chat, thread_id: thread.id });
  } else {
    openai.beta.threads.messages.create(chat.thread_id, message);
  }
}
