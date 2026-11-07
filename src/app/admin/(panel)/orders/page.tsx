import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, EmptyState, LinkTabs, Notice, PageHeader, Pagination, SearchBox, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { formatDateTime, formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { listOrdersAdmin, orderCounts, ORDER_TABS, type OrderTab, ORDERS_PAGE_SIZE } from "@/server/services/orders-admin";

export const metadata: Metadata = { title: "Orders" };

const NOTICES: Record<string, string> = {
  created: "Order created successfully.",
  updated: "Order items updated successfully.",
  deleted: "Order deleted permanently.",
};

const TAB_LABEL: Record<OrderTab, string> = {
  all: "All",
  new: "New",
  confirmed: "Confirmed",
  in_delivery: "In Delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_TONES: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  new: "info",
  confirmed: "warning",
  in_delivery: "warning",
  completed: "success",
  cancelled: "danger",
};

export default async function OrdersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("staff", "/admin/orders");
  const raw = await searchParams;
  const page = Number(raw.page) || 1;
  const tab = (ORDER_TABS.includes(raw.tab as OrderTab) ? raw.tab : "all") as OrderTab;
  const q = raw.q || "";

  const db = getDb();
  const [list, counts] = await Promise.all([
    listOrdersAdmin(db, { tab, q, page }),
    orderCounts(db),
  ]);

  const hrefFor = (p: number, overTab?: OrderTab) => {
    const sp = new URLSearchParams();
    const t = overTab ?? tab;
    if (t !== "all") sp.set("tab", t);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/admin/orders?${s}` : "/admin/orders";
  };

  return (
    <>
      <PageHeader
        title="Orders"
        description="Manage customer orders from phone, WhatsApp, walk-ins, and website inquiries."
        actions={
          <Link
            href="/admin/orders/new"
            className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white no-underline hover:bg-brand-dark"
          >
            + Create Order
          </Link>
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <LinkTabs
        label="Filter orders by status"
        items={ORDER_TABS.map((t) => ({
          href: hrefFor(1, t),
          label: TAB_LABEL[t],
          count: counts[t],
          active: tab === t,
        }))}
      />

      <div className="mb-4">
        <SearchBox
          action="/admin/orders"
          defaultValue={q}
          placeholder="Search order code (MN-2026-...), customer name, or phone..."
          hidden={tab !== "all" ? { tab } : {}}
        />
      </div>

      {list.total === 0 ? (
        <EmptyState title="No orders found">
          {q || tab !== "all" ? (
            <p>
              No orders match the selected filters. <Link href="/admin/orders">Clear filters</Link>.
            </p>
          ) : (
            <p>
              No orders have been recorded yet. <Link href="/admin/orders/new">Create the first order</Link>.
            </p>
          )}
        </EmptyState>
      ) : (
        <>
          <DataTable label="Orders list">
            <THead>
              <Th>Order Code</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Source</Th>
              <Th>Status</Th>
              <Th>Total Amount</Th>
              <Th className="text-right">Actions</Th>
            </THead>
            <TBody>
              {list.items.map((o) => (
                <Tr key={o.id}>
                  <Td label="Order Code">
                    <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-ink hover:underline">
                      {o.code}
                    </Link>
                  </Td>
                  <Td label="Customer">
                    <div>
                      <Link href={`/admin/customers/${o.customerId}`} className="font-semibold text-ink hover:underline">
                        {o.customerName}
                      </Link>
                      {o.customerPhone ? <p className="font-mono text-xs text-muted">{o.customerPhone}</p> : null}
                    </div>
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
                  <Td label="Total Amount">
                    <span className="font-semibold text-sm">{formatTzs(o.totalTzs)}</span>
                  </Td>
                  <Td label="Actions" className="text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="rounded border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-surface"
                    >
                      View
                    </Link>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>

          <Pagination page={list.page} pages={list.pages} total={list.total} pageSize={ORDERS_PAGE_SIZE} hrefFor={(p) => hrefFor(p)} />
        </>
      )}
    </>
  );
}
