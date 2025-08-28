# mcptest

Simple Bun + TypeScript wrapper for DeepSeek chat completions.

## Setup

1. Install deps:

```bash
bun install
```

2. Provide your DeepSeek API key (replace with your key). With Bun you can:

Option A: Temporary for the command

```bash
DEEPSEEK_API_KEY="sk-..." bun run index.ts "Your question"
```

Option B: Export in your shell profile (~/.bashrc, ~/.zshrc, etc.)

```bash
export DEEPSEEK_API_KEY="sk-..."
```

Option C: Use an .env file (Bun automatically loads .env at runtime)

```
echo 'DEEPSEEK_API_KEY=sk-...' > .env
```

## Ask a question

```bash
bun run index.ts "Explain the difference between interfaces and types in TypeScript"
```

or using the convenience script:

```bash
bun run ask "Explain event loop in Bun"
```

## Programmatic usage

```ts
import { askDeepSeek } from "./src/deepseek";

const answer = await askDeepSeek("What is Bun?");
console.log(answer);
```

## Notes

- Uses the `deepseek-chat` model by default.
- Set `DEEPSEEK_API_KEY` via environment (Bun.env) before running.
- Streaming helper `streamDeepSeek()` is available for incremental tokens.

This project was created using `bun init` in bun v1.2.20.
