import { IS_BROWSER } from "$fresh/runtime.ts";
import { createRef, JSX } from "preact";
import { useEffect } from "preact/hooks";

// *.d.ts
import Require from "https://esm.sh/v135/@types/requirejs@2.1.37/index.d.ts";
import Monaco from "https://esm.sh/v135/monaco-editor@0.45.0/esm/vs/editor/editor.api.d.ts";

declare const require: Require;
declare const monaco: typeof Monaco;

const DTS_BASE_URL = `https://deno.land/x/deno@v1.39.4/cli/tsc/dts/`;

type Props = JSX.HTMLAttributes<HTMLTextAreaElement> & {
  language: "json" | "typescript";
};

export default function CodeEditor(props: Props) {
  if (!IS_BROWSER) {
    return (
      <>
        <div>
          <div />
        </div>
        <textarea {...props} />
      </>
    );
  }
  const textareaEl = createRef<HTMLTextAreaElement>();
  const divEl = createRef<HTMLDivElement>();
  useEffect(() => {
    if (divEl.current) {
      require.config({ paths: { vs: "/vs" } });
      require(["vs/editor/editor.main"], async () => {
        if (props.language === "typescript") {
          const libs = [
            "lib.deno.ns.d.ts",
            "lib.dom.d.ts",
            "lib.dom.extras.d.ts",
          ];

          for await (
            const content of libs.map((lib) =>
              fetch(new URL(lib, DTS_BASE_URL)).then((r) => r.text())
            )
          ) {
            monaco.languages.typescript.typescriptDefaults.addExtraLib(
              content,
            );
          }
        }
        const editor = monaco.editor.create(divEl.current!, {
          value: (props.value ?? props.defaultValue)?.toString(),
          language: props.language,
          theme: "vs-dark",
          formatOnType: true,
        });
        const updateValue = () => {
          if (textareaEl.current) {
            const newValue = editor.getValue();
            if (newValue) textareaEl.current.value = newValue;
          }
        };
        editor.onDidChangeModelContent(updateValue);
        updateValue();
      });
    }
  }, [divEl.current]);
  return (
    <>
      <div className="monaco-editor-container">
        <div ref={divEl} />
      </div>
      <textarea
        ref={textareaEl}
        {...props}
        style={{ display: "none" }}
      />
    </>
  );
}
