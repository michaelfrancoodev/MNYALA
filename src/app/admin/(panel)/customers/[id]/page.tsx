import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Badge, DataTable, EmptyState, Notice, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { formatDate, formatDateTime, formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { deleteCustomerAction } from "@/server/actions/customers";
import { getDb } from "@/server/db/client";
import { getCustomerAdmin } from "@/server/services/customers-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const customer = await getCustomerAdmin(db, id);
  return { title: customer ? customer.name : "Customer" };
}

const NOTICES: Record<string, string> = {
  created: "Customer created successfully.",
  saved: "Customer updated successfully.",
  "has-orders": "Cannot delete customer because they have existing orders.",
};

const STATUS_TONES: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  new: "info",
  confirmed: "warning",
  in_delivery: "warning",
  completed: "success",
  cancelled: "danger",
};

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requirePageRole("staff", "/admin/customers");
  const { id } = await params;
  const raw = await searchParams;
  const db = getDb();
  const customer = await getCustomerAdmin(db, id);
  if (!customer) notFound();

  const canDelete = hasRole(user.role, "admin") && customer.orderCount === 0;

  return (
    <>
      <PageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.createdAt)}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/orders/new?customerId=${customer.id}`}
              className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white no-underline hover:bg-brand-dark"
            >
              + Create Order
            </Link>
            <Link
              href={`/admin/customers/${customer.id}/edit`}
              className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
            >
              Edit Details
            </Link>
            {canDelete ? (
              <ConfirmAction
                action={deleteCustomerAction}
                triggerLabel="Delete customer"
                title={`Delete ${customer.name}?`}
                description="This customer has no order history and will be permanently removed."
                confirmLabel="Delete permanently"
                fields={{ id: customer.id }}
              />
            ) : null}
          </div>
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
        <div className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Contact Info</h2>
          <div>
            <p className="text-xs text-muted">Phone</p>
            <p className="font-semibold text-ink font-mono">{customer.phone || "None"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Email</p>
            <p className="text-ink">{customer.email || "None"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Address</p>
            <p className="text-ink">{customer.address || "None"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Financial Summary</h2>
          <div>
            <p className="text-xs text-muted">Total Orders Placed</p>
            <p className="text-2xl font-semibold text-ink">{customer.orderCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Total Completed Spend</p>
            <p className="text-2xl font-semibold text-brand-dark">{formatTzs(customer.totalSpentTzs)}</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Internal Notes</h2>
          <p className="text-sm text-ink-soft whitespace-pre-wrap">{customer.notes || "No notes recorded."}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Order History ({customer.orders.length})</h2>

      {customer.orders.length === 0 ? (
        <EmptyState title="No orders yet for this customer">
          <p className="mt-2">
            <Link href={`/admin/orders/new?customerId=${customer.id}`}>Create the first order</Link> for {customer.name}.
          </p>
        </EmptyState>
      ) : (
        <DataTable label="Customer orders">
          <THead>
            <Th>Order Code</Th>
            <Th>Date</Th>
            <Th>Source</Th>
            <Th>Status</Th>
            <Th>Total</Th>
            <Th className="text-right">Action</Th>
          </THead>
          <TBody>
            {customer.orders.map((o) => (
              <Tr key={o.id}>
                <Td label="Order Code">
                  <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-ink hover:underline">
                    {o.code}
                  </Link>
                </Td>
                <Td label="Date">
                  <span className="text-sm">{formatDateTime(o.createdAt)}</span>
                </Td>
                <Td label="Source">
                  <span className="text-sm capitalize">{o.source.replace("_", " ")}</span>
                </Td>
                <Td label="Status">
                  <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>{o.status.replace("_", " ")}</Badge>
                </Td>
                <Td label="Total">
                  <span className="font-semibold text-sm">{formatTzs(o.totalTzs)}</span>
                </Td>
                <Td label="Action" className="text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="rounded border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-surface"
                  >
                    View Order
                  </Link>
                </Td>
              </Tr>
            ))}
          </TBody>
        </DataTable>
      )}
    </>
  );
}
