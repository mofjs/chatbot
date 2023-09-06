import { defineApp } from "$fresh/server.ts";

export default defineApp((_req, { Component }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>My Chatbot</title>
      <link rel="stylesheet" href="/pico.min.css" />
    </head>
    <body>
      <nav className="container-fluid">
        <ul>
          <li>
            <a href="/" className="contrast">
              <strong>
                My Chatbot
              </strong>
            </a>
          </li>
        </ul>
      </nav>
      <main className="container">
        <Component />
      </main>
    </body>
  </html>
));
