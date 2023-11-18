import { defineLayout } from "$fresh/server.ts";

export default defineLayout((_req, { Component }) => {
  return (
    <div className="grid" style={{ gridTemplateColumns: "200px auto" }}>
      <aside>
        <nav>
          <ul>
            <li>
              <a href="/">Dashboard</a>
            </li>
            <li>
              <a href="/assistants">Assistants</a>
            </li>
            <li>
              <a href="/chats">Chats</a>
            </li>
            <li>
              <a href="/settings">Settings</a>
            </li>
          </ul>
        </nav>
      </aside>
      <article>
        <Component />
      </article>
    </div>
  );
});
