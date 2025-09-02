import { MCPAgent, MCPClient } from "mcp-use";
import { ChatOpenAI } from "@langchain/openai";
import { loadMCPConfig, requireEnv } from "./utils";

let agent: MCPAgent | null = null;
let client: MCPClient | null = null;

const apiKey = requireEnv("DEEPSEEK_API_KEY");
const modelName = requireEnv("DEEPSEEK_MODEL");
const baseURL = requireEnv("DEEPSEEK_BASE_URL");
export interface MCPResultOptions {
  maxSteps?: number;
}

export async function runMCPAgent(
  prompt: string,
  opts: MCPResultOptions = {}
): Promise<string> {
  if (!prompt?.trim()) throw new Error("Prompt empty");
  if (!agent) {
    const config = await loadMCPConfig();
    client = MCPClient.fromDict(config);

    const llm = new ChatOpenAI({
      modelName,
      temperature: 0.2,
      apiKey,
      configuration: baseURL ? { baseURL } : undefined,
    });

    agent = new MCPAgent({ llm, client: client, maxSteps: opts.maxSteps ?? 8 });
  }

  return agent.run(prompt, opts.maxSteps);
}

export async function closeMCP(): Promise<void> {
  if (client) {
    await client.closeAllSessions();
  }
  agent = null;
  client = null;
}
