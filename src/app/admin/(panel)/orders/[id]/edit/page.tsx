import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { OrderForm } from "@/components/admin/order-form";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { customers, products } from "@/server/db/schema";
import { getOrderAdmin } from "@/server/services/orders-admin";
import { asc } from "drizzle-orm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  return { title: order ? `Edit Items: ${order.code}` : "Edit Order" };
}

export default async function EditOrderItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("staff", "/admin/orders");
  const { id } = await params;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  if (!order) notFound();

  if (order.status !== "new" && order.status !== "confirmed") {
    redirect(`/admin/orders/${order.id}`);
  }

  const [customerList, productList] = await Promise.all([
    db
      .select({ id: customers.id, name: customers.name, phone: customers.phone })
      .from(customers)
      .orderBy(asc(customers.name)),
    db
      .select({ id: products.id, name: products.name, priceTzs: products.priceTzs })
      .from(products)
      .orderBy(asc(products.sortOrder), asc(products.name)),
  ]);

  return (
    <>
      <PageHeader
        title={`Edit Items: ${order.code}`}
        description="Update quantities, prices, or add/remove products. Totals are recomputed by the server."
      />
      <OrderForm
        customers={customerList}
        products={productList}
        existingOrder={order}
      />
    </>
  );
}
