import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { Db } from "@/server/db/client";
import { customers, orderItems, orders } from "@/server/db/schema";

export type ReportPeriod = "7d" | "30d" | "this_month" | "last_month" | "year" | "custom";

export function resolveDateRange(period: ReportPeriod, customFrom?: string, customTo?: string): { from: Date; to: Date; label: string } {
  const now = new Date();
  const eatFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Dar_es_Salaam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = eatFormatter.format(now);
  const [currentYear, currentMonth] = todayStr.split("-").map(Number) as [number, number];

  if (period === "7d") {
    const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { from, to: now, label: "Last 7 Days" };
  }

  if (period === "this_month") {
    const mStr = String(currentMonth).padStart(2, "0");
    const from = new Date(`${currentYear}-${mStr}-01T00:00:00+03:00`);
    return { from, to: now, label: "This Month" };
  }

  if (period === "last_month") {
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const pStr = String(prevMonth).padStart(2, "0");
    const from = new Date(`${prevYear}-${pStr}-01T00:00:00+03:00`);
    const cStr = String(currentMonth).padStart(2, "0");
    const to = new Date(`${currentYear}-${cStr}-01T00:00:00+03:00`);
    return { from, to, label: "Last Month" };
  }

  if (period === "year") {
    const from = new Date(`${currentYear}-01-01T00:00:00+03:00`);
    return { from, to: now, label: "This Year" };
  }

  if (period === "custom" && customFrom && customTo) {
    const parsedFrom = new Date(`${customFrom}T00:00:00+03:00`);
    const parsedTo = new Date(`${customTo}T23:59:59+03:00`);
    if (!Number.isNaN(parsedFrom.getTime()) && !Number.isNaN(parsedTo.getTime()) && parsedFrom <= parsedTo) {
      return { from: parsedFrom, to: parsedTo, label: `${customFrom} to ${customTo}` };
    }
  }

  // Default: 30 days
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from, to: now, label: "Last 30 Days" };
}

export async function getReportsData(db: Db, range: { from: Date; to: Date }) {
  const { from, to } = range;

  // 1. Revenue & completed orders
  const [revenueResult] = await db
    .select({
      completedOrdersCount: sql<number>`count(*)::int`,
      totalRevenueTzs: sql<number>`coalesce(sum(${orders.totalTzs}), 0)::int`,
    })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.completedAt, from), lt(orders.completedAt, to)));

  const completedCount = revenueResult?.completedOrdersCount ?? 0;
  const totalRevenue = revenueResult?.totalRevenueTzs ?? 0;
  const averageOrderValue = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;

  // 2. Orders placed in period by status
  const ordersByStatus = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
      totalAmount: sql<number>`coalesce(sum(${orders.totalTzs}), 0)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, from), lt(orders.createdAt, to)))
    .groupBy(orders.status);

  // 3. Orders placed in period by source
  const ordersBySource = await db
    .select({
      source: orders.source,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, from), lt(orders.createdAt, to)))
    .groupBy(orders.source);

  // 4. New customers registered in period
  const [customersResult] = await db
    .select({ newCustomersCount: sql<number>`count(*)::int` })
    .from(customers)
    .where(and(gte(customers.createdAt, from), lt(customers.createdAt, to)));

  // 5. Top selling products
  const topProducts = await db
    .select({
      name: orderItems.nameSnapshot,
      unitsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
      totalRevenue: sql<number>`coalesce(sum(${orderItems.lineTotalTzs}), 0)::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.status, "completed"), gte(orders.completedAt, from), lt(orders.completedAt, to)))
    .groupBy(orderItems.nameSnapshot)
    .orderBy(desc(sql`sum(${orderItems.lineTotalTzs})`))
    .limit(10);

  // 6. Daily trend (revenue and orders)
  const dailyTrend = await db
    .select({
      day: sql<string>`to_char(timezone('Africa/Dar_es_Salaam', ${orders.completedAt}), 'YYYY-MM-DD')`,
      completedCount: sql<number>`count(*)::int`,
      revenueTzs: sql<number>`coalesce(sum(${orders.totalTzs}), 0)::int`,
    })
    .from(orders)
    .where(and(eq(orders.status, "completed"), gte(orders.completedAt, from), lt(orders.completedAt, to)))
    .groupBy(sql`to_char(timezone('Africa/Dar_es_Salaam', ${orders.completedAt}), 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(timezone('Africa/Dar_es_Salaam', ${orders.completedAt}), 'YYYY-MM-DD')`);

  return {
    totalRevenue,
    completedCount,
    averageOrderValue,
    newCustomersCount: customersResult?.newCustomersCount ?? 0,
    ordersByStatus,
    ordersBySource,
    topProducts,
    dailyTrend,
  };
}

/** Protect against CSV Formula Injection in Excel/Sheets */
export function sanitizeCsvCell(value: unknown): string {
  if (value == null) return "";
  let str = String(value);
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvCell).join(",");
  const rowLines = rows.map((r) => r.map(sanitizeCsvCell).join(","));
  // Prepend UTF-8 BOM so Excel opens with proper encoding, use CRLF
  return "\uFEFF" + [headerLine, ...rowLines].join("\r\n") + "\r\n";
}
