import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { OrderForm } from "@/components/admin/order-form";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { customers, messages, products } from "@/server/db/schema";
import { createCustomer, findCustomerByContact } from "@/server/services/customers-admin";
import { asc, eq } from "drizzle-orm";

export const metadata: Metadata = { title: "New Order" };

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("staff", "/admin/orders/new");
  const raw = await searchParams;
  const db = getDb();

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

  let preselectedCustId = raw.customerId;
  if (!preselectedCustId && raw.messageId) {
    const [msg] = await db.select().from(messages).where(eq(messages.id, raw.messageId));
    if (msg) {
      const match = await findCustomerByContact(db, { phone: msg.phone, email: msg.email });
      if (match) {
        preselectedCustId = match.id;
      } else {
        const newCust = await createCustomer(db, {
          input: {
            name: msg.fullName,
            phone: msg.phone,
            email: msg.email,
            address: null,
            notes: `Created from inquiry (${msg.subject}): ${msg.body.slice(0, 120)}`,
          },
        });
        preselectedCustId = newCust.id;
        customerList.unshift({ id: newCust.id, name: newCust.name, phone: newCust.phone });
      }
    }
  }

  if (customerList.length === 0) {
    return (
      <>
        <PageHeader title="Create Order" description="Record a new customer order." />
        <EmptyState title="No customers exist yet">
          <p className="mt-2">
            You need to add at least one customer before creating an order.{" "}
            <Link href="/admin/customers/new">Create customer now</Link>.
          </p>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Create Order"
        description="Select a customer and add line items. Quantities and totals are verified by the server."
      />
      <OrderForm
        customers={customerList}
        products={productList}
        preselectedCustomerId={preselectedCustId}
        preselectedMessageId={raw.messageId}
      />
    </>
  );
}
