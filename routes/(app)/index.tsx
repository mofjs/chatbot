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
          <a href="/assistants">Manage Assistants</a>
        </section>
        <section id="chats">
          <h2>Chats</h2>
          <a href="/chats">Manage Chats</a>
        </section>
      </div>
    </article>
  );
}
