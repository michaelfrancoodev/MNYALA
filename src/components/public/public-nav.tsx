"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { NAV as NAV_SW, COMMON as COMMON_SW } from "@/messages/sw";
import { NAV as NAV_EN, COMMON as COMMON_EN } from "@/messages/en";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNav({
  phoneHref,
  whatsappHref,
  locale = "sw",
}: {
  phoneHref?: string;
  whatsappHref?: string;
  locale?: Locale;
}) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const isSw = locale === "sw";
  const navItems = isSw ? NAV_SW : NAV_EN;
  const common = isSw ? COMMON_SW : COMMON_EN;

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <div className="hidden items-center gap-3 lg:flex">
        <nav aria-label="Menyu kuu / Main Menu">
          <ul className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex items-center rounded-xl px-3.5 py-2 text-sm font-semibold transition-all duration-150 no-underline",
                      active
                        ? "bg-brand text-white shadow-xs"
                        : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <Link href="/wasiliana" className={buttonClasses("primary", "sm", "ml-2")}>
          {isSw ? "Agiza Sasa" : "Order Now"}
        </Link>
      </div>

      <div className="flex items-center gap-2 lg:hidden">
        <LanguageSwitcher current={locale} />
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          aria-haspopup="dialog"
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line-strong bg-surface px-3.5 text-sm font-semibold text-ink shadow-2xs hover:bg-slate-50 cursor-pointer"
        >
          <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
          <span>{common.menu}</span>
        </button>
      </div>

      <dialog
        ref={dialog}
        aria-label={common.menu}
        className="m-0 ml-auto h-full max-h-none w-80 max-w-[88vw] overflow-y-auto border-l border-line bg-surface p-0 shadow-2xl backdrop:bg-black/50"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex min-h-full flex-col p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xl font-bold text-ink">Mnyala Co. Ltd</p>
              <p className="text-xs font-semibold text-muted">
                {isSw ? "Nishati Safi Mbeya" : "Clean Energy Mbeya"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="inline-flex size-9 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink hover:bg-slate-50 cursor-pointer"
              aria-label={common.close}
            >
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">
              {isSw ? "Chagua Lugha" : "Language"}
            </p>
            <LanguageSwitcher current={locale} />
          </div>

          <nav aria-label="Menyu ya simu / Mobile Menu">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-semibold no-underline transition-all",
                        active ? "bg-brand text-white shadow-xs" : "text-slate-800 hover:bg-slate-100",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-auto space-y-3 pt-8">
            {phoneHref ? (
              <a
                href={phoneHref}
                className={buttonClasses("primary", "md", "w-full")}
              >
                {common.call}
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className={buttonClasses("secondary", "md", "w-full")}
              >
                {common.whatsapp}
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
