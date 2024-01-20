import { FreshContext } from "$fresh/server.ts";
import { getChat } from "~/utils/chats.ts";

export async function handler(_req: Request, ctx: FreshContext) {
  const jid = ctx.params.jid;
  const chat = await getChat(jid);
  if (!chat) return ctx.renderNotFound();
  ctx.state.chat = chat;
  return ctx.next();
}
