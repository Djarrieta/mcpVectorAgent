import { MCPAgent, MCPClient } from 'mcp-use';
import { ChatOpenAI } from '@langchain/openai';


let agent: MCPAgent | null = null;
let client: MCPClient | null = null;

export interface MCPResultOptions {
  maxSteps?: number;
}

export async function runMCPAgent(prompt: string, opts: MCPResultOptions = {}): Promise<string> {
  if (!prompt?.trim()) throw new Error('Prompt empty');
  if (!agent) {
    // Minimal config: user can extend via mcp-config.json later
    let config = {
      mcpServers: {
        // Provide one example "everything" server (lazy npx). User must have network access.
        everything: { command: 'npx', args: ['-y', '@modelcontextprotocol/server-everything'] }
      }
    };
    // If user supplies a JSON file path via MCP_CONFIG, load it instead
    const cfgPath = Bun.env.MCP_CONFIG;
    if (cfgPath) {
      try {
        const text = await Bun.file(cfgPath).text();
        config = JSON.parse(text);
      } catch (e) {
        console.warn('[mcpAgent] Failed to read MCP_CONFIG file, using default. Error:', (e as Error).message);
      }
    }
    client = MCPClient.fromDict(config);

    const apiKey = Bun.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('Provide DEEPSEEK_API_KEY for the MCP agent LLM');
    }

    const modelName ='deepseek-chat'
    const baseURL = 'https://api.deepseek.com'

    const llm = new ChatOpenAI({
      modelName,
      temperature: 0.2,
      apiKey, 
      configuration: baseURL ? { baseURL } : undefined
    } ); 

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
