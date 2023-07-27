const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const CHAT_API_URL = "https://api.openai.com/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  function_call?: Record<string, unknown>;
};

export type ChatOptions = {
  temperature?: number;
  max_tokens?: number;
  user?: string;
};

export type ChatResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  choices: {
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }[];
};

export async function chat(messages: ChatMessage[], options?: ChatOptions) {
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      messages: messages,
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      ...options,
    }),
  });
  return (await response.json()) as ChatResponse;
}
