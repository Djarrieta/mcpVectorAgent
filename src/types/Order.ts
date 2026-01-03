import { z } from 'zod';

export const ShippingZoneSchema = z.object({
  city: z.string(),
  department: z.string(),
  baseCost: z.number(),
  isRemoteArea: z.boolean(),
});

export type ShippingZone = z.infer<typeof ShippingZoneSchema>;

export const OrderSchema = z.object({
  userName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  device: z.string().describe("e.g., iPhone 13 Pro Max, Samsung Galaxy S21"),
  designTheme: z.string().describe("e.g., Barcelona, Dragon Ball, Nacional"),
  price: z.number().describe("base price in COP"),
  shippingCost: z.number().describe("cost in COP"),
  totalCost: z.number().describe("price + shippingCost"), // Added totalCost to match prompt requirement
  department: z.string(),
  city: z.string(),
  address: z.string(),
  shippingZone: ShippingZoneSchema,
  estimatedDeliveryDays: z.number().describe("3-5 for normal areas, 10 for remote areas"),
  requiresHumanIntervention: z.boolean().describe("true if something is unclear or needs human attention, otherwise false"),
});

export type Order = z.infer<typeof OrderSchema>;

export function generateOrderSchemaDescription(): string {
  function describeSchema(schema: z.ZodTypeAny, indentLevel: number = 0): string {
    const indent = "  ".repeat(indentLevel);
    
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape;
      const lines = Object.entries(shape).map(([key, value]) => {
        return `${indent}  "${key}": ${describeSchema(value as z.ZodTypeAny, indentLevel + 1)}`;
      });
      return `{\n${lines.join(',\n')}\n${indent}}`;
    }
    
    let typeName = "unknown";
    if (schema instanceof z.ZodString) typeName = "string";
    else if (schema instanceof z.ZodNumber) typeName = "number";
    else if (schema instanceof z.ZodBoolean) typeName = "boolean";
    
    const description = schema.description ? ` (${schema.description})` : "";
    return `${typeName}${description}`;
  }

  return describeSchema(OrderSchema);
}
