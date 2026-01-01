import { HumanMessage } from "@langchain/core/messages";
import { type Order } from "../types";
import { getLLMInstance } from "./llmService";

export async function getStructuredOutput(text: string): Promise<Order> {
  const llm = getLLMInstance();

  const prompt = `Extract order information from the customer message and respond with ONLY valid JSON in this format:
{
  "customerName": "string",
  "device": "string (e.g., iPhone 13 Pro Max, Samsung Galaxy S21)",
  "designTheme": "string (e.g., Barcelona, Dragon Ball, Nacional)",
  "price": number (base price in COP),
  "shippingCost": number (cost in COP),
  "totalCost": number (price + shippingCost),
  "shippingZone": {
    "city": "string",
    "department": "string",
    "baseCost": number (cost in COP),
    "isRemoteArea": boolean
  },
  "estimatedDeliveryDays": number (3-5 for normal areas, 10 for remote areas)
}

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
