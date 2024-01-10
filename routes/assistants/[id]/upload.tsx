import { defineRoute, Handlers } from "$fresh/server.ts";
import { Assistant, openai } from "~/utils/openai.ts";

type ContextState = {
  assistant: Assistant;
};

export const handler: Handlers<void, ContextState> = {
  async POST(req, { state: { assistant } }) {
    if (
      assistant.tools.some(({ type }) =>
        type === "code_interpreter" || type === "retrieval"
      )
    ) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (file) {
        const { id: file_id } = await openai.files.create({
          file,
          purpose: "assistants",
        });
        await openai.beta.assistants.files.create(assistant.id, { file_id });
      }
    }
    return Response.redirect(new URL("./", req.url), 303);
  },
};

export default defineRoute<ContextState>((_req, { state: { assistant } }) => {
  if (
    assistant.tools.some(({ type }) =>
      type === "code_interpreter" || type === "retrieval"
    )
  ) {
    return (
      <form action="" method="post" enctype="multipart/form-data">
        <h2>Upload File</h2>
        <input type="file" name="file" id="file-input" />
        <button type="submit">Upload!</button>
      </form>
    );
  } else {
    return (
      <hgroup className="text-center">
        <h2>Assistant Tools are not enabled!</h2>
        <p>
          You should enable <code>Code Interpreter</code> or{" "}
          <code>Retrieval</code> tools in your Assistant settings.
        </p>
      </hgroup>
    );
  }
});
