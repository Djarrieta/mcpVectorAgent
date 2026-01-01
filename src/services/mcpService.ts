import { MCPAgent, MCPClient } from "mcp-use";

import { getLLMInstance } from "./llmService";
import { readFile } from "fs/promises";
import path from "path";

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


async function loadMCPConfig() {
  const cwd = process.cwd();
  const file = path.join(cwd, "mcp.config.json");
  let raw: string;
  try {
    raw = await readFile(file, "utf8");
  } catch (err) {
    throw new Error(
      "Required mcp.config.json not found in project root. Please create it to define mcpServers."
    );
  }

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      "Invalid JSON in mcp.config.json: " + (err as Error).message
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error(
      "mcp.config.json must contain a JSON object at the top level"
    );
  }
  if (!parsed.mcpServers || typeof parsed.mcpServers !== "object") {
    throw new Error(
      "mcp.config.json must include a 'mcpServers' object mapping server names to their definitions"
    );
  }
  return parsed;
}
