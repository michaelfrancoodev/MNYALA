import { eq, sql as dsql } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  activityLogs, counters, customers, galleryItems, media, messages, orderItems, orders, products, users,
} from "@/server/db/schema";
import { openTestDb, truncateAll } from "../helpers/db";
import { PG, pgFailure } from "../helpers/pg";

let ctx: Awaited<ReturnType<typeof openTestDb>>;

beforeAll(async () => {
  ctx = await openTestDb();
});
afterAll(async () => {
  await ctx.close();
});
beforeEach(async () => {
  await truncateAll(ctx.sql);
});

const newUser = (email: string) => ({ email, name: "Test", role: "staff" as const });
const newCustomer = (phone: string | null) => ({ name: "Mteja", phone });

async function makeOrder() {
  const [c] = await ctx.db.insert(customers).values(newCustomer("+255758730108")).returning();
  const [o] = await ctx.db
    .insert(orders)
    .values({ code: "MN-2026-0001", customerId: c!.id, source: "phone" })
    .returning();
  return { customer: c!, order: o! };
}

describe("users", () => {
  it("treats email as unique regardless of letter case", async () => {
    await ctx.db.insert(users).values(newUser("Asha@Mnyala.co.tz"));
    const err = await pgFailure(ctx.db.insert(users).values(newUser("asha@mnyala.co.tz")));
    expect(err.code).toBe(PG.unique);
    expect(err.constraint).toBe("users_email_lower_key");
  });

  it("defaults to the least-privileged role and active", async () => {
    const [u] = await ctx.db.insert(users).values({ email: "a@b.co", name: "A" }).returning();
    expect(u?.role).toBe("staff");
    expect(u?.isActive).toBe(true);
    expect(u?.passwordHash).toBeNull();
  });

  it("rejects an invalid role", async () => {
    const err = await pgFailure(ctx.db.execute(dsql`insert into users (email, name, role) values ('x@y.co', 'X', 'owner')`));
    expect(err.code).toBe(PG.invalidEnum);
  });
});

describe("products", () => {
  const base = { slug: "mkaa", name: "Mkaa", category: "charcoal" as const, summary: "s" };

  it("rejects a negative price", async () => {
    const err = await pgFailure(ctx.db.insert(products).values({ ...base, priceTzs: -1 }));
    expect(err.code).toBe(PG.check);
    expect(err.constraint).toBe("products_price_non_negative");
  });

  it("allows no price at all (contact us for the price) and starts unpublished with no features", async () => {
    const [p] = await ctx.db.insert(products).values(base).returning();
    expect(p?.priceTzs).toBeNull();
    expect(p?.isPublished).toBe(false);
    expect(p?.features).toEqual([]);
  });

  it("keeps slugs unique", async () => {
    await ctx.db.insert(products).values(base);
    expect((await pgFailure(ctx.db.insert(products).values(base))).code).toBe(PG.unique);
  });
});

describe("customers", () => {
  it("allows many customers without a phone but never two with the same phone", async () => {
    await ctx.db.insert(customers).values(newCustomer(null));
    await ctx.db.insert(customers).values(newCustomer(null));
    await ctx.db.insert(customers).values(newCustomer("+255700000001"));
    const err = await pgFailure(ctx.db.insert(customers).values(newCustomer("+255700000001")));
    expect(err.code).toBe(PG.unique);
    expect(err.constraint).toBe("customers_phone_key");
  });
});

