import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/trend-chart";
import { formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { getReportsData, resolveDateRange, type ReportPeriod } from "@/server/services/reports";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = { title: "Ripoti & Takwimu | Reports" };

const PERIODS: ReportPeriod[] = ["7d", "30d", "this_month", "last_month", "year"];

const LABELS_SW: Record<ReportPeriod, string> = {
  "7d": "Siku 7 Zilizopita",
  "30d": "Siku 30 Zilizopita",
  this_month: "Mwezi Huu",
  last_month: "Mwezi Uliopita",
  year: "Mwaka Huu",
  custom: "Maalum",
};

const LABELS_EN: Record<ReportPeriod, string> = {
  "7d": "Last 7 Days",
  "30d": "Last 30 Days",
  this_month: "This Month",
  last_month: "Last Month",
  year: "This Year",
  custom: "Custom",
};

const SOURCE_LABELS: Record<string, { sw: string; en: string }> = {
  whatsapp: { sw: "WhatsApp", en: "WhatsApp" },
  phone: { sw: "Simu ya Moja kwa Moja", en: "Phone Call" },
  website_message: { sw: "Ujumbe wa Tovuti", en: "Website Message" },
  walk_in: { sw: "Kufika Kiwandani", en: "Walk-in Customer" },
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
  const locale = await getLocale();
  const isSw = locale === "sw";

  const db = getDb();
  const data = await getReportsData(db, range);

  const totalOrdersCount = data.ordersByStatus.reduce((sum, s) => sum + s.count, 0);

  return (
    <>
      <PageHeader
        title={isSw ? "Ripoti za Mauzo & Utendaji" : "Business Performance Reports"}
        description={
          isSw
            ? `Takwimu za mapato, mwenendo wa mauzo, vyanzo vya maagizo, na ukuaji wa wateja kwa ${range.label}.`
            : `Sales revenue, order fulfillment performance, and customer acquisition metrics for ${range.label}.`
        }
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/api/admin/reports/export?type=orders"
              download
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline transition-all"
            >
              <svg className="size-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>{isSw ? "Pakua Maagizo (CSV)" : "Export Orders (CSV)"}</span>
            </a>
            <a
              href="/api/admin/reports/export?type=customers"
              download
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-4 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline transition-all"
            >
              <svg className="size-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
              </svg>
              <span>{isSw ? "Pakua Wateja (CSV)" : "Export Customers (CSV)"}</span>
            </a>
          </div>
        }
      />

      {/* Modern Filter Pills */}
      <div className="mb-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface p-1.5 shadow-2xs w-fit">
        {PERIODS.map((p) => {
          const active = period === p;
          const label = isSw ? LABELS_SW[p] : LABELS_EN[p];
          return (
            <Link
              key={p}
              href={`/admin/reports?period=${p}`}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all no-underline ${
                active
                  ? "bg-brand text-white shadow-xs"
                  : "text-ink-soft hover:bg-slate-100 hover:text-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {isSw ? "Jumla ya Mapato" : "Total Revenue"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" x2="12" y1="2" y2="22" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-brand-dark">
            {formatTzs(data.totalRevenue)}
          </p>
          <span className="mt-1 text-xs text-muted block">
            {isSw ? "Maagizo yaliyolipwa" : "Completed orders only"}
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {isSw ? "Oda Zilizokamilika" : "Completed Orders"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.completedCount}</p>
          <span className="mt-1 text-xs text-muted block">
            {isSw ? "Zilizoagizwa & kufikishwa" : "Fulfilled and delivered"}
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {isSw ? "Wastani wa Thamani (AOV)" : "Average Order Value"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">
            {formatTzs(data.averageOrderValue)}
          </p>
          <span className="mt-1 text-xs text-muted block">
            {isSw ? "Kwa kila oda iliyokamilika" : "Per completed transaction"}
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">
              {isSw ? "Wateja Wapya" : "New Customers"}
            </span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.newCustomersCount}</p>
          <span className="mt-1 text-xs text-muted block">
            {isSw ? "Waliojiunga kipindi hiki" : "Registered in this period"}
          </span>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <TrendChart
          data={data.dailyTrend.map((d) => ({
            day: d.day,
            ordersCount: d.completedCount,
            revenueTzs: d.revenueTzs,
          }))}
          title={isSw ? `Mwenendo wa Mapato na Maagizo (${range.label})` : `Revenue & Orders Trend (${range.label})`}
        />
      </div>

      {/* Two Column Breakdown: Status & Channels */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
        {/* Orders by Status */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-line/80 pb-3 mb-5">
            <h2 className="text-base font-bold text-ink">
              {isSw ? "Mgawanyo kwa Hali ya Oda" : "Orders by Status"}
            </h2>
            <span className="text-xs font-bold text-muted">
              {totalOrdersCount} {isSw ? "Oda Jumla" : "Total Orders"}
            </span>
          </div>

          {data.ordersByStatus.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {isSw ? "Hakuna oda zilizorekodiwa katika kipindi hiki." : "No orders recorded in this period."}
            </p>
          ) : (
            <div className="space-y-4">
              {data.ordersByStatus.map((s) => {
                const pct = totalOrdersCount > 0 ? Math.round((s.count / totalOrdersCount) * 100) : 0;
                return (
                  <div key={s.status} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <Badge tone={s.status === "completed" ? "success" : s.status === "cancelled" ? "danger" : "warning"}>
                          {s.status}
                        </Badge>
                        <span className="text-ink-soft">
                          {s.count} {isSw ? "oda" : "orders"} ({pct}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-ink">{formatTzs(s.totalAmount)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          s.status === "completed" ? "bg-emerald-600" : s.status === "cancelled" ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Orders by Channel / Source */}
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-line/80 pb-3 mb-5">
            <h2 className="text-base font-bold text-ink">
              {isSw ? "Vyanzo vya Maagizo (Channels)" : "Orders by Channel Source"}
            </h2>
            <span className="text-xs font-bold text-muted">
              {totalOrdersCount} {isSw ? "Oda Jumla" : "Total Orders"}
            </span>
          </div>

          {data.ordersBySource.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              {isSw ? "Hakuna taarifa za vyanzo katika kipindi hiki." : "No channel source activity recorded."}
            </p>
          ) : (
            <div className="space-y-4">
              {data.ordersBySource.map((s) => {
                const pct = totalOrdersCount > 0 ? Math.round((s.count / totalOrdersCount) * 100) : 0;
                const srcLabel = SOURCE_LABELS[s.source]?.[locale] ?? s.source;
                return (
                  <div key={s.source} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-bold text-ink">{srcLabel}</span>
                      <span className="text-ink-soft">
                        {s.count} {isSw ? "oda" : "orders"} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-emerald-600 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
        <div className="border-b border-line/80 pb-3 mb-5">
          <h2 className="text-base font-bold text-ink">
            {isSw ? "Bidhaa Zenye Mauzo ya Juu Zaidi" : "Top Performing Products"}
          </h2>
          <p className="text-xs text-muted">
            {isSw ? "Orodha ya bidhaa zilizouzwa zaidi na mapato yaliyozalishwa." : "Best selling items ranked by unit volume and revenue."}
          </p>
        </div>

        {data.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">
            {isSw ? "Hakuna mauzo ya bidhaa yaliyorekodiwa katika kipindi hiki." : "No product sales recorded in this period."}
          </p>
        ) : (
          <DataTable label="Top selling products">
            <THead>
              <Th>{isSw ? "Jina la Bidhaa" : "Product Name"}</Th>
              <Th className="text-center">{isSw ? "Idadi Iliyouzwa" : "Units Sold"}</Th>
              <Th className="text-right">{isSw ? "Jumla ya Mapato" : "Total Revenue"}</Th>
            </THead>
            <TBody>
              {data.topProducts.map((p) => (
                <Tr key={p.name}>
                  <Td label={isSw ? "Jina la Bidhaa" : "Product"}>
                    <span className="font-bold text-ink">{p.name}</span>
                  </Td>
                  <Td label={isSw ? "Idadi" : "Units Sold"} className="text-center">
                    <span className="font-bold text-sm text-ink">{p.unitsSold}</span>
                  </Td>
                  <Td label={isSw ? "Mapato" : "Total Revenue"} className="text-right">
                    <span className="font-bold text-sm text-brand-dark">{formatTzs(p.totalRevenue)}</span>
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
