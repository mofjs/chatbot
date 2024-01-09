import { defineRoute } from "$fresh/src/server/defines.ts";
import { Handlers } from "$fresh/server.ts";
import { deleteChat, getChats } from "~/utils/chats.ts";
import { openai } from "~/utils/openai.ts";

export const handler: Handlers = {
  async POST(req, _ctx) {
    const formData = await req.formData();
    const deleteId = formData.get("delete_id")?.toString();
    if (deleteId) {
      await deleteChat(deleteId);
    }
    return Response.redirect(req.url, 303);
  },
};

export default defineRoute(async (req, ctx) => {
  if (req.method === "POST") {
    const formData = await req.formData();
    const deleteId = formData.get("delete_id")?.toString();
    if (deleteId) {
      await deleteChat(deleteId);
      return Response.redirect(req.url, 303);
    }
  }
  const chats = await getChats();
  const assistantsMap = await openai.beta.assistants.list().then(({ data }) =>
    new Map(data.map((assistant) => [assistant.id, assistant]))
  );
  return (
    <>
      <a role="button" href="/chats/create" className="m-1">Create new chat!</a>
      <figure>
        <table className="striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name & JID</th>
              <th scope="col">Assistant</th>
              <th scope="col">Reply Mode</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {chats.map(({ name, jid, assistant_id, reply_to }, index) => (
              <tr>
                <th scope="row">{index + 1}</th>
                <td>
                  <p>
                    <strong>{name}</strong>
                    <br />
                    <small>{jid}</small>
                  </p>
                </td>
                <td>{assistantsMap.get(assistant_id)?.name}</td>
                <td>{reply_to.replaceAll("_", " ").toUpperCase()}</td>
                <td>
                  <form action="" method="post">
                    <a
                      href={"/chats/" + jid + "/edit"}
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
                    <button
                      name="delete_id"
                      value={jid}
                      className="m-1"
                      data-tooltip="Delete"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5" />
                      </svg>
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!chats.length && (
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
