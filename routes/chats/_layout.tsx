import { defineLayout } from "$fresh/server.ts";

export default defineLayout((_req, { Component }) => {
  return (
    <article className="grid">
      <hgroup>
        <h1>Chats</h1>
        <p>
          Manage <em>Chats</em> this bot should reply to.
        </p>
      </hgroup>
      <hr />
      <Component />
    </article>
  );
});
