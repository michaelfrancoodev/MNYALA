import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, EmptyState, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { TrendChart } from "@/components/admin/trend-chart";
import { buttonClasses } from "@/components/ui/button";
import { formatDateTime, formatTzs } from "@/lib/format";
import { getLocale } from "@/messages/i18n";
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
  const locale = await getLocale();
  const isSw = locale === "sw";
  const db = getDb();
  const data = await getDashboardData(db, user.role);
  const canSeeRevenue = hasRole(user.role, "admin");

  return (
    <>
      <PageHeader
        title={isSw ? `Habari, ${user.name}` : `Hello, ${user.name}`}
        description={
          isSw
            ? "Muhtasari wa shughuli za biashara, maagizo ya wateja, na ujumbe wa tovuti."
            : "Overview of business operations, customer orders, and incoming website messages."
        }
        actions={
          <div className="grid grid-cols-2 w-full gap-2 sm:w-auto sm:flex sm:items-center sm:gap-2.5">
            <Link href="/admin/orders/new" className={`${buttonClasses("primary", "sm")} justify-center`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" x2="12" y1="5" y2="19" />
                <line x1="5" x2="19" y1="12" y2="12" />
              </svg>
              <span>{isSw ? "Oda Mpya" : "New Order"}</span>
            </Link>
            <Link href="/admin/customers/new" className={`${buttonClasses("secondary", "sm")} justify-center`}>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="19" x2="19" y1="8" y2="14" />
                <line x1="22" x2="16" y1="11" y2="11" />
              </svg>
              <span>{isSw ? "Ongeza Mteja" : "Add Customer"}</span>
            </Link>
          </div>
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-8">
        <Link
          href="/admin/messages?tab=unread"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Ujumbe Mpya" : "Unread Messages"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m3 7 9 6 9-6" />
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink group-hover:text-brand-dark transition-colors">
              {data.metrics.unreadMessages}
            </p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-semibold text-brand flex items-center gap-1">
            {isSw ? "Fungua ujumbe" : "Open inbox"} &rarr;
          </span>
        </Link>

        <Link
          href="/admin/orders?tab=new"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Oda Mpya" : "New Orders"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-700">
              {data.metrics.newOrders}
            </p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-semibold text-amber-800 flex items-center gap-1">
            {isSw ? "Uthibitisho" : "Confirmation"} &rarr;
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Oda Mwezi Huu" : "Orders This Month"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.metrics.monthOrders}</p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-medium text-muted block">
            {isSw ? "Jumla ya oda" : "Total received"}
          </span>
        </Link>

        {canSeeRevenue ? (
          <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs">
            <div>
              <div className="flex items-start justify-between gap-1.5">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                  {isSw ? "Mauzo Mwezi Huu" : "Revenue This Month"}
                </span>
                <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-brand">
                  <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="12" x2="12" y1="2" y2="22" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-extrabold text-brand-dark">
                {formatTzs(data.metrics.monthRevenueTzs ?? 0)}
              </p>
            </div>
            <span className="mt-2 text-[11px] sm:text-xs font-medium text-muted block">
              {isSw ? "Yaliyolipwa" : "Completed orders"}
            </span>
          </div>
        ) : null}

        <Link
          href="/admin/customers"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Wateja" : "Customers"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.metrics.totalCustomers}</p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-semibold text-brand block">
            {isSw ? "Orodha ya wateja" : "Customer list"} &rarr;
          </span>
        </Link>

        <Link
          href="/admin/products"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Bidhaa Tovutini" : "Products"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m7.5 4.27 9 5.15" />
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.metrics.publishedProducts}</p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-semibold text-brand block">
            {isSw ? "Katalogi ya bidhaa" : "Product catalog"} &rarr;
          </span>
        </Link>

        <Link
          href="/admin/gallery"
          className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-5 shadow-2xs hover:shadow-md hover:border-brand/50 transition-all no-underline"
        >
          <div>
            <div className="flex items-start justify-between gap-1.5">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted leading-tight">
                {isSw ? "Picha za Miradi" : "Gallery Photos"}
              </span>
              <div className="flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <svg className="size-3.5 sm:size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                </svg>
              </div>
            </div>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink">{data.metrics.publishedGallery}</p>
          </div>
          <span className="mt-2 text-[11px] sm:text-xs font-semibold text-brand block">
            {isSw ? "Nyumba ya picha" : "Manage gallery"} &rarr;
          </span>
        </Link>
      </div>

      {/* 30-Day Trend Chart */}
      <div className="mb-8 rounded-2xl border border-line bg-surface p-6 shadow-xs">
        <TrendChart
          data={data.dailyThirtyDays}
          title={isSw ? "Mwenendo wa Maagizo (Siku 30 Zilizopita)" : "Orders Trend (Last 30 Days)"}
        />
      </div>

      {/* Recent Orders and Recent Messages */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-base font-bold text-ink">
              {isSw ? "Maagizo ya Hivi Karibuni" : "Recent Orders"}
            </h2>
            <Link href="/admin/orders" className="text-xs font-bold text-brand-dark hover:underline">
              {isSw ? "Ona maagizo yote" : "View all orders"} &rarr;
            </Link>
          </div>

          {data.recentOrders.length === 0 ? (
            <EmptyState title={isSw ? "Hakuna maagizo bado" : "No orders yet"}>
              {isSw ? "Maagizo mapya ya wateja yataonekana hapa." : "New customer orders will appear here."}
            </EmptyState>
          ) : (
            <DataTable label="Recent orders">
              <THead>
                <Th>{isSw ? "Namba" : "Order #"}</Th>
                <Th>{isSw ? "Mteja" : "Customer"}</Th>
                <Th>{isSw ? "Hali" : "Status"}</Th>
                <Th className="text-right">{isSw ? "Jumla" : "Total"}</Th>
              </THead>
              <TBody>
                {data.recentOrders.map((o) => (
                  <Tr key={o.id}>
                    <Td label={isSw ? "Namba" : "Order #"}>
                      <Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-bold text-ink hover:underline">
                        {o.code}
                      </Link>
                    </Td>
                    <Td label={isSw ? "Mteja" : "Customer"}>
                      <span className="text-sm font-semibold">{o.customerName}</span>
                    </Td>
                    <Td label={isSw ? "Hali" : "Status"}>
                      <Badge tone={STATUS_TONES[o.status] ?? "neutral"}>{o.status}</Badge>
                    </Td>
                    <Td label={isSw ? "Jumla" : "Total"} className="text-right">
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
            <h2 className="text-base font-bold text-ink">
              {isSw ? "Ujumbe Mpya wa Tovuti" : "Recent Website Messages"}
            </h2>
            <Link href="/admin/messages" className="text-xs font-bold text-brand-dark hover:underline">
              {isSw ? "Ona ujumbe wote" : "View all messages"} &rarr;
            </Link>
          </div>

          {data.recentMessages.length === 0 ? (
            <EmptyState title={isSw ? "Hakuna ujumbe bado" : "No messages yet"}>
              {isSw ? "Ujumbe kutoka fomu ya mawasiliano utaonekana hapa." : "Messages from the website contact form will appear here."}
            </EmptyState>
          ) : (
            <DataTable label="Recent messages">
              <THead>
                <Th>{isSw ? "Mtumaji" : "Sender"}</Th>
                <Th>{isSw ? "Kichwa" : "Subject"}</Th>
                <Th>{isSw ? "Tarehe" : "Received"}</Th>
                <Th className="text-right">{isSw ? "Hatua" : "Action"}</Th>
              </THead>
              <TBody>
                {data.recentMessages.map((m) => (
                  <Tr key={m.id} unread={!m.isRead}>
                    <Td label={isSw ? "Mtumaji" : "Sender"}>
                      <span className="font-bold text-ink">{m.fullName}</span>
                    </Td>
                    <Td label={isSw ? "Kichwa" : "Subject"}>
                      <span className="text-xs font-medium text-ink-soft">{MESSAGE_SUBJECT[m.subject]}</span>
                    </Td>
                    <Td label={isSw ? "Tarehe" : "Received"}>
                      <span className="text-xs text-muted">{formatDateTime(m.createdAt)}</span>
                    </Td>
                    <Td label={isSw ? "Hatua" : "Action"} className="text-right">
                      <Link
                        href={`/admin/messages/${m.id}`}
                        className="rounded-lg border border-line-strong bg-surface px-2.5 py-1 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline"
                      >
                        {isSw ? "Soma" : "Open"}
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
