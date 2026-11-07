import { and, desc, eq, gte, sql } from "drizzle-orm";
import type { Role } from "@/server/auth/roles";
import { hasRole } from "@/server/auth/roles";
import type { Db } from "@/server/db/client";
import { customers, galleryItems, messages, orders, products } from "@/server/db/schema";

export async function getDashboardData(db: Db, userRole: Role) {
  const canSeeFinancials = hasRole(userRole, "admin");

  // Time boundaries in East Africa Time (UTC+3)
  const now = new Date();
  const eatFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Dar_es_Salaam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayEat = eatFormatter.format(now); // "YYYY-MM-DD"
  const [yearStr, monthStr] = todayEat.split("-");
  const monthStart = new Date(`${yearStr}-${monthStr}-01T00:00:00+03:00`);

  // 30 days ago
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Run queries in parallel
  const [
    unreadMsgsRes,
    newOrdersRes,
    monthOrdersRes,
    monthRevenueRes,
    customersCountRes,
    pubProductsRes,
    pubGalleryRes,
    recentOrders,
    recentMessages,
    dailyThirtyDays,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(messages).where(eq(messages.isRead, false)),
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(eq(orders.status, "new")),
    db.select({ count: sql<number>`count(*)::int` }).from(orders).where(gte(orders.createdAt, monthStart)),
    canSeeFinancials
      ? db
          .select({ sum: sql<number>`coalesce(sum(${orders.totalTzs}), 0)::int` })
          .from(orders)
          .where(and(eq(orders.status, "completed"), gte(orders.completedAt, monthStart)))
      : Promise.resolve([{ sum: 0 }]),
    db.select({ count: sql<number>`count(*)::int` }).from(customers),
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.isPublished, true)),
    db.select({ count: sql<number>`count(*)::int` }).from(galleryItems).where(eq(galleryItems.isPublished, true)),
    db
      .select({
        id: orders.id,
        code: orders.code,
        status: orders.status,
        totalTzs: orders.totalTzs,
        createdAt: orders.createdAt,
        customerName: customers.name,
      })
      .from(orders)
      .innerJoin(customers, eq(customers.id, orders.customerId))
      .orderBy(desc(orders.createdAt))
      .limit(5),
    db
      .select({
        id: messages.id,
        fullName: messages.fullName,
        subject: messages.subject,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .orderBy(desc(messages.createdAt))
      .limit(5),
    db
      .select({
        day: sql<string>`to_char(timezone('Africa/Dar_es_Salaam', ${orders.createdAt}), 'YYYY-MM-DD')`,
        ordersCount: sql<number>`count(*)::int`,
        revenueTzs: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalTzs} else 0 end), 0)::int`,
      })
      .from(orders)
      .where(gte(orders.createdAt, thirtyDaysAgo))
      .groupBy(sql`to_char(timezone('Africa/Dar_es_Salaam', ${orders.createdAt}), 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(timezone('Africa/Dar_es_Salaam', ${orders.createdAt}), 'YYYY-MM-DD')`),
  ]);

  return {
    metrics: {
      unreadMessages: unreadMsgsRes[0]?.count ?? 0,
      newOrders: newOrdersRes[0]?.count ?? 0,
      monthOrders: monthOrdersRes[0]?.count ?? 0,
      monthRevenueTzs: canSeeFinancials ? (monthRevenueRes[0]?.sum ?? 0) : null,
      totalCustomers: customersCountRes[0]?.count ?? 0,
      publishedProducts: pubProductsRes[0]?.count ?? 0,
      publishedGallery: pubGalleryRes[0]?.count ?? 0,
    },
    recentOrders,
    recentMessages,
    dailyThirtyDays,
  };
}
