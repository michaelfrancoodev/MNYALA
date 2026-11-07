import { desc, eq, ilike, or, sql } from "drizzle-orm";
import type { CustomerInput } from "@/lib/validators/customer";
import type { Db } from "@/server/db/client";
import { customers, orders } from "@/server/db/schema";

export const CUSTOMERS_PAGE_SIZE = 20;

export async function listCustomersAdmin(
  db: Db,
  options: { q?: string; page?: number; pageSize?: number } = {},
) {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? CUSTOMERS_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const q = options.q?.trim();

  const whereClause = q
    ? or(
        ilike(customers.name, `%${q}%`),
        ilike(customers.phone, `%${q}%`),
        ilike(customers.email, `%${q}%`),
        ilike(customers.address, `%${q}%`),
      )
    : undefined;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(customers)
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  // Query customers with their completed orders total and order count
  const rows = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      createdAt: customers.createdAt,
      orderCount: sql<number>`coalesce(count(${orders.id}), 0)::int`,
      totalSpentTzs: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalTzs} else 0 end), 0)::int`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(whereClause)
    .groupBy(customers.id)
    .orderBy(desc(customers.createdAt))
    .limit(pageSize)
    .offset(offset);

  return { items: rows, total, page, pages };
}

export async function getCustomerAdmin(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const [customer] = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      notes: customers.notes,
      createdAt: customers.createdAt,
      updatedAt: customers.updatedAt,
      orderCount: sql<number>`coalesce(count(${orders.id}), 0)::int`,
      totalSpentTzs: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalTzs} else 0 end), 0)::int`,
    })
    .from(customers)
    .leftJoin(orders, eq(orders.customerId, customers.id))
    .where(eq(customers.id, id))
    .groupBy(customers.id);

  if (!customer) return null;

  const customerOrders = await db
    .select({
      id: orders.id,
      code: orders.code,
      status: orders.status,
      source: orders.source,
      totalTzs: orders.totalTzs,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, id))
    .orderBy(desc(orders.createdAt));

  return { ...customer, orders: customerOrders };
}

export async function findCustomerByContact(db: Db, contact: { phone?: string | null; email?: string | null }) {
  const conditions = [];
  if (contact.phone) conditions.push(eq(customers.phone, contact.phone));
  if (contact.email) conditions.push(eq(sql`lower(${customers.email})`, contact.email.toLowerCase()));

  if (conditions.length === 0) return null;
  const [row] = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone, email: customers.email })
    .from(customers)
    .where(or(...conditions))
    .limit(1);

  return row ?? null;
}

export async function createCustomer(db: Db, args: { input: CustomerInput; userId?: string }) {
  const { input, userId } = args;

  // If a customer already exists with this phone or email, update and return existing
  const existing = await findCustomerByContact(db, { phone: input.phone, email: input.email });
  if (existing) {
    const [updated] = await db
      .update(customers)
      .set({
        name: input.name || existing.name,
        address: input.address ?? undefined,
        notes: input.notes ?? undefined,
      })
      .where(eq(customers.id, existing.id))
      .returning();
    return updated!;
  }

  const [row] = await db
    .insert(customers)
    .values({
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      notes: input.notes,
      createdBy: userId,
    })
    .returning();

  return row!;
}

export async function updateCustomer(db: Db, id: string, input: CustomerInput) {
  const [row] = await db
    .update(customers)
    .set({
      name: input.name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      notes: input.notes,
    })
    .where(eq(customers.id, id))
    .returning();

  return row ?? null;
}

export async function deleteCustomer(db: Db, id: string): Promise<"deleted" | "has_orders" | "not_found"> {
  const [orderCheck] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.customerId, id))
    .limit(1);

  if (orderCheck) return "has_orders";

  const rows = await db.delete(customers).where(eq(customers.id, id)).returning({ id: customers.id });
  return rows.length > 0 ? "deleted" : "not_found";
}
