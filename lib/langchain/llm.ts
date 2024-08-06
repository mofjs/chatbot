import { z } from "zod";

export const providerEnums = [
  "azureai",
  "anthropic",
  "openai",
  "vertexai",
] as const;

type CreateLlmInput = z.infer<typeof CreateLlmInput>;
export const CreateLlmInput = z.object({
  provider: z.enum(providerEnums),
  model: z.string().optional(),
  temperature: z.number().optional(),
})
  .and(z.record(z.any()));

export async function createLlm(input: CreateLlmInput) {
  const { provider, ...fields } = input;
  switch (provider) {
    case "azureai": {
      const { AzureChatOpenAI } = await import("npm:@langchain/openai");
      return new AzureChatOpenAI({ ...fields });
    }
    case "anthropic": {
      const { ChatAnthropic } = await import("npm:@langchain/anthropic");
      return new ChatAnthropic(fields);
    }
    case "openai": {
      const { ChatOpenAI } = await import("npm:@langchain/openai");
      return new ChatOpenAI(fields);
    }
    case "vertexai": {
      const { ChatVertexAI } = await import("npm:@langchain/google-vertexai");
      return new ChatVertexAI(fields);
    }
    default:
      throw new Error("Invalid provider.");
  }
}
