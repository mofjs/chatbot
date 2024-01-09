import { Handler } from "$fresh/server.ts";

export const handler: Handler = (req, _ctx) => {
  return Response.redirect(req.url + "/edit");
};
