import { FreshContext } from "$fresh/server.ts";
import { getFunctionTool } from "~/utils/function-tool.ts";

export async function handler(_req: Request, ctx: FreshContext) {
  const functionName = ctx.params.name;
  const functionTool = await getFunctionTool(functionName);
  if (!functionTool) return ctx.renderNotFound();
  ctx.state.functionTool = functionTool;
  return ctx.next();
}
