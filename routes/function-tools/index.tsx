import { defineRoute, Handlers } from "$fresh/server.ts";
import {
  deleteFunctionTool,
  listFunctionTools,
} from "~/utils/function-tool.ts";
import DeleteButton from "~/islands/DeleteButton.tsx";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    const action = formData.get("action")?.toString();
    if (action === "delete") {
      const name = formData.get("name")?.toString();
      if (name) {
        await deleteFunctionTool(name);
      }
    }
    return Response.redirect(req.url, 303);
  },
};

export default defineRoute(async (_req, _ctx) => {
  const functionTools = await listFunctionTools();
  return (
    <>
      <a href="/function-tools/create" role="button" className="m-1">
        Create Function Tool
      </a>
      <figure>
        <table>
          <thead>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Description</th>
            <th scope="col">Actions</th>
          </thead>
          <tbody>
            {functionTools.map((f, i) => (
              <tr>
                <th scope="row">{i + 1}</th>
                <td>{f.name}</td>
                <td>{f.description}</td>
                <td>
                  <a
                    href={"/function-tools/" + f.name + "/edit"}
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
                    inputs={{ name: f.name }}
                    description={`- ${f.name}: ${f.description}`}
                    className="d-inline-block m-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </>
  );
});
