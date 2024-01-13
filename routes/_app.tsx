import { defineApp } from "$fresh/server.ts";

export default defineApp((_req, { Component }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Chatbot</title>
      <link rel="stylesheet" href="/pico.min.css" />
      <link rel="stylesheet" href="/style.css" />
      <script src="/vs/loader.js" defer></script>
    </head>
    <body>
      <Component />
    </body>
  </html>
));
