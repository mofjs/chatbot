const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const CHAT_API_URL = "https://api.openai.com/v1/chat/completions";

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
  function_call?: {
    name: string;
    arguments: string;
  };
};

export type ChatFunction = {
  name: string;
  description?: string;
  parameters: Record<string, unknown>;
};

export type ChatOptions = {
  temperature?: number;
  max_tokens?: number;
  user?: string;
};

export type FunctionOptions = {
  functions_definition?: ChatFunction[];
  call_function?: (name: string, args: Record<string, unknown>) => unknown;
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

async function api(
  messages: ChatMessage[],
  functions: ChatFunction[],
  options?: ChatOptions
) {
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      messages,
      functions,
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      ...options,
    }),
  });
  return (await response.json()) as ChatResponse;
}

export async function chat(
  messages: ChatMessage[],
  options?: ChatOptions & FunctionOptions
): Promise<string> {
  if (messages.length > 13) {
    throw new Error("Too in-depth conversation!");
  }
  const { functions_definition, call_function, ...chatOptions } = options ?? {};
  const response = await api(messages, functions_definition ?? [], chatOptions);
  const choice = response.choices.pop();
  if (!choice) throw new Error("No response choices found.");
  const message = choice.message;
  if (message.function_call) {
    const { name, arguments: args } = message.function_call;
    const result = await call_function?.(name, JSON.parse(args));
    messages.push(message);
    messages.push({ role: "function", name, content: JSON.stringify(result) });
    return chat(messages, options);
  }
  if (message.role === "assistant") return message.content;
  throw new Error("No assistant reply.");
}
