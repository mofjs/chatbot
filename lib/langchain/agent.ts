import {
  AgentExecutor,
  AgentExecutorInput,
  createToolCallingAgent,
  CreateToolCallingAgentParams,
} from "langchain/agents";

export function createAgent(
  { llm, tools, prompt }:
    & CreateToolCallingAgentParams
    & Omit<AgentExecutorInput, "llm">,
) {
  const agent = createToolCallingAgent({ llm, tools, prompt });
  return new AgentExecutor({ agent, tools });
}
