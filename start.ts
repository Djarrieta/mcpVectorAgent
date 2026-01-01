import { closeMCP, runMCPAgent } from "./src/mcpAgent";
import { newChatResponsePromt } from "./src/promts";
const start = async () => {
    try {
        const result = await runMCPAgent(newChatResponsePromt);
        
        console.log( result);
        
        await closeMCP();
        process.exit(0);
    } catch (err) {
        console.error("Error:", (err as Error).message);
        process.exit(1);
    }
}

start();
