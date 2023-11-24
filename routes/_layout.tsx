import { defineLayout } from "$fresh/server.ts";

export default defineLayout<Record<string, unknown>>(
  (_req, { Component }) => {
    return (
      <>
        <header className="container-fluid">
          <nav>
            <ul>
              <li>
                <strong>Chatbot</strong>
              </li>
            </ul>
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
          <hr />
        </header>
        <main className="container-fluid">
          <Component />
        </main>
        <footer className="container-fluid">
          <hr />
          <p>
            Chatbot by <a href="http://github.com/mofjs">MoF.JS</a>
          </p>
        </footer>
      </>
    );
  },
);