describe("orders and order items", () => {
  it("refuses to delete a customer who has orders", async () => {
    const { customer } = await makeOrder();
    const err = await pgFailure(ctx.db.delete(customers).where(eq(customers.id, customer.id)));
    expect(err.code).toBe(PG.restrict);
  });

  it("keeps order codes unique", async () => {
    const { customer } = await makeOrder();
    const err = await pgFailure(
      ctx.db.insert(orders).values({ code: "MN-2026-0001", customerId: customer.id, source: "phone" }),
    );
    expect(err.code).toBe(PG.unique);
  });

  it("rejects a line total that does not equal quantity x unit price (tampering guard)", async () => {
    const { order } = await makeOrder();
    const err = await pgFailure(
      ctx.db.insert(orderItems).values({
        orderId: order.id, nameSnapshot: "Mkaa 5kg", quantity: 3, unitPriceTzs: 10000, lineTotalTzs: 1,
      }),
    );
    expect(err.code).toBe(PG.check);
    expect(err.constraint).toBe("order_items_line_total_matches");
  });

  it("rejects zero or negative quantity", async () => {
    const { order } = await makeOrder();
    for (const quantity of [0, -2]) {
      const err = await pgFailure(
        ctx.db.insert(orderItems).values({
          orderId: order.id, nameSnapshot: "x", quantity, unitPriceTzs: 100, lineTotalTzs: quantity * 100,
        }),
      );
      expect(err.code).toBe(PG.check);
    }
  });

  it("accepts a consistent line and cascades when the order is deleted", async () => {
    const { order } = await makeOrder();
    await ctx.db.insert(orderItems).values({
      orderId: order.id, nameSnapshot: "Mkaa 5kg", quantity: 3, unitPriceTzs: 10000, lineTotalTzs: 30000,
    });
    await ctx.db.delete(orders).where(eq(orders.id, order.id));
    expect(await ctx.db.select().from(orderItems)).toHaveLength(0);
  });

  it("keeps order history when a product is deleted (name snapshot survives, product link is cleared)", async () => {
    const { order } = await makeOrder();
    const [p] = await ctx.db.insert(products).values({ slug: "p", name: "P", category: "seeds", summary: "s" }).returning();
    await ctx.db.insert(orderItems).values({
      orderId: order.id, productId: p!.id, nameSnapshot: "Mbegu 1kg", quantity: 1, unitPriceTzs: 5000, lineTotalTzs: 5000,
    });
    await ctx.db.delete(products).where(eq(products.id, p!.id));
    const [item] = await ctx.db.select().from(orderItems);
    expect(item?.productId).toBeNull();
    expect(item?.nameSnapshot).toBe("Mbegu 1kg");
  });
});

describe("referential behaviour", () => {
  it("clears messages.product_id when the product is deleted", async () => {
    const [p] = await ctx.db.insert(products).values({ slug: "p", name: "P", category: "stove", summary: "s" }).returning();
    await ctx.db.insert(messages).values({ fullName: "A", email: "a@b.co", body: "habari yako", productId: p!.id });
    await ctx.db.delete(products).where(eq(products.id, p!.id));
    const [m] = await ctx.db.select().from(messages);
    expect(m?.productId).toBeNull();
    expect(m?.subject).toBe("nyingine");
    expect(m?.isRead).toBe(false);
  });

  it("removes gallery items when their image is deleted", async () => {
    const [m] = await ctx.db.insert(media).values({ file: "abc", width: 1, height: 1, bytes: 1, alt: "x" }).returning();
    await ctx.db.insert(galleryItems).values({ mediaId: m!.id, title: "T", category: "product" });
    await ctx.db.delete(media).where(eq(media.id, m!.id));
    expect(await ctx.db.select().from(galleryItems)).toHaveLength(0);
  });

  it("keeps the audit trail when a user is deleted", async () => {
    const [u] = await ctx.db.insert(users).values(newUser("gone@x.co")).returning();
    await ctx.db.insert(activityLogs).values({ userId: u!.id, action: "user.login" });
    await ctx.db.delete(users).where(eq(users.id, u!.id));
    const [log] = await ctx.db.select().from(activityLogs);
    expect(log?.action).toBe("user.login");
    expect(log?.userId).toBeNull();
  });
});

describe("counters (order codes)", () => {
  async function next(key: string): Promise<number> {
    const rows = await ctx.sql<{ value: number }[]>`
      insert into counters (key, value) values (${key}, 1)
      on conflict (key) do update set value = counters.value + 1
      returning value`;
    return rows[0]!.value;
  }

  it("hands out 1..N with no duplicates under 25 concurrent requests", async () => {
    const values = await Promise.all(Array.from({ length: 25 }, () => next("order-2026")));
    expect(new Set(values).size).toBe(25);
    expect([...values].sort((a, b) => a - b)).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
    const [row] = await ctx.db.select().from(counters);
    expect(row?.value).toBe(25);
  });

  it("keeps separate sequences per year", async () => {
    expect(await next("order-2026")).toBe(1);
    expect(await next("order-2027")).toBe(1);
    expect(await next("order-2026")).toBe(2);
  });
});
