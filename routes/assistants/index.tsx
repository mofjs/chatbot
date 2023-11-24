import { defineRoute } from "$fresh/src/server/defines.ts";
import { openai } from "../../utils/openai.ts";

export default defineRoute(async (req, ctx) => {
  const page = await openai.beta.assistants.list();
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name & Description</th>
          <th>CreatedAt</th>
        </tr>
      </thead>
      <tbody>
        {page.data.map((a) => (
          <tr>
            <td>{a.id}</td>
            <td>
              <hgroup>
                <h2>{a.name}</h2>
                <p>{a.description}</p>
              </hgroup>
            </td>
            <td>{a.created_at}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
