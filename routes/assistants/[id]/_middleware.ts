import { FreshContext } from "$fresh/server.ts";
import { NotFoundError, openai } from "~/utils/openai.ts";

export async function handler(_req: Request, ctx: FreshContext) {
  const assistantId = ctx.params.id;
  const assistant = await openai.beta.assistants.retrieve(assistantId).catch(
    (error) => {
      if (error instanceof NotFoundError) {
        return null;
      } else {
        throw error;
      }
    },
  );
  if (!assistant) return ctx.renderNotFound();
  ctx.state.assistant = assistant;
  return ctx.next();
}
