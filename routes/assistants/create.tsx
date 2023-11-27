import { Handlers } from "$fresh/server.ts";
import { z } from "zod";
import { openai } from "~/utils/openai.ts";

const DEFAULT_MODEL = "gpt-3.5-turbo";

const assistantCreateSchema = z.object({
  name: z.string().max(256).optional(),
  description: z.string().max(512).optional(),
  instructions: z.string().max(32768).optional(),
  model: z.string(),
});

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await assistantCreateSchema.safeParseAsync(
      Object.fromEntries(formData),
    );
    if (!parseResult.success) {
      return ctx.render({}, { status: 400 });
    }
    await openai.beta.assistants.create(parseResult.data);
    return Response.redirect(new URL("/assistants", req.url), 302);
  },
};

export default async function CreateAssistantPage() {
  const models = await openai.models.list();
  return (
    <>
      <h2>Create a new Assistant</h2>
      <form action="" method="post">
        <label htmlFor="name-input">
          Name
          <input
            type="text"
            name="name"
            id="name-input"
            placeholder="The name of the assistant."
            max={256}
          />
        </label>
        <label htmlFor="description-input">
          Description
          <textarea
            name="description"
            id="description-input"
            placeholder="The description of the assistant."
            cols={80}
            rows={2}
            max={512}
          />
        </label>
        <label htmlFor="instructions-input">
          Instruction
          <textarea
            name="instructions"
            id="instructions-input"
            placeholder="The system instructions that the assistant uses."
            cols={80}
            rows={5}
            max={32768}
          />
        </label>
        <label htmlFor="model-input">
          Model
          <select name="model" id="model-input" defaultValue={DEFAULT_MODEL}>
            {models.data.map((v) => (
              <option value={v.id}>
                {v.id} ({v.owned_by})
              </option>
            ))}
          </select>
        </label>
        <button type="submit">Create!</button>
        <button type="reset" className="contrast">Cancel</button>
      </form>
    </>
  );
}
