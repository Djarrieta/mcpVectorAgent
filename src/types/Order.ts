import { z } from 'zod';


export const OrderSchema = z.object({
  id: z.number().optional(),
  userId: z.string(),
  userName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  device: z.string().describe("e.g., iPhone 13 Pro Max, Samsung Galaxy S21"),
  price: z.number().describe("base price in COP"),
  shippingCost: z.number().describe("cost in COP"),
  department: z.string(),
  city: z.string(),
  address: z.string(),
  estimatedDeliveryDays: z.number().describe("3-5 for normal areas, 10 for remote areas"),
  requiresHumanIntervention: z.boolean().describe("true if something is unclear or needs human attention, otherwise false"),
  state: z.enum(['inprogress', 'canceled', "accepted", "paid", "shipped", 'delivered']).default('inprogress').describe("The state of the order. inprogress, canceled, accepted, paid, shipped, delivered. canceled means the user is not interested in the order anymore"),
  media: z.array(z.string()).optional().describe("List of image URLs sent by the user"),
}).partial() // Makes everything optional
  .required({
    id: true,
    requiresHumanIntervention: true,
    userId: true,
    state: true,
  });;

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
    else if (schema instanceof z.ZodEnum) typeName = `enum: ${schema.options.join(', ')}`;

    const description = schema.description ? ` (${schema.description})` : "";
    return `${typeName}${description}`;
  }

  return describeSchema(OrderSchema);
}
