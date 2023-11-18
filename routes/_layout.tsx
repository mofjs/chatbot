import { defineLayout } from "$fresh/server.ts";

export default defineLayout<Record<string, unknown>>(
  (_req, { Component, state }) => {
    const username = state.username as string | undefined;
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
                {username
                  ? <a href="/account">{username}</a>
                  : <a href="/login" role="button">Login</a>}
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
