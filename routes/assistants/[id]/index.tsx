import { defineRoute } from "$fresh/server.ts";
import { openai } from "~/utils/openai.ts";

export default defineRoute(async (req, ctx) => {
  const assistant_id = ctx.params.id;
  const assistant = await openai.beta.assistants.retrieve(assistant_id);
  const files = await Promise.all(
    assistant.file_ids.map((id) => openai.files.retrieve(id)),
  );

  return (
    <dl>
      <dt>Name</dt>
      <dd>
        <h2>
          {assistant.name}
        </h2>
      </dd>
      <dt>Description</dt>
      <dd dangerouslySetInnerHTML={{ __html: assistant.description ?? "" }} />
      <dt>Model</dt>
      <dd>
        {assistant.model}
      </dd>
      <dt>Instruction</dt>
      <dd>
        <code>{assistant.instructions}</code>
      </dd>
      <dt>Tools</dt>
      <dd>
        <label>
          <input
            type="checkbox"
            role="switch"
            disabled
            defaultChecked={!!assistant.tools.find((t) =>
              t.type == "code_interpreter"
            )}
          />
          Code Interpreter
        </label>
        <label>
          <input
            type="checkbox"
            role="switch"
            disabled
            defaultChecked={!!assistant.tools.find((t) =>
              t.type == "retrieval"
            )}
          />
          Retrieval
        </label>
      </dd>
      <dt>Files</dt>
      <dd>
        <ul>
          {files.map((file) => <li>{file.filename}</li>)}
        </ul>
      </dd>
    </dl>
  );
});
