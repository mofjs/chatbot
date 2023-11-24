import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { env } from "../utils/env.ts";

function basicAuthMiddleware(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const authorization = req.headers.get("authorization");
  if (authorization) {
    const match = authorization.match(/^Basic\s+(.*)$/);
    if (match) {
      const [username, password] = atob(match[1]).split(":");
      if (
        username === env.WEB_ADMIN_USERNAME &&
        password === env.WEB_ADMIN_PASSWORD
      ) return ctx.next();
    }
  }

  return new Response("401 Unauthorized", {
    status: 401,
    statusText: "Unauthorized",
    headers: {
      "www-authenticate": `Basic realm="Admin only."`,
    },
  });
}

export const handler = [basicAuthMiddleware];
