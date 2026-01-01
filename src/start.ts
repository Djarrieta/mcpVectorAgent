import { closeMCP, runMCPAgent } from "./services/mcpService";
import { getStructuredOutput } from "./services/structuredOutputService";
import { newChatResponsePromt } from "./promts";

const start = async () => {
    try {
        const result = await runMCPAgent(newChatResponsePromt);
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
