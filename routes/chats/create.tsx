import { Handlers } from "$fresh/server.ts";
import { z } from "zod";
import { openai } from "~/utils/openai.ts";

const createChatSchema = z.object({
  name: z.string().max(256),
  jid: z.string().max(256)
});

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render();
  },
  async POST(req, ctx) {
    const formData = await req.formData();
    const parseResult = await createChatSchema.safeParseAsync(
      Object.fromEntries(formData),
    );
    if (!parseResult.success) {
      return ctx.render({}, { status: 400 });
    }
    return Response.redirect(new URL("/chats", req.url), 302);
  },
};

export default async function CreateAssistantPage() {
  return (
    <>
      <h2>Create a new Chat</h2>
      <form action="" method="post">
        <label htmlFor="name-input">
          Name
          <input
            type="text"
            name="name"
            id="name-input"
            placeholder="John Doe"
            max={256}
          />
        </label>
        <label htmlFor="jid-input">
          JID
          <input
            type="text"
            name="jid"
            id="jid-input"
            placeholder="@62xxxxx@s.whatsapp.net"
            max={256}
          />
        </label>

        <label htmlFor="assistant-input">
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
