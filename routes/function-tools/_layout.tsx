import { defineLayout } from "$fresh/server.ts";

export default defineLayout((_req, { Component }) => {
  return (
    <article>
      <hgroup>
        <h1>Function Tools</h1>
        <p>
          Manage <em>Function Tools</em> assistants can call.
        </p>
      </hgroup>
      <hr />
      <Component />
    </article>
  );
});
