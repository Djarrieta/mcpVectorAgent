import { MCPAgent, MCPClient } from "mcp-use";
import { ChatOpenAI } from "@langchain/openai";
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
    // Load config (if present) or fall back to defaults. Users can add more servers in mcp.config.json.
    const config = await loadMCPConfig();

    client = MCPClient.fromDict(config);

    const apiKey = Bun.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error("Provide DEEPSEEK_API_KEY for the MCP agent LLM");
    }

    const modelName = "deepseek-chat";
    const baseURL = "https://api.deepseek.com";

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

// Attempt to load a user-provided MCP config file from project root, merging with defaults.
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
    throw new Error("mcp.config.json must contain a JSON object at the top level");
  }
  if (!parsed.mcpServers || typeof parsed.mcpServers !== "object") {
    throw new Error(
      "mcp.config.json must include a 'mcpServers' object mapping server names to their definitions"
    );
  }
  return parsed;
}

export async function closeMCP(): Promise<void> {
  if (client) {
    await client.closeAllSessions();
  }
  agent = null;
  client = null;
}
