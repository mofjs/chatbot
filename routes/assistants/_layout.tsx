import { defineLayout } from "$fresh/server.ts";

export default defineLayout((_req, { Component }) => {
  return (
    <article>
      <hgroup>
        <h1>Assistants</h1>
        <p>
          Manage <em>Assistants</em> you've created.
        </p>
      </hgroup>
      <hr />
      <Component />
    </article>
  );
});
