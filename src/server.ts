import { runMCPAgent, closeMCP } from "./mcpAgent";
import { serve } from "bun";

serve({
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname !== "/ask" || req.method !== "GET") {
      return new Response("Not found", { status: 404 });
    }
    const question = url.searchParams.get("q");
    if (!question) {
      return new Response("Missing 'q' parameter", { status: 400 });
    }
    try {
      const answer = await runMCPAgent(question);
      await closeMCP();
      return new Response(answer, { status: 200 });
    } catch (err) {
      return new Response(`Error: ${(err as Error).message}`, { status: 500 });
    }
  },
  port: 3100,
});

console.log("Bun server running on http://localhost:3100/ask?q=your+question");
