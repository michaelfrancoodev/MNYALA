import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { hasRole } from "@/server/auth/roles";
import type { SessionUser } from "@/server/auth/session";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { MobileNav } from "./mobile-nav";
import { NAV } from "./nav";
import { NavLinks, type NavLinkGroup } from "./nav-links";
import { UserBlock } from "./user-block";

export type NavCounts = { messages?: number; orders?: number };

function visibleGroups(user: SessionUser, counts: NavCounts, locale: Locale): NavLinkGroup[] {
  return NAV.map((group) => ({
    label: locale === "sw" ? group.labelSw ?? group.label : group.label,
    items: group.items
      .filter((item) => hasRole(user.role, item.min))
      .map((item) => ({
        href: item.href,
        label: locale === "sw" ? item.labelSw : item.label,
        count: item.count ? counts[item.count] : undefined,
      })),
  })).filter((group) => group.items.length > 0);
}

export function AdminShell({
  user,
  counts,
  locale = "en",
  children,
}: {
  user: SessionUser;
  counts: NavCounts;
  locale?: Locale;
  children: ReactNode;
}) {
  const groups = visibleGroups(user, counts, locale);
  const totalAlerts = (counts.messages || 0) + (counts.orders || 0);
  const isSw = locale === "sw";

  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-surface px-4 py-2 font-semibold shadow-md focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-5 lg:flex">
        <div className="flex items-center gap-3 px-1 pt-1">
          <Image src="/brand/emblem.webp" alt="Mnyala" width={38} height={38} priority className="size-9.5 shrink-0" />
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-ink">Mnyala Co. Ltd</p>
            <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              {isSw ? "Mfumo wa Usimamizi" : "Admin Portal"}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <NavLinks groups={groups} />
        </div>

        <div className="border-t border-line pt-4">
          <UserBlock user={user} />
        </div>
      </aside>

      {/* Main Content Area with Desktop Topbar & Mobile Header */}
      <div className="flex min-w-0 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          {/* Mobile brand & toggle */}
          <div className="flex items-center gap-3 lg:hidden">
            <Image src="/brand/emblem.webp" alt="" width={30} height={30} priority className="size-7.5" />
            <Link href="/admin" className="text-base font-bold text-ink no-underline">
              Mnyala Admin
            </Link>
          </div>

          {/* Desktop breadcrumb/title */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-semibold text-ink-soft">
              {isSw ? "Mfumo wa Ndani • Mbeya, Tanzania" : "Internal Management • Mbeya, Tanzania"}
            </span>
          </div>

          {/* Action buttons, language switcher & notification bell */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher in Admin Header */}
            <LanguageSwitcher current={locale} />

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-surface px-3 py-1.5 text-xs font-bold text-ink-soft shadow-2xs hover:bg-slate-50 hover:text-ink no-underline transition-all"
              title={isSw ? "Fungua tovuti ya umma" : "Open public website"}
            >
              <span>{isSw ? "Tovuti" : "Website"}</span>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </Link>

            {/* Notification Bell (Messages) */}
            <Link
              href="/admin/messages"
              className="relative inline-flex size-9.5 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink-soft shadow-2xs hover:bg-slate-50 hover:text-ink no-underline transition-all"
              title={`${counts.messages || 0} ${isSw ? "ujumbe mpya" : "new messages"}`}
            >
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m3 7 9 6 9-6" />
                <rect width="20" height="14" x="2" y="5" rx="2" />
              </svg>
              {typeof counts.messages === "number" && counts.messages > 0 ? (
                <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white shadow-xs ring-2 ring-white animate-pulse">
                  {counts.messages > 99 ? "99+" : counts.messages}
                </span>
              ) : null}
            </Link>

            {/* Orders Quick Pill */}
            {typeof counts.orders === "number" && counts.orders > 0 ? (
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs hover:bg-amber-100 no-underline transition-all"
                title={`${counts.orders} ${isSw ? "maagizo yanayosubiri" : "pending orders"}`}
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <span>{counts.orders} {isSw ? "Oda" : "Orders"}</span>
              </Link>
            ) : null}

            {/* Mobile Nav dialog */}
            <div className="lg:hidden">
              <MobileNav badgeCount={totalAlerts}>
                <div className="flex-1">
                  <NavLinks groups={groups} />
                </div>
                <div className="mt-6 border-t border-line pt-4">
                  <UserBlock user={user} />
                </div>
              </MobileNav>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
