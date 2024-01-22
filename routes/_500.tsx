import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";

export default function Error500({ error, codeFrame }: PageProps) {
  return (
    <>
      <Head>
        <title>500 - Internal Server Error</title>
      </Head>
      <article style={{ textAlign: "center" }}>
        <hgroup>
          <h1>Error 500</h1>
          <p>
            Oops!! Something gone wrong, resulting in{" "}
            <code>{(error as Error).message}</code>.
          </p>
          {!!codeFrame && <pre><code>{codeFrame}</code></pre>}
        </hgroup>
        <a href="/">Back to Home!</a>
      </article>
    </>
  );
}
