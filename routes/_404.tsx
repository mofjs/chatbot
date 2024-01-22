import { Head } from "$fresh/runtime.ts";
import { PageProps } from "$fresh/server.ts";

export default function Error404({ url }: PageProps) {
  return (
    <>
      <Head>
        <title>404 - Page not found</title>
      </Head>
      <article className="text-center">
        <hgroup>
          <h1>Error 404</h1>
          <p>
            The page <code>{url.toString()}</code>{" "}
            you are looking for is not found. <br />
            Check your link again, or try going to the home page.
          </p>
        </hgroup>
        <a href="/">Back to Home!</a>
      </article>
    </>
  );
}
