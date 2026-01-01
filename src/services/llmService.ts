import { ChatOpenAI } from "@langchain/openai";

/**
 * Singleton LLM service that provides a shared ChatOpenAI instance
 * to avoid creating multiple instances across the application
 */
let instance: ChatOpenAI | null = null;

export function getLLMInstance(): ChatOpenAI {
  if (!instance) {
    const apiKey = Bun.env.DEEPSEEK_API_KEY;
    const modelName = Bun.env.DEEPSEEK_MODEL;
    const baseURL = Bun.env.DEEPSEEK_BASE_URL;

    if (!apiKey) throw new Error("Missing required env var: DEEPSEEK_API_KEY");
    if (!modelName) throw new Error("Missing required env var: DEEPSEEK_MODEL");

    instance = new ChatOpenAI({
      modelName,
      temperature: 0.2,
      apiKey,
      configuration: baseURL ? { baseURL } : undefined,
    });
  }
  return instance;
}

export function resetLLMInstance(): void {
  instance = null;
}
