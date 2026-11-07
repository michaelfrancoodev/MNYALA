import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { MAX_ORDER_ITEMS, MAX_ORDER_TOTAL_TZS, type OrderInput } from "@/lib/validators/order";
import type { Db, Tx } from "@/server/db/client";
import { counters, customers, orderItems, orders, type orderStatus } from "@/server/db/schema";

export const ORDERS_PAGE_SIZE = 20;
export const ORDER_TABS = ["all", "new", "confirmed", "in_delivery", "completed", "cancelled"] as const;
export type OrderTab = (typeof ORDER_TABS)[number];

export type OrderStatus = (typeof orderStatus.enumValues)[number];

export class OrderRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrderRuleError";
  }
}

/** Atomically issue code MN-YYYY-XXXX inside the current transaction */
export async function nextOrderCode(tx: Tx | Db): Promise<string> {
  const year = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Dar_es_Salaam", year: "numeric" }).format(new Date());
  const counterKey = `order-${year}`;
  const [row] = await tx
    .insert(counters)
    .values({ key: counterKey, value: 1 })
    .onConflictDoUpdate({
      target: counters.key,
      set: { value: sql`${counters.value} + 1` },
    })
    .returning({ value: counters.value });

  const seq = String(row!.value).padStart(4, "0");
  return `MN-${year}-${seq}`;
}

export async function orderCounts(db: Db): Promise<Record<OrderTab, number>> {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(orders.status);

  const initial: Record<OrderTab, number> = {
    all: 0,
    new: 0,
    confirmed: 0,
    in_delivery: 0,
    completed: 0,
    cancelled: 0,
  };

  for (const r of rows) {
    if (r.status in initial) {
      initial[r.status as OrderTab] = r.count;
      initial.all += r.count;
    }
  }

  return initial;
}

export async function listOrdersAdmin(
  db: Db,
  options: { tab?: OrderTab; q?: string; page?: number; pageSize?: number } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? ORDERS_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const tab = options.tab ?? "all";
  const q = options.q?.trim();

  const conditions = [];
  if (tab !== "all") {
    conditions.push(eq(orders.status, tab));
  }
  if (q) {
    conditions.push(
      or(
        ilike(orders.code, `%${q}%`),
        ilike(customers.name, `%${q}%`),
        ilike(customers.phone, `%${q}%`),
      ),
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const items = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      source: orders.source,
      totalTzs: orders.totalTzs,
      deliveryAddress: orders.deliveryAddress,
      createdAt: orders.createdAt,
      customerId: customers.id,
      customerName: customers.name,
      customerPhone: customers.phone,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(whereClause)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { items, total, page, pages };
}

export async function getOrderAdmin(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const [order] = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      source: orders.source,
      totalTzs: orders.totalTzs,
      deliveryAddress: orders.deliveryAddress,
      notes: orders.notes,
      messageId: orders.messageId,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      completedAt: orders.completedAt,
      cancelledAt: orders.cancelledAt,
      customerId: customers.id,
      customerName: customers.name,
      customerPhone: customers.phone,
      customerEmail: customers.email,
      customerAddress: customers.address,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(eq(orders.id, id));

  if (!order) return null;

  const items = await db
    .select({
      id: orderItems.id,
      productId: orderItems.productId,
      nameSnapshot: orderItems.nameSnapshot,
      position: orderItems.position,
      quantity: orderItems.quantity,
      unitPriceTzs: orderItems.unitPriceTzs,
      lineTotalTzs: orderItems.lineTotalTzs,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, id))
    .orderBy(asc(orderItems.position));

  return { ...order, items };
}

export async function createOrder(
  db: Db,
  args: { input: OrderInput; userId?: string },
) {
  const { input, userId } = args;

  if (input.items.length === 0) throw new OrderRuleError("An order must have at least one line item.");
  if (input.items.length > MAX_ORDER_ITEMS) throw new OrderRuleError(`An order cannot exceed ${MAX_ORDER_ITEMS} items.`);

  // Server always computes line totals and overall total
  let totalTzs = 0;
  const processedItems = input.items.map((it, idx) => {
    const lineTotal = it.quantity * it.unitPriceTzs;
    totalTzs += lineTotal;
    return {
      productId: it.productId ?? null,
      nameSnapshot: it.name,
      position: idx + 1,
      quantity: it.quantity,
      unitPriceTzs: it.unitPriceTzs,
      lineTotalTzs: lineTotal,
    };
  });

  if (totalTzs > MAX_ORDER_TOTAL_TZS) {
    throw new OrderRuleError(`Total order amount cannot exceed TSh ${MAX_ORDER_TOTAL_TZS.toLocaleString()}`);
  }

  return await db.transaction(async (tx) => {
    const code = await nextOrderCode(tx);

    const [order] = await tx
      .insert(orders)
      .values({
        code,
        customerId: input.customerId,
        source: input.source,
        messageId: input.messageId ?? null,
        deliveryAddress: input.deliveryAddress,
        notes: input.notes,
        totalTzs,
        createdBy: userId,
      })
      .returning();

    if (!order) throw new Error("Order creation failed.");

    await tx.insert(orderItems).values(
      processedItems.map((item) => ({
        ...item,
        orderId: order.id,
      })),
    );

    return order;
  });
}

export async function updateOrderItems(
  db: Db,
  args: {
    id: string;
    items: OrderInput["items"];
    deliveryAddress?: string | null;
    notes?: string | null;
  },
) {
  const { id, items, deliveryAddress, notes } = args;

  return await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!current) return null;

    if (current.status !== "new" && current.status !== "confirmed") {
      throw new OrderRuleError("Items can only be edited when an order is in 'new' or 'confirmed' status.");
    }

    if (items.length === 0) throw new OrderRuleError("An order must have at least one line item.");
    if (items.length > MAX_ORDER_ITEMS) throw new OrderRuleError(`An order cannot exceed ${MAX_ORDER_ITEMS} items.`);

    let totalTzs = 0;
    const processedItems = items.map((it, idx) => {
      const lineTotal = it.quantity * it.unitPriceTzs;
      totalTzs += lineTotal;
      return {
        orderId: id,
        productId: it.productId ?? null,
        nameSnapshot: it.name,
        position: idx + 1,
        quantity: it.quantity,
        unitPriceTzs: it.unitPriceTzs,
        lineTotalTzs: lineTotal,
      };
    });

    if (totalTzs > MAX_ORDER_TOTAL_TZS) {
      throw new OrderRuleError(`Total order amount cannot exceed TSh ${MAX_ORDER_TOTAL_TZS.toLocaleString()}`);
    }

    // Delete existing items and insert new items
    await tx.delete(orderItems).where(eq(orderItems.orderId, id));
    await tx.insert(orderItems).values(processedItems);

    const [updated] = await tx
      .update(orders)
      .set({
        totalTzs,
        deliveryAddress: deliveryAddress !== undefined ? deliveryAddress : current.deliveryAddress,
        notes: notes !== undefined ? notes : current.notes,
      })
      .where(eq(orders.id, id))
      .returning();

    return updated ?? null;
  });
}

