import { HumanMessage } from "@langchain/core/messages";
import { getLLMInstance } from "./llmService";
import { type Order, generateOrderSchemaDescription } from "../types/Order";

export async function getStructuredOutput(text: string): Promise<Order> {
  const llm = getLLMInstance();

  const prompt = `
    Eres un asistente experto en extracción de datos. Tu tarea es extraer información de pedidos a partir de un historial  de chan con un cliente.
    
    INSTRUCCIONES:
    1. Responde ÚNICAMENTE con un objeto JSON válido.
    2. Si un dato no está presente en el texto, omite la propiedad, exepto campos obligatorios.
    3. Para 'requiresHumanIntervention': Analiza si el mensaje del cliente es ambiguo, le falta información crítica para el envío, o si expresa una queja/duda que un humano deba revisar.
    4. Los valores de 'price' y 'shippingCost' deben ser números enteros en pesos colombianos (COP).
    5. 'id' debe ser omitido o generado si el contexto lo permite.

    ESTRUCTURA DEL JSON:
    ${generateOrderSchemaDescription()}

    CHAT CON EL CLIENTE:
    "${text}"

    JSON:`;

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
