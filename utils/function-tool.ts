import { z } from "zod";
import { kv } from "~/utils/kv.ts";

export const functionToolSchema = z.object({
  name: z.string().regex(/^[\w-]+/),
  description: z.string().optional(),
  parameters: z.record(z.any()),
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
