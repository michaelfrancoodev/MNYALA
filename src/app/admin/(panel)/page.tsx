import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, EmptyState, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/trend-chart";
import { formatDateTime, formatTzs } from "@/lib/format";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { getDb } from "@/server/db/client";
import { getDashboardData } from "@/server/services/dashboard";

export const metadata: Metadata = { title: "Dashboard" };

const STATUS_TONES: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  new: "info",
  confirmed: "warning",
  in_delivery: "warning",
  completed: "success",
  cancelled: "danger",
};

export default async function DashboardPage() {
  const { user } = await requirePageRole("staff", "/admin");
  const db = getDb();
  const data = await getDashboardData(db, user.role);
  const canSeeRevenue = hasRole(user.role, "admin");

  return (
    <>
      <PageHeader
        title={`Habari, ${user.name.split(" ")[0]}`}
        description="Here is an overview of business operations, recent customer inquiries, and orders."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/orders/new"
              className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white no-underline hover:bg-brand-dark"
            >
              + Create Order
            </Link>
            <Link
              href="/admin/customers/new"
              className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
            >
              + Add Customer
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-8">
        <Link
          href="/admin/messages?tab=unread"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Unread Messages</p>
          <p className="mt-1 text-3xl font-bold text-ink">{data.metrics.unreadMessages}</p>
          <span className="text-xs text-brand mt-1 block">View inquiries &rarr;</span>
        </Link>

        <Link
          href="/admin/orders?tab=new"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">New Orders</p>
          <p className="mt-1 text-3xl font-bold text-brand-dark">{data.metrics.newOrders}</p>
          <span className="text-xs text-brand mt-1 block">Needs confirmation &rarr;</span>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Orders This Month</p>
          <p className="mt-1 text-3xl font-bold text-ink">{data.metrics.monthOrders}</p>
          <span className="text-xs text-muted mt-1 block">Total placed</span>
        </Link>

        {canSeeRevenue ? (
          <div className="rounded-lg border border-line bg-surface p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Revenue This Month</p>
            <p className="mt-1 text-2xl font-bold text-brand-dark">{formatTzs(data.metrics.monthRevenueTzs ?? 0)}</p>
            <span className="text-xs text-muted mt-1 block">Completed orders</span>
          </div>
        ) : (
          <Link
            href="/admin/customers"
            className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Customers</p>
            <p className="mt-1 text-3xl font-bold text-ink">{data.metrics.totalCustomers}</p>
            <span className="text-xs text-brand mt-1 block">View directory &rarr;</span>
          </Link>
        )}

        <Link
          href="/admin/customers"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Customers</p>
          <p className="mt-1 text-2xl font-bold text-ink">{data.metrics.totalCustomers}</p>
          <span className="text-xs text-muted mt-1 block">Active accounts</span>
        </Link>

        <Link
          href="/admin/products"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Live Products</p>
          <p className="mt-1 text-2xl font-bold text-ink">{data.metrics.publishedProducts}</p>
          <span className="text-xs text-brand mt-1 block">Catalog &rarr;</span>
        </Link>

        <Link
          href="/admin/gallery"
          className="rounded-lg border border-line bg-surface p-4 transition-colors hover:border-brand no-underline"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Gallery Photos</p>
          <p className="mt-1 text-2xl font-bold text-ink">{data.metrics.publishedGallery}</p>
          <span className="text-xs text-brand mt-1 block">Photos &rarr;</span>
        </Link>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="mb-8">
        <TrendChart data={data.dailyThirtyDays} title="Orders Activity Trend (Past 30 Days)" />
      </div>

      {/* Recent Orders and Recent Messages in 2 columns */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-brand hover:underline">
              View all orders &rarr;
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet">New orders will show up here.</EmptyState>
          ) : (
            <DataTable label="Recent orders">
              <THead>
                <Th>Code</Th>
                <Th>Customer</Th>
                <Th>Status</Th>
                <Th className="text-right">Total</Th>
              </THead>
              <TBody>
                {data.recentOrders.map((o) => (
                  <Tr key={o.id}>
                    <Td label="Code">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono font-semibold text-ink hover:underline">
                        {o.code}
                      </Link>
                    </Td>
                    <Td label="Customer">
                      <span className="text-sm font-medium">{o.customerName}</span>
                    </Td>
                    <Td label="Status">
                      <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>{o.status}</Badge>
                    </Td>
                    <Td label="Total" className="text-right">
                      <span className="font-semibold text-sm">{formatTzs(o.totalTzs)}</span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </DataTable>
          )}
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-ink">Recent Website Messages</h2>
            <Link href="/admin/messages" className="text-xs font-semibold text-brand hover:underline">
              View all messages &rarr;
            </Link>
          </div>

          {data.recentMessages.length === 0 ? (
            <EmptyState title="No messages yet">Messages from the contact form will appear here.</EmptyState>
          ) : (
            <DataTable label="Recent messages">
              <THead>
                <Th>Sender</Th>
                <Th>Subject</Th>
                <Th>Date</Th>
                <Th className="text-right">Action</Th>
              </THead>
              <TBody>
                {data.recentMessages.map((m) => (
                  <Tr key={m.id} unread={!m.isRead}>
                    <Td label="Sender">
                      <span className="font-semibold text-ink">{m.fullName}</span>
                    </Td>
                    <Td label="Subject">
                      <span className="text-sm">{MESSAGE_SUBJECT[m.subject]}</span>
                    </Td>
                    <Td label="Date">
                      <span className="text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                    </Td>
                    <Td label="Action" className="text-right">
                      <Link
                        href={`/admin/messages/${m.id}`}
                        className="rounded border border-line-strong bg-paper px-2.5 py-1 text-xs font-semibold text-ink no-underline hover:bg-surface"
                      >
                        Read
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </DataTable>
          )}
        </div>
      </div>
    </>
  );
}
