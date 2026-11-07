import { z } from "zod";

export const ORDER_SOURCES = ["phone", "whatsapp", "walk_in", "website_message"] as const;
export const ORDER_STATUSES = ["new", "confirmed", "in_delivery", "completed", "cancelled"] as const;

export const MAX_ORDER_ITEMS = 50;
export const MAX_ORDER_TOTAL_TZS = 2_000_000_000;

export const orderItemInputSchema = z.object({
  productId: z.string().trim().uuid().optional().nullable(),
  name: z.string().trim().min(1, "Product name is required.").max(120, "Keep the name under 120 characters."),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1.").max(10_000, "Maximum quantity is 10,000."),
  unitPriceTzs: z.coerce.number().int().min(0, "Price cannot be negative.").max(100_000_000, "Unit price exceeds limit."),
});

export const orderInputSchema = z.object({
  customerId: z.string().trim().uuid("Choose a valid customer."),
  source: z.enum(ORDER_SOURCES, { error: "Choose an order source." }),
  messageId: z.string().trim().uuid().optional().nullable(),
  deliveryAddress: z
    .string()
    .trim()
    .max(500, "Keep delivery address under 500 characters.")
    .transform((v) => (v === "" ? null : v)),
  notes: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v)),
  items: z.array(orderItemInputSchema).min(1, "Add at least one item to the order.").max(MAX_ORDER_ITEMS, `At most ${MAX_ORDER_ITEMS} items allowed.`),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type OrderInput = z.infer<typeof orderInputSchema>;
