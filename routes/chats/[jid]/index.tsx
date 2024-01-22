import { defineRoute } from "$fresh/server.ts";
import { Chat } from "~/utils/chats.ts";
import { openai } from "~/utils/openai.ts";
import { formatDateTime } from "~/utils/format.ts";

type ContextState = {
  chat: Chat;
};

export default defineRoute<ContextState>(async (_req, { state: { chat } }) => {
  const messages =
    (await openai.beta.threads.messages.list(chat.thread_id)).data;
  const assistant = await openai.beta.assistants.retrieve(chat.assistant_id)
    .catch(() => null);
  return (
    <>
      <section>
        <div className="grid">
          <h2>Chat</h2>
          <div />
          <a href={`/chats/${chat.jid}/edit`} role="button">Edit</a>
        </div>
        <hr />
        <table>
          <tbody>
            <tr>
              <th>Name</th>
              <td>:</td>
              <td>{chat.name}</td>
            </tr>
            <tr>
              <th>
                JID
              </th>
              <td>:</td>
              <td>{chat.jid}</td>
            </tr>
            <tr>
              <th>
                Assistant
              </th>
              <td>:</td>
              <td>{assistant?.name ?? <del>Deleted assistant!</del>}</td>
            </tr>
          </tbody>
        </table>
      </section>
      <section>
        <div className="grid">
          <h2>Messages</h2>
        </div>
        <hr />
        <table>
          <thead>
            <th scope="col">#</th>
            <th scope="col">Role</th>
            <th scope="col">Content</th>
            <th scope="col">Created At</th>
          </thead>
          <tbody>
            {messages.map((message, i) => (
              <tr>
                <th scope="row">{i + 1}</th>
                <td>{message.role}</td>
                <td>
                  {message.content.map((c) =>
                    c.type == "text" && c.text.value || "[Image]"
                  ).join("\n")}
                </td>
                <td>
                  {formatDateTime(message.created_at)}
                </td>
              </tr>
            ))}
            {!messages.length && (
              <tr>
                <td colSpan={4}>
                  <h2 className="text-center">No Message!</h2>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );
});
