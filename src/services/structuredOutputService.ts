import { HumanMessage } from "@langchain/core/messages";
import { getLLMInstance } from "./llmService";
import { type Order, generateOrderSchemaDescription } from "../types/Order";

export async function getStructuredOutput(text: string): Promise<Order> {
  const llm = getLLMInstance();

  const prompt = `Extract order information from the customer message and respond with ONLY valid JSON in this format:
${generateOrderSchemaDescription()}

Customer message: ${text}`;

  try {
    const result = await llm.invoke([new HumanMessage(prompt)]);

    // Parse the JSON response
    const content = typeof result.content === 'string' ? result.content : String(result.content);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!parsed) {
      throw new Error("Failed to parse structured output from model response");
    }

    return parsed as Order;
  } catch (error) {
    console.error("Error in getStructuredOutput:", error);
    throw error;
  }
}
