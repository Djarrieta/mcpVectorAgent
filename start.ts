import { closeMCP, runMCPAgent } from "./src/mcpAgent";
import { prompt } from "./src/promt";
const start = async () => {
    try {
        const result = await runMCPAgent(prompt);
        console.log( result);
        
        await closeMCP();
        process.exit(0);
    } catch (err) {
        console.error("Error:", (err as Error).message);
        process.exit(1);
    }
}

start();
