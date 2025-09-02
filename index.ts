import { runMCPAgent, closeMCP } from "./src/mcpAgent.ts";

async function main() {
  const [, , ...args] = process.argv;
  if (args.length === 0) {
    console.error('Usage: bun run index.ts "Your question here"');
    console.error("Set DEEPSEEK_API_KEY in your environment first.");
    process.exit(1);
  }

  const question = args.join(" ");
  try {
    const result = await runMCPAgent(question);
    console.log(result);
    await closeMCP();
    process.exit(0);
  } catch (err) {
    console.error("Error:", (err as Error).message);
    process.exit(1);
  }
}

main();
