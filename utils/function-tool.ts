import { z } from "zod";
import { kv } from "~/utils/kv.ts";

export const functionToolSchema = z.object({
  name: z.string().regex(/^[\w-]+/).max(64),
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

export const listFunctionTools = async () => {
  const result = kv.list<FunctionTool>({ prefix: ["function-tools"] });
  const functionTools = [];
  for await (const { value } of result) {
    functionTools.push(value);
  }
  return functionTools;
};

export const getFunctionTool = async (name: string) => {
  const { value } = await kv.get<FunctionTool>(["function-tools", name]);
  return value;
};

export const setFunctionTool = async (value: FunctionTool) => {
  await kv.set(["function-tools", value.name], value);
};

export const deleteFunctionTool = async (name: string) => {
  await kv.delete(["function-tools", name]);
};

export const execFunctionTool = async (name: string, args: string) => {
  const functionTool = await getFunctionTool(name);
  if (!functionTool) return;
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["eval", functionTool.script, args],
    clearEnv: true,
    stdout: "piped",
    stderr: "piped",
  });
  const { success, stdout, stderr } = await cmd.output();
  if (!success) {
    throw new Error(new TextDecoder().decode(stderr));
  }
  return new TextDecoder().decode(stdout);
};