export async function transitionOrderStatus(
  db: Db,
  args: { id: string; targetStatus: OrderStatus },
) {
  const { id, targetStatus } = args;

  return await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!current) return null;

    const from = current.status;
    const to = targetStatus;

    // Transition validation rules
    const allowed =
      (from === "new" && (to === "confirmed" || to === "cancelled")) ||
      (from === "confirmed" && (to === "in_delivery" || to === "cancelled")) ||
      (from === "in_delivery" && (to === "completed" || to === "cancelled"));

    if (!allowed) {
      throw new OrderRuleError(`Cannot move order status from '${from}' to '${to}'.`);
    }

    const updates: Record<string, unknown> = { status: to };
    if (to === "completed") updates.completedAt = new Date();
    if (to === "cancelled") updates.cancelledAt = new Date();

    const [updated] = await tx.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated ?? null;
  });
}

export async function reopenOrder(
  db: Db,
  args: { id: string; reason: string },
) {
  const { id, reason } = args;
  if (reason.trim().length < 5) {
    throw new OrderRuleError("A reason of at least 5 characters is required to reopen a completed order.");
  }

  return await db.transaction(async (tx) => {
    const [current] = await tx.select().from(orders).where(eq(orders.id, id)).for("update");
    if (!current) return null;
    if (current.status !== "completed") {
      throw new OrderRuleError("Only completed orders can be reopened.");
    }

    const [updated] = await tx
      .update(orders)
      .set({
        status: "confirmed",
        completedAt: null,
      })
      .where(eq(orders.id, id))
      .returning();

    return updated ?? null;
  });
}

export async function deleteOrder(db: Db, id: string): Promise<"deleted" | "invalid_status" | "not_found"> {
  const [current] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, id));
  if (!current) return "not_found";

  if (current.status !== "new" && current.status !== "cancelled") {
    return "invalid_status";
  }

  const rows = await db.delete(orders).where(eq(orders.id, id)).returning({ id: orders.id });
  return rows.length > 0 ? "deleted" : "not_found";
}
