import { defineRoute } from "$fresh/src/server/defines.ts";
import { get_chats } from "~/utils/chats.ts";

export default defineRoute(async (req, ctx) => {
  const chats = await get_chats();
  return (
    <>
      <a role="button" href="/chats/create">Create</a>
      <table>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">JID</th>
            <th scope="col">Assistant</th>
            <th scope="col">Reply Mode</th>
          </tr>
        </thead>
        <tbody>
          {chats.map((chat, index) => {
            <tr>
              <th scope="row">{index + 1}</th>
              <td>{chat.jid}</td>
              <td>{chat.assistant_id}</td>
              <td>{chat.reply_to}</td>
            </tr>;
          })}
          {!chats.length && (
            <tr>
              <td colSpan={4}>
                <h2 className="text-center">No Data!</h2>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
});
