import { describe, expect, it } from "vitest";
import { createPublicWhatsAppOrder } from "@/server/actions/public-orders";
import { products } from "@/server/db/schema";
import { getOrderAdmin } from "@/server/services/orders-admin";
import { openTestDb, truncateAll } from "../helpers/db";

describe("createPublicWhatsAppOrder", () => {
  it("creates an order, customer and returns a structured whatsapp url", async () => {
    const { db, sql, close } = await openTestDb();
    try {
      await truncateAll(sql);

      // Create a test product
      const [product] = await db
        .insert(products)
        .values({
          slug: "mkaa-kilo-5",
          category: "charcoal",
          name: "Mkaa wa Mbegu 5kg",
          summary: "Mkaa bora wa mbegu za mbono",
          description: "Mkaa usio na moshi wala harufu",
          priceTzs: 15000,
          priceUnit: "mfuko",
          position: 1,
          isPublished: true,
        })
        .returning();

      const result = await createPublicWhatsAppOrder(
        {
          productId: product.id,
          productName: product.name,
          customerName: "Amina Juma",
          customerPhone: "0758123456",
          deliveryLocation: "Mbeya Mjini, Sae",
          packageSize: "5kg",
          quantity: 2,
          notes: "Tafadhali niletee mchana",
        },
        db,
      );

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.orderCode).toMatch(/^MN-\d{4}-\d{4}$/);
      expect(result.whatsappUrl).toContain("https://wa.me/");
      expect(result.whatsappUrl).toContain(encodeURIComponent(result.orderCode));

      // Verify order exists in DB via admin service
      const savedOrder = await getOrderAdmin(db, result.orderId!);

      expect(savedOrder).toBeDefined();
      expect(savedOrder?.source).toBe("whatsapp");
      expect(savedOrder?.status).toBe("new");
      expect(savedOrder?.totalTzs).toBe(30000);
      expect(savedOrder?.items.length).toBe(1);
      expect(savedOrder?.customerName).toBe("Amina Juma");
      expect(savedOrder?.customerPhone).toBe("0758123456");
    } finally {
      await close();
    }
  });
});
