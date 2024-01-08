import { defineRoute } from "$fresh/server.ts";
import { openai } from "~/utils/openai.ts";

export default defineRoute(async (req, ctx) => {
  const id = ctx.params.id;
  const assistant = await openai.beta.assistants.retrieve(id);
  const files = await Promise.all(
    assistant.file_ids.map((id) => openai.files.retrieve(id)),
  );

  return (
    <>
      <section>
        <div className="grid">
          <h2>Overview</h2>
          <div />
          <a href={`/assistants/${id}/edit`} role="button">Edit</a>
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
          <a href={`/assistants/${id}/files`} role="button">Manage</a>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Filename</th>
              <th>Purpose</th>
              <th>Size</th>
              <th>Created at</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file, i) => (
              <tr>
                <th>{i + 1}</th>
                <td>{file.filename}</td>
                <td>{file.purpose}</td>
                <td>{file.bytes}</td>
                <td>{new Date(file.created_at)}</td>
              </tr>
            ))}
            {!files.length && (
              <tr>
                <td colSpan={5}>
                  <h2 className="text-center">No Files!</h2>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
});
