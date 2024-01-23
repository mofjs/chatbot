import { z } from "zod";
import { kv } from "~/utils/kv.ts";
import { TextLineStream } from "$std/streams/mod.ts";

export const functionToolSchema = z.object({
  name: z.string().regex(/^[\w-]+$/).max(64),
  description: z.string().optional(),
  parameters: z.string().transform(
    (arg, ctx) => {
      try {
        return z.record(z.any()).parse(JSON.parse(arg));
      } catch (error) {
        if (error instanceof SyntaxError) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: error.message,
            fatal: true,
          });
        }
        if (error instanceof z.ZodError) {
          for (const issue of error.issues) {
            ctx.addIssue(issue);
          }
        }
        return z.NEVER;
      }
    },
  ).or(z.record(z.any())),
  script: z.string(),
});

export type FunctionTool = z.infer<typeof functionToolSchema>;

export async function listFunctionTools() {
  const result = kv.list<FunctionTool>({ prefix: ["function-tools"] });
  const functionTools = [];
  for await (const { value } of result) {
    functionTools.push(value);
  }
  return functionTools;
}

export async function getFunctionTool(name: string) {
  const { value } = await kv.get<FunctionTool>(["function-tools", name]);
  return value;
}

export async function setFunctionTool(value: FunctionTool) {
  await kv.set(["function-tools", value.name], value);
}

export async function deleteFunctionTool(name: string) {
  await kv.delete(["function-tools", name]);
}

export async function execFunctionTool(
  name: string,
  arg: string,
): Promise<string | undefined> {
  const functionTool = await getFunctionTool(name);
  if (!functionTool) return;
  const script = functionTool.script;
  const { success, stdout, stderr } = await denoEval(script, arg).output();
  if (success) {
    return new TextDecoder().decode(stdout);
  } else {
    throw new Error(new TextDecoder().decode(stderr));
  }
}

export function execScriptStream(
  script: string,
  arg: string,
  signal?: AbortSignal,
) {
  const { stdout, stderr } = denoEval(script, arg, signal);
  const { writable, readable } = new TransformStream<string, string>({
    transform(chunk, controller) {
      const cleanedChunk = chunk.replaceAll(
        // deno-lint-ignore no-control-regex
        /\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g,
        "",
      );
      controller.enqueue(cleanedChunk + "\n");
    },
  });
  Promise
    .resolve()
    .then(() => {
      return stdout
        .pipeThrough(new TextDecoderStream(), { signal })
        .pipeThrough(new TextLineStream(), { signal })
        .pipeTo(writable, {
          preventAbort: true,
          preventClose: true,
          signal,
        });
    })
    .then(() => {
      return stderr
        .pipeThrough(new TextDecoderStream(), { signal })
        .pipeThrough(new TextLineStream(), { signal })
        .pipeTo(writable, { signal });
    })
    .catch(console.error);
  return readable;
}

function denoEval(script: string, arg: string, signal?: AbortSignal) {
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["eval", script, arg],
    clearEnv: true,
    stdout: "piped",
    stderr: "piped",
    signal,
  });
  return cmd.spawn();
}
