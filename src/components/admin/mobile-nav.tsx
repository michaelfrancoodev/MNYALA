"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import type { SessionUser } from "@/server/auth/session";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { NavLinks, type NavLinkGroup } from "./nav-links";
import { UserBlock } from "./user-block";
import type { NavCounts } from "./admin-shell";

export function MobileNav({
  badgeCount,
  user,
  counts,
  locale = "en",
  groups,
}: {
  badgeCount?: number;
  user: SessionUser;
  counts: NavCounts;
  locale?: Locale;
  groups: NavLinkGroup[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const isSw = locale === "sw";

  useEffect(() => {
    ref.current?.close();
  }, [pathname]);

  return (
    <>
      {/* Modern Hamburger Button on Mobile Topbar */}
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        aria-haspopup="dialog"
        aria-label={isSw ? "Fungua Menyu" : "Open Menu"}
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
      >
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
        {typeof badgeCount === "number" && badgeCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4.5 h-4.5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white shadow-xs ring-2 ring-white animate-pulse">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </button>

      {/* Slide-in Navigation Drawer */}
      <dialog
        ref={ref}
        aria-label="Navigation Menu"
        className="m-0 h-full max-h-none w-80 max-w-[88vw] overflow-y-auto border-r border-line bg-surface p-0 shadow-2xl backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === ref.current) ref.current?.close();
        }}
      >
        <div className="flex min-h-full flex-col p-5">
          {/* Drawer Header with Logo & Close Button */}
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2.5">
              <Image src="/brand/emblem.webp" alt="Mnyala" width={32} height={32} priority className="size-8 shrink-0" />
              <div>
                <p className="text-base font-extrabold text-ink leading-tight">Mnyala Co. Ltd</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
                  {isSw ? "Mfumo wa Usimamizi" : "Admin Portal"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="inline-flex size-8 items-center justify-center rounded-lg border border-line bg-paper text-ink-soft hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
              </svg>
            </button>
          </div>

          {/* Language Switcher Card */}
          <div className="mb-4 rounded-xl border border-line bg-paper p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink-soft">
                {isSw ? "Lugha ya Mfumo:" : "System Language:"}
              </span>
              <LanguageSwitcher current={locale} />
            </div>
          </div>

          {/* Quick Alert Badges: Messages & Orders */}
          <div className="mb-5 grid grid-cols-2 gap-2">
            <Link
              href="/admin/messages"
              onClick={() => ref.current?.close()}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-2.5 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline transition-all"
            >
              <div className="flex items-center gap-1.5">
                <svg className="size-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m3 7 9 6 9-6" />
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                </svg>
                <span>{isSw ? "Ujumbe" : "Inbox"}</span>
              </div>
              {typeof counts.messages === "number" && counts.messages > 0 ? (
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-[11px] font-bold text-white shadow-xs">
                  {counts.messages}
                </span>
              ) : (
                <span className="text-muted text-[11px]">0</span>
              )}
            </Link>

            <Link
              href="/admin/orders"
              onClick={() => ref.current?.close()}
              className="flex items-center justify-between rounded-xl border border-line bg-surface p-2.5 text-xs font-bold text-ink shadow-2xs hover:bg-slate-50 no-underline transition-all"
            >
              <div className="flex items-center gap-1.5">
                <svg className="size-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                <span>{isSw ? "Maagizo" : "Orders"}</span>
              </div>
              {typeof counts.orders === "number" && counts.orders > 0 ? (
                <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[11px] font-bold text-white shadow-xs">
                  {counts.orders}
                </span>
              ) : (
                <span className="text-muted text-[11px]">0</span>
              )}
            </Link>
          </div>

          {/* Navigation Group Links */}
          <div className="flex-1 overflow-y-auto">
            <NavLinks groups={groups} />

            {/* Link to Public Website */}
            <div className="mt-5 pt-4 border-t border-line">
              <Link
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-10 items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs font-bold text-ink shadow-2xs hover:bg-slate-100 no-underline transition-all"
              >
                <span className="flex items-center gap-2">
                  <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                  <span>{isSw ? "Fungua Tovuti ya Umma" : "View Public Website"}</span>
                </span>
                <span className="text-xs text-muted">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* User Block & Sign Out */}
          <div className="mt-6 border-t border-line pt-4">
            <UserBlock user={user} />
          </div>
        </div>
      </dialog>
    </>
  );
}
