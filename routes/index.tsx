export default function Home() {
  return (
    <article className="grid">
      <div>
        <hgroup>
          <h1>Dashboard</h1>
          <p>
            Overview chatbot usage.
          </p>
        </hgroup>
        <hr />
        <section id="assistants">
          <h2>Assistants</h2>
          <ul>
            <li>
              <a href="/assistants">Manage Assistants</a>
            </li>
            <li>
              <a href="/assistants/create">Create a new Assistant</a>
            </li>
          </ul>
        </section>
        <section id="chats">
          <h2>Chats</h2>
          <ul>
            <li>
              <a href="/chats">Manage Chats</a>
            </li>
            <li>
              <a href="/chats/create">Create a new Chat</a>
            </li>
          </ul>
        </section>
        <section id="function-tools">
          <h2>Function Tools</h2>
          <ul>
            <li>
              <a href="/function-tools">Manage Function Tools</a>
            </li>
            <li>
              <a href="/function-tools/create">Create a Function Tool</a>
            </li>
            <li>
              <a href="/function-tools/playground">Script Playground</a>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
