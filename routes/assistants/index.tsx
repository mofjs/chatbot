import { defineRoute, Handlers } from "$fresh/server.ts";
import { openai } from "~/utils/openai.ts";
import DeleteButton from "~/islands/DeleteButton.tsx";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    const action = formData.get("action")?.toString();
    if (action === "delete") {
      const assistantId = formData.get("assistant_id")?.toString();
      if (assistantId) {
        await openai.beta.assistants.del(assistantId);
      }
    }
    return Response.redirect(req.url, 303);
  },
};

export default defineRoute(async (_req, _ctx) => {
  const page = await openai.beta.assistants.list();
  return (
    <>
      <a role="button" href="/assistants/create" className="m-1">
        Create new Assistant.
      </a>
      <figure>
        <table className="striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name & Description</th>
              <th scope="col">Model</th>
              <th scope="col">Created at</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {page.data.map((a, i) => (
              <tr>
                <th scope="row">{i + 1}</th>
                <td>
                  <p>
                    <strong>{a.name}</strong>
                    <br />
                    <small
                      dangerouslySetInnerHTML={{
                        __html: a.description ?? "",
                      }}
                    />
                  </p>
                </td>
                <td>{a.model}</td>
                <td>
                  {new Date(a.created_at * 1000).toLocaleString("id")}
                </td>
                <td>
                  <a
                    href={"/assistants/" + a.id + "/edit"}
                    role="button"
                    className="m-1"
                    data-tooltip="Edit"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                      <path
                        fill-rule="evenodd"
                        d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                      />
                    </svg>
                  </a>
                  <DeleteButton
                    inputs={{ assistant_id: a.id }}
                    description={`- ${a.name} (${a.model})`}
                    className="d-inline-block m-1"
                  />
                </td>
              </tr>
            ))}
            {!page.data.length && (
              <tr>
                <td colSpan={5}>
                  <h2 className="text-center">No Data!</h2>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </figure>
    </>
  );
});
