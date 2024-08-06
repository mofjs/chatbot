import ModalDialog from "~/islands/ModalDialog.tsx";
import { define } from "~/utils/define.ts";

export default define.page(({ Component, state }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{state.title ?? "Chatbot"}</title>
      <meta name="color-scheme" content="dark light" />
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.orange.min.css"
      />
      <link rel="stylesheet" href="/style.css" />
    </head>
    <body>
      <Component />
      <ModalDialog />
    </body>
  </html>
));
