import { HttpError } from "fresh";
import { define } from "~/utils/define.ts";

export default define.page(({ error, state, url }) => {
  const [statusCode, statusText] = (error instanceof HttpError)
    ? [error.status, error.message]
    : [500, "Internal Server Error"];
  const stack = (error as Error).stack ?? "Unknown stack.";
  state.title = `Error ${statusCode} - ${statusText}`;
  return (
    <article style={{ textAlign: "center" }}>
      <hgroup>
        <h1>Error {statusCode} - {statusText}</h1>
        {statusCode === 404
          ? (
            <p>
              The page <code>{url.toString()}</code>
              you are looking for is not found. <br />
              Check your link again, or try going to the home page.
            </p>
          )
          : (
            <p>
              Oops!! Something gone wrong, resulting in:
              <pre><code>{stack}</code></pre>
            </p>
          )}
      </hgroup>
      <a href="/">Back to Home!</a>
    </article>
  );
});
