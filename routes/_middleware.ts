import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { CookieMap, mergeHeaders } from "$std/http/unstable_cookie_map.ts";

async function cookieMiddleware(req: Request, ctx: MiddlewareHandlerContext) {
  if (ctx.destination === "route") {
    ctx.state.cookies = new CookieMap(req, { secure: true });
    const resp = await ctx.next();
    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: mergeHeaders(resp.headers, ctx.state.cookies as CookieMap),
    });
  }
  return ctx.next();
}

async function sessionMiddleware(_req: Request, ctx: MiddlewareHandlerContext) {
  if (ctx.destination === "route" && ctx.state.cookies) {
    const cookies = ctx.state.cookies as CookieMap;
    const sid = cookies.get("sid");
    if (sid) {
      const kv = await Deno.openKv();
      const sessionEntry = await kv.get(["session", sid]);
      if (typeof sessionEntry.value === "string") {
        ctx.state.session = JSON.parse(sessionEntry.value);
      }
      kv.close();
    } else {
      cookies.set("sid", crypto.randomUUID());
    }
  }
  return ctx.next();
}

export const handler = [cookieMiddleware, sessionMiddleware];
