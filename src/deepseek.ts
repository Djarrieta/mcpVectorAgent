/**
 * DeepSeek API client utilities.
 * Minimal wrapper around https://api.deepseek.com/chat/completions
 */
export interface AskOptions {
  /** DeepSeek model name ("deepseek-chat" | "deepseek-coder" | future). */
  model?: string;
  /** Optional system prompt to steer the assistant. */
  systemPrompt?: string;
  /** Sampling temperature (0-2). */
  temperature?: number;
  /** Abort controller to cancel the request. */
  signal?: AbortSignal;
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    finish_reason: string | null;
    message: DeepSeekMessage;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const API_URL = 'https://api.deepseek.com/chat/completions';


export async function askDeepSeek(question: string, opts: AskOptions = {}): Promise<string> {
  if (!question?.trim()) throw new Error('Question is empty');
  const apiKey = Bun.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY env var not set');
  }

  const messages: DeepSeekMessage[] = [];
  if (opts.systemPrompt) {
    messages.push({ role: 'system', content: opts.systemPrompt });
  }
  messages.push({ role: 'user', content: question });

  const body = {
    model: opts.model || 'deepseek-chat',
    messages,
    temperature: opts.temperature ?? 0.7,
    stream: false,
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`DeepSeek API error ${res.status}: ${text || res.statusText}`);
  }

  const data = (await res.json()) as DeepSeekChatCompletionResponse;
  const answer = data.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error('DeepSeek returned empty answer');
  return answer;
}