import { defineRoute, Handlers } from "$fresh/server.ts";
import { execScriptStream } from "~/utils/function-tool.ts";
import CodeEditor from "~/islands/CodeEditor.tsx";

export const handler: Handlers = {
  async POST(req) {
    // @ts-ignore: implemented in Deno 1.39
    const signal = AbortSignal.any([AbortSignal.timeout(60_000), req.signal]);
    const formData = await req.formData();
    const script = formData.get("script")?.toString() ?? "";
    const argument = formData.get("argument")?.toString() ?? "";
    const readabale = execScriptStream(script, argument, signal);
    return new Response(
      readabale.pipeThrough(new TextEncoderStream(), { signal }),
      {
        headers: {
          "content-type": "text/plain",
          "x-content-type-options": "nosniff",
        },
      },
    );
  },
};

export default defineRoute((req) => {
  const searchParams = new URLSearchParams(req.url);
  return (
    <section>
      <form action="" method="post" target="output-iframe">
        <label htmlFor="argument-input">
          Argument
          <CodeEditor
            id="argument-input"
            name="argument"
            placeholder={`{"name": "MoF.JS"}`}
            cols={80}
            rows={5}
            defaultValue={searchParams.get("argument")?.toString()}
            language="json"
          />
        </label>
        <label htmlFor="script-input">
          Script
          <CodeEditor
            id="script-input"
            name="script"
            placeholder={`console.log("Hello world.");`}
            cols={80}
            rows={5}
            defaultValue={searchParams.get("script")?.toString()}
            language="typescript"
          />
        </label>
        <button type="submit">Run!</button>
      </form>
      <hr />
      <h2>Output</h2>
      <iframe
        srcDoc='<html><head><meta name="color-scheme" content="light dark"></head><body><pre>No data!</pre></body></html>'
        name="output-iframe"
        frameborder="0"
        className="playground-output"
      />
    </section>
  );
});
