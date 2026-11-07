import type { Metadata } from "next";
import { Badge, DataTable, EmptyState, LinkTabs, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/trend-chart";
import { formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { getReportsData, resolveDateRange, type ReportPeriod } from "@/server/services/reports";

export const metadata: Metadata = { title: "Reports" };

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  year: "This Year",
  custom: "Custom",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("admin", "/admin/reports");
  const raw = await searchParams;
  const period = (raw.period as ReportPeriod) || "30d";
  const range = resolveDateRange(period, raw.from, raw.to);

  const db = getDb();
  const data = await getReportsData(db, range);

  const periods: ReportPeriod[] = ["7d", "30d", "this_month", "last_month", "year"];

  return (
    <>
      <PageHeader
        title="Business Reports"
        description={`Sales, revenue, order performance, and customer growth for ${range.label}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/api/admin/reports/export?type=orders"
              download
              className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
            >
              Export Orders (CSV)
            </a>
            <a
              href="/api/admin/reports/export?type=customers"
              download
              className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
            >
              Export Customers (CSV)
            </a>
          </div>
        }
      />

      <LinkTabs
        label="Select report time period"
        items={periods.map((p) => ({
          href: `/admin/reports?period=${p}`,
          label: PERIOD_LABELS[p],
          active: period === p,
        }))}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Total Revenue</p>
          <p className="mt-1 text-3xl font-bold text-brand-dark">{formatTzs(data.totalRevenue)}</p>
          <span className="text-xs text-muted mt-1 block">Completed orders only</span>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Completed Orders</p>
          <p className="mt-1 text-3xl font-bold text-ink">{data.completedCount}</p>
          <span className="text-xs text-muted mt-1 block">Fulfilled and paid</span>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Average Order Value</p>
          <p className="mt-1 text-3xl font-bold text-ink">{formatTzs(data.averageOrderValue)}</p>
          <span className="text-xs text-muted mt-1 block">Per completed order</span>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">New Customers</p>
          <p className="mt-1 text-3xl font-bold text-ink">{data.newCustomersCount}</p>
          <span className="text-xs text-muted mt-1 block">Registered in period</span>
        </div>
      </div>

      {/* Daily trend chart */}
      <div className="mb-8">
        <TrendChart
          data={data.dailyTrend.map((d) => ({
            day: d.day,
            ordersCount: d.completedCount,
            revenueTzs: d.revenueTzs,
          }))}
          title={`Completed Revenue & Orders Trend (${range.label})`}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        {/* Orders by Status */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold text-ink mb-4">Orders Placed by Status</h2>
          {data.ordersByStatus.length === 0 ? (
            <p className="text-sm text-muted">No orders placed in this period.</p>
          ) : (
            <div className="space-y-3">
              {data.ordersByStatus.map((s) => (
                <div key={s.status} className="flex items-center justify-between border-b border-line pb-2">
                  <div className="flex items-center gap-2">
                    <Badge>{s.status.replace("_", " ")}</Badge>
                    <span className="text-sm text-ink-soft">{s.count} orders</span>
                  </div>
                  <span className="font-mono text-sm font-semibold">{formatTzs(s.totalAmount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Channel / Source */}
        <div className="rounded-lg border border-line bg-surface p-5">
          <h2 className="text-lg font-semibold text-ink mb-4">Orders by Channel Source</h2>
          {data.ordersBySource.length === 0 ? (
            <p className="text-sm text-muted">No orders placed in this period.</p>
          ) : (
            <div className="space-y-3">
              {data.ordersBySource.map((s) => (
                <div key={s.source} className="flex items-center justify-between border-b border-line pb-2">
                  <span className="text-sm font-semibold text-ink capitalize">{s.source.replace("_", " ")}</span>
                  <span className="font-semibold text-sm">{s.count} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Selling Products */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Top Performing Products</h2>
        {data.topProducts.length === 0 ? (
          <EmptyState title="No product sales recorded in this period" />
        ) : (
          <DataTable label="Top selling products">
            <THead>
              <Th>Product</Th>
              <Th className="text-center">Units Sold</Th>
              <Th className="text-right">Total Revenue Generated</Th>
            </THead>
            <TBody>
              {data.topProducts.map((p) => (
                <Tr key={p.name}>
                  <Td label="Product">
                    <span className="font-semibold text-ink">{p.name}</span>
                  </Td>
                  <Td label="Units Sold" className="text-center">
                    <span className="font-semibold">{p.unitsSold}</span>
                  </Td>
                  <Td label="Total Revenue" className="text-right">
                    <span className="font-mono font-bold text-brand-dark">{formatTzs(p.totalRevenue)}</span>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>
        )}
      </div>
    </>
  );
}
