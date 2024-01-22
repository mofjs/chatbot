import { defineRoute, Handlers } from "$fresh/server.ts";
import { openai } from "~/utils/openai.ts";
import DeleteButton from "~/islands/DeleteButton.tsx";
import { formatDateTime } from "~/utils/format.ts";

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
                  {formatDateTime(a.created_at)}
                </td>
                <td>
                  <a
                    href={"/assistants/" + a.id}
                    role="button"
                    className="m-1"
                    data-tooltip="View"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                    </svg>
                  </a>
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
                  <a
                    href={"/assistants/" + a.id + "/upload"}
                    role="button"
                    className="m-1"
                    data-tooltip="Upload"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
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
