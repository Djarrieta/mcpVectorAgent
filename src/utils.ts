import { readFile } from "fs/promises";
import path from "path";

// Fetch mandatory environment variables with clearer errors.
export function requireEnv(name: string, customMessage?: string): string {
  const val = (Bun.env as Record<string, string | undefined>)[name];
  if (!val) {
    throw new Error(customMessage || `Missing required env var: ${name}`);
  }
  return val;
}

// Attempt to load a user-provided MCP config file from project root, validating structure.
export async function loadMCPConfig() {
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
