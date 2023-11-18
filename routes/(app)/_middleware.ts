import { MiddlewareHandlerContext } from "$fresh/server.ts";

export function handler(_req: Request, ctx: MiddlewareHandlerContext) {
  if (ctx.destination === "route") {
    if (!ctx.state.username) {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": "/login"
        }
      });
    }
  }
  return ctx.next();
}
