import { defineLayout } from "$fresh/server.ts";

export default defineLayout((_req, { Component }) => {
  return (
    <article className="grid auth">
      <div>
        <Component />
      </div>
      <div>
      </div>
    </article>
  );
});
