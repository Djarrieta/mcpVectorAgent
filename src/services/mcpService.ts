import { MCPAgent, MCPClient } from "mcp-use";
import { loadMCPConfig } from "../utils";
import { getLLMInstance } from "./llmService";

let agent: MCPAgent | null = null;
let client: MCPClient | null = null;

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

    const llm = getLLMInstance();

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
