import { closeMCP, runMCPAgent } from "./src/mcpAgent";
import { newChatResponsePromt } from "./src/promts";
import { getStructuredOutput } from "./src/structuredOutput";
const start = async () => {
    try {
        const result = await runMCPAgent(newChatResponsePromt);
        console.log( result);
        const formattedResult=await getStructuredOutput(newChatResponsePromt + result);
       
       console.log( formattedResult);
       
        await closeMCP();
        process.exit(0);
    } catch (err) {
        console.error("Error:", (err as Error).message);
        process.exit(1);
    }
}

start();
