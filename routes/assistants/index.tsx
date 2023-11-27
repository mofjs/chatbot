import { defineRoute } from "$fresh/src/server/defines.ts";
import { openai } from "~/utils/openai.ts";

export default defineRoute(async (req, ctx) => {
  const page = await openai.beta.assistants.list();
  return (
    <>
      <a role="button" href="/assistants/create">Create new Assistant.</a>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name & Description</th>
            <th scope="col">CreatedAt</th>
          </tr>
        </thead>
        <tbody>
          {page.data.map((a, i) => (
            <tr>
              <th scope="row">{i + 1}</th>
              <td>
                <hgroup>
                  <h2>
                    <a href={`/assistants/${a.id}`}>{a.name}</a>
                  </h2>
                  <p>{a.description}</p>
                </hgroup>
              </td>
              <td>
                {new Date(a.created_at * 1000).toLocaleString("ID-id", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </td>
            </tr>
          ))}
          {!page.data.length && (
            <tr>
              <td colSpan={3}>
                <h2 className="text-center">No Data!</h2>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
});
