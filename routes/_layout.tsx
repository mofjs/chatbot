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
                <a href="/function-tools">Function Tools</a>
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
            {"Chatbot by "}
            <a
              href="https://github.com/mofjs"
              target="_blank"
              rel="noopener noreferrer"
            >
              MoF.JS
            </a>
          </p>
        </footer>
      </>
    );
  },
);
