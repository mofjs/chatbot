import { define } from "~/utils/define.ts";

export default define.page(({ Component }) => (
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
            <a href="/chats">Chats</a>
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
));
