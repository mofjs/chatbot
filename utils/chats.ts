import { kv } from "~/utils/kv.ts";
import { z } from "zod";

export const chatSchema = z.object({
  jid: z.union([
    z.string().regex(/\d+@s\.whatsapp\.net/),
    z.string().regex(/\d+-\d+@g\.us/),
  ]),
  name: z.string().min(5).max(255),
  assistant_id: z.string(),
  thread_id: z.string(),
  reply_to: z.enum(["all", "mentions", "quotes", "mentions_or_quotes", "none"]),
});

export type Chat = z.infer<typeof chatSchema>;

export async function getChats() {
  const results = kv.list<Chat>({ prefix: ["chats"] });
  const chats = [];
  for await (const { value } of results) {
    chats.push(value);
  }
  return chats;
}

export async function getChat(jid: string) {
  const result = await kv.get<Chat>(["chats", jid]);
  return result.value;
}

export async function setChat(chat: Chat) {
  const result = await kv.set(["chats", chat.jid], chat);
  return result.ok;
}

export async function deleteChat(jid: string) {
  await kv.delete(["chats", jid]);
}
