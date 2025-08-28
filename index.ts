import { askDeepSeek } from './src/deepseek.ts';
import { runMCPAgent } from './src/mcpAgent.ts';

async function main() {
	const [, , ...args] = process.argv;
	if (args.length === 0) {
		console.error('Usage: bun run index.ts "Your question here"');
		console.error('Set DEEPSEEK_API_KEY in your environment first.');
		process.exit(1);
	}

	// Support a simple flag: --mcp (rest of args form the prompt)
	const mcpFlagIndex = args.indexOf('--mcp');
	const useMcp = mcpFlagIndex !== -1;
	const filtered = useMcp ? args.filter(a => a !== '--mcp') : args;
	const question = filtered.join(' ');
	try {
		if (useMcp) {
			const result = await runMCPAgent(question);
			console.log(result);
		} else {
			const answer = await askDeepSeek(question);
			console.log(answer);
		}
	} catch (err) {
		console.error('Error:', (err as Error).message);
		process.exit(1);
	}
}

main();
