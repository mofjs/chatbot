import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { z } from "zod";

export const messageTypeEnums = [
  "human",
  "ai",
  "generic",
  "system",
  "function",
  "tool",
  "user",
  "assistant",
  "placeholder",
] as const;

type CreatePromptInput = z.infer<typeof CreatePromptInput>;
export const CreatePromptInput = z.union([
  z.object({ type: z.literal("hub"), repo: z.string() }),
  z.object({
    type: z.literal("message"),
    messages: z.array(z.tuple([z.enum(messageTypeEnums), z.string()])),
  }),
]);

export async function createPrompt(input: CreatePromptInput) {
  if (input.type === "hub") {
    return await pull<ChatPromptTemplate>(input.repo);
  } else {
    return ChatPromptTemplate.fromMessages(input.messages);
  }
}
