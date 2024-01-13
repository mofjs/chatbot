import { IS_BROWSER } from "$fresh/runtime.ts";
import { createRef, JSX } from "preact";
import { useEffect } from "preact/hooks";
import { Require } from "https://esm.sh/v135/@types/requirejs@2.1.37/index.d.ts";
import Monaco from "https://esm.sh/v135/monaco-editor@0.45.0/esm/vs/editor/editor.api.d.ts";

declare const require: Require;
declare const monaco: typeof Monaco;

type Props = JSX.HTMLAttributes<HTMLTextAreaElement> & {
  language: "json" | "typescript";
};

export default function CodeEditor(props: Props) {
  if (!IS_BROWSER) {
    return (
      <>
        <div />
        <textarea {...props} />
      </>
    );
  }
  const textareaEl = createRef<HTMLTextAreaElement>();
  const divEl = createRef<HTMLDivElement>();
  useEffect(() => {
    if (divEl.current) {
      require.config({ paths: { vs: "/vs" } });
      require(["vs/editor/editor.main"], () => {
        const editor = monaco.editor.create(divEl.current!, {
          value: props.value?.toString(),
          language: props.language,
          theme: "vs-dark",
        }, { name: props.name });
      });
    }
  }, []);
  return (
    <>
      <div ref={divEl} className="monaco-editor-container" />
      <textarea
        ref={textareaEl}
        {...props}
        style={{ display: "none" }}
      />
    </>
  );
}
