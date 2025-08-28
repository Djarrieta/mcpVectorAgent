import { askDeepSeek } from './src/deepseek.ts';

async function main() {
	const [, , ...args] = process.argv;
	if (args.length === 0) {
		console.error('Usage: bun run index.ts "Your question here"');
		console.error('Set DEEPSEEK_API_KEY in your environment first.');
		process.exit(1);
	}
	const question = args.join(' ');
	try {
		const answer = await askDeepSeek(question);
		console.log(answer);
	} catch (err) {
		console.error('Error:', (err as Error).message);
		process.exit(1);
	}
}

main();
