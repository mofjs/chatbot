import { Handlers } from "$fresh/server.ts";
import { openai } from "../../utils/openai.ts";

const DEFAULT_MODEL = "gpt-3.5-turbo";

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    return new Response(null, { headers: { location: "/assistants" } });
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
      </form>
    </>
  );
}
