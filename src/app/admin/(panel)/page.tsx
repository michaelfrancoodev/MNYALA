import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, EmptyState, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/trend-chart";
import { buttonClasses } from "@/components/ui/button";
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
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Overview of business operations, customer orders, and incoming website messages."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/admin/orders/new" className={buttonClasses("primary", "sm")}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>New Order</span>
            </Link>
            <Link href="/admin/customers/new" className={buttonClasses("secondary", "sm")}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              <span>Add Customer</span>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-8">
        <Link
          href="/admin/messages?tab=unread"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Ujumbe Mpya</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m3 7 9 6 9-6" />
                <rect width="20" height="14" x="2" y="5" rx="2" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink group-hover:text-brand-dark transition-colors">
            {data.metrics.unreadMessages}
          </p>
          <span className="mt-2 text-xs font-semibold text-brand flex items-center gap-1">
            Fungua ujumbe &rarr;
          </span>
        </Link>

        <Link
          href="/admin/orders?tab=new"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Oda Mpya</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-amber-700">
            {data.metrics.newOrders}
          </p>
          <span className="mt-2 text-xs font-semibold text-amber-800 flex items-center gap-1">
            Zinahitaji uthibitisho &rarr;
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Oda Mwezi Huu</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-ink">{data.metrics.monthOrders}</p>
          <span className="mt-2 text-xs font-medium text-muted block">Jumla iliyopokelewa</span>
        </Link>

        {canSeeRevenue ? (
          <div className="rounded-2xl border border-line bg-surface p-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Mauzo Mwezi Huu</span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-50 text-brand">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" x2="12" y1="2" y2="22" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-2xl font-extrabold text-brand-dark">
              {formatTzs(data.metrics.monthRevenueTzs ?? 0)}
            </p>
            <span className="mt-2 text-xs font-medium text-muted block">Maagizo yaliyokamilika</span>
          </div>
        ) : (
          <Link
            href="/admin/customers"
            className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Jumla ya Wateja</span>
              <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <p className="mt-3 text-3xl font-extrabold text-ink">{data.metrics.totalCustomers}</p>
            <span className="mt-2 text-xs font-semibold text-brand block">Orodha ya wateja &rarr;</span>
          </Link>
        )}

        <Link
          href="/admin/customers"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Wateja</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink">{data.metrics.totalCustomers}</p>
          <span className="mt-2 text-xs font-medium text-muted block">Akaunti hai</span>
        </Link>

        <Link
          href="/admin/products"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Bidhaa Tovutini</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m7.5 4.27 9 5.15" />
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink">{data.metrics.publishedProducts}</p>
          <span className="mt-2 text-xs font-semibold text-brand block">Katalogi ya bidhaa &rarr;</span>
        </Link>

        <Link
          href="/admin/gallery"
          className="group rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Picha za Miradi</span>
            <div className="flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink">{data.metrics.publishedGallery}</p>
          <span className="mt-2 text-xs font-semibold text-brand block">Nyumba ya picha &rarr;</span>
        </Link>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <TrendChart data={data.dailyThirtyDays} title="Mwenendo wa Maagizo (Siku 30 Zilizopita)" />
      </div>

      {/* Recent Orders and Recent Messages */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-bold text-ink">Maagizo ya Hivi Karibuni</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-brand-dark hover:underline">
              Ona maagizo yote &rarr;
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <EmptyState title="Hakuna maagizo bado">Maagizo mapya ya wateja yataonekana hapa.</EmptyState>
          ) : (
            <DataTable label="Recent orders">
              <THead>
                <Th>Namba</Th>
                <Th>Mteja</Th>
                <Th>Hali</Th>
                <Th className="text-right">Jumla</Th>
              </THead>
              <TBody>
                {data.recentOrders.map((o) => (
                  <Tr key={o.id}>
                    <Td label="Namba">
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-bold text-ink hover:underline">
                        {o.code}
                      </Link>
                    </Td>
                    <Td label="Mteja">
                      <span className="text-sm font-semibold">{o.customerName}</span>
                    </Td>
                    <Td label="Hali">
                      <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>{o.status}</Badge>
                    </Td>
                    <Td label="Jumla" className="text-right">
                      <span className="font-bold text-sm text-ink">{formatTzs(o.totalTzs)}</span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </DataTable>
          )}
        </div>

        {/* Recent Messages */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-bold text-ink">Ujumbe Mpya wa Tovuti</h2>
            <Link href="/admin/messages" className="text-xs font-bold text-brand-dark hover:underline">
              Ona ujumbe wote &rarr;
            </Link>
          </div>

          {data.recentMessages.length === 0 ? (
            <EmptyState title="Hakuna ujumbe bado">Ujumbe kutoka fomu ya mawasiliano utaonekana hapa.</EmptyState>
          ) : (
            <DataTable label="Recent messages">
              <THead>
                <Th>Mtumaji</Th>
                <Th>Kichwa</Th>
                <Th>Tarehe</Th>
                <Th className="text-right">Hatua</Th>
              </THead>
              <TBody>
                {data.recentMessages.map((m) => (
                  <Tr key={m.id} unread={!m.isRead}>
                    <Td label="Mtumaji">
                      <span className="font-bold text-ink">{m.fullName}</span>
                    </Td>
                    <Td label="Kichwa">
                      <span className="text-xs font-medium text-ink-soft">{MESSAGE_SUBJECT[m.subject]}</span>
                    </Td>
                    <Td label="Tarehe">
                      <span className="text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                    </Td>
                    <Td label="Hatua" className="text-right">
                      <Link
                        href={`/admin/messages/${m.id}`}
                        className="rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline"
                      >
                        Soma
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
