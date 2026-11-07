import { type NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { customers, orders } from "@/server/db/schema";
import { audit } from "@/server/services/audit";
import { buildCsv } from "@/server/services/reports";
import { clientIp, userAgent } from "@/server/request";
import { getEnv } from "@/lib/env";
import { desc, eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  let session;
  try {
    session = await requireRole("admin");
  } catch {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const db = getDb();
  const meta = {
    ip: clientIp(request.headers, getEnv().TRUST_PROXY),
    userAgent: userAgent(request.headers),
  };

  if (type === "customers") {
    const rows = await db
      .select({
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        address: customers.address,
        orderCount: sql<number>`coalesce(count(${orders.id}), 0)::int`,
        totalSpent: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalTzs} else 0 end), 0)::int`,
        createdAt: customers.createdAt,
      })
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt));

    const headers = ["Name", "Phone", "Email", "Address", "Completed Orders", "Total Spent (TZS)", "Created At"];
    const data = rows.map((r) => [
      r.name,
      r.phone ?? "",
      r.email ?? "",
      r.address ?? "",
      r.orderCount,
      r.totalSpent,
      r.createdAt.toISOString(),
    ]);

    await audit(db, {
      userId: session.user.id,
      action: "report.exported_customers_csv",
      entityType: "report",
      details: { rowCount: rows.length },
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    const csv = buildCsv(headers, data);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="mnyala-customers.csv"',
      },
    });
  }

  // Default: Orders export
  const rows = await db
    .select({
      code: orders.code,
      customerName: customers.name,
      customerPhone: customers.phone,
      source: orders.source,
      status: orders.status,
      totalTzs: orders.totalTzs,
      deliveryAddress: orders.deliveryAddress,
      createdAt: orders.createdAt,
      completedAt: orders.completedAt,
    })
    .from(orders)
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .orderBy(desc(orders.createdAt));

  const headers = [
    "Order Code",
    "Customer Name",
    "Customer Phone",
    "Source",
    "Status",
    "Total (TZS)",
    "Delivery Address",
    "Created At",
    "Completed At",
  ];

  const data = rows.map((r) => [
    r.code,
    r.customerName,
    r.customerPhone ?? "",
    r.source,
    r.status,
    r.totalTzs,
    r.deliveryAddress ?? "",
    r.createdAt.toISOString(),
    r.completedAt ? r.completedAt.toISOString() : "",
  ]);

  await audit(db, {
    userId: session.user.id,
    action: "report.exported_orders_csv",
    entityType: "report",
    details: { rowCount: rows.length },
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  const csv = buildCsv(headers, data);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="mnyala-orders.csv"',
    },
  });
}
