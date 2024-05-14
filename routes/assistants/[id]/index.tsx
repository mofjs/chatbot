import { defineRoute } from "$fresh/server.ts";
import { Assistant } from "~/utils/openai.ts";

type ContextState = {
  assistant: Assistant;
};

export default defineRoute<ContextState>(
  (_req, { state: { assistant } }) => {
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
      </>
    );
  },
);
