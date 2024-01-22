import { defineRoute, Handlers } from "$fresh/server.ts";
import { Assistant, openai } from "~/utils/openai.ts";
import DeleteButton from "~/islands/DeleteButton.tsx";
import { formatDateTime } from "~/utils/format.ts";

type ContextState = {
  assistant: Assistant;
};

export const handler: Handlers<void, ContextState> = {
  async POST(req, { state: { assistant } }) {
    const formData = await req.formData();
    const action = formData.get("action")?.toString();
    if (action === "delete") {
      const fileId = formData.get("file_id")?.toString();
      if (fileId) {
        await openai.beta.assistants.files.del(assistant.id, fileId);
      }
    }
    return Response.redirect(req.url, 303);
  },
};

export default defineRoute<ContextState>(
  async (_req, { state: { assistant } }) => {
    const files = await Promise.all(
      assistant.file_ids.map((id) => openai.files.retrieve(id)),
    );

    return (
      <>
        <section>
          <div className="grid">
            <h2>Overview</h2>
            <div />
            <a href={`/assistants/${assistant.id}/edit`} role="button">Edit</a>
          </div>
          <hr />
          <table>
            <tbody>
              <tr>
                <th>Name</th>
                <td>:</td>
                <td>{assistant.name}</td>
              </tr>
              <tr>
                <th>
                  Description
                </th>
                <td>:</td>
                <td>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: assistant.description ?? "",
                    }}
                  />
                </td>
              </tr>
              <tr>
                <th>Model</th>
                <td>:</td>
                <td>{assistant.model}</td>
              </tr>
              <tr>
                <th>Instructions</th>
                <td>:</td>
                <td>
                  <code>{assistant.instructions}</code>
                </td>
              </tr>
              <tr>
                <th>Tools</th>
                <td>:</td>
                <td>
                  <ul>
                    {assistant.tools.map((tool) => (
                      <li>
                        <div className="grid">
                          {tool.type}
                        </div>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <section>
          <div className="grid">
            <h2>Files</h2>
            <div />
            <a href={`/assistants/${assistant.id}/upload`} role="button">
              Upload
            </a>
          </div>
          <hr />
          <table>
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Filename</th>
                <th scope="col">Purpose</th>
                <th scope="col">Size</th>
                <th scope="col">Created at</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, i) => (
                <tr>
                  <th scope="row">{i + 1}</th>
                  <td>{file.filename}</td>
                  <td>{file.purpose}</td>
                  <td>{file.bytes}</td>
                  <td>{formatDateTime(file.created_at)}</td>
                  <td>
                    <DeleteButton
                      inputs={{ file_id: file.id }}
                      description={file.filename}
                      className="d-inline-block m-1"
                    />
                  </td>
                </tr>
              ))}
              {!files.length && (
                <tr>
                  <td colSpan={6}>
                    <h2 className="text-center">No Files!</h2>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </>
    );
  },
);
