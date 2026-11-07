"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { COMMON, NAV } from "@/messages/sw";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicNav({ phoneHref, whatsappHref }: { phoneHref?: string; whatsappHref?: string }) {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <nav aria-label="Menyu kuu" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href as Route}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center whitespace-nowrap border-b-2 px-3 text-base no-underline",
                    active ? "border-brand font-semibold text-ink" : "border-transparent text-ink-soft hover:border-line-strong hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="min-h-11 rounded-md border border-line-strong bg-surface px-4 font-semibold text-ink lg:hidden"
      >
        {COMMON.menu}
      </button>

      <dialog
        ref={dialog}
        aria-label={COMMON.menu}
        className="m-0 ml-auto h-full max-h-none w-80 max-w-[88vw] overflow-y-auto border-l border-line bg-paper p-0 backdrop:bg-black/40"
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="flex min-h-full flex-col p-5">
          <div className="mb-6 flex items-center justify-between">
            <p className="font-serif text-xl font-semibold text-brand-dark">Mnyala</p>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="min-h-11 rounded-md border border-line-strong bg-surface px-4 font-semibold text-ink"
            >
              {COMMON.close}
            </button>
          </div>
          <nav aria-label="Menyu ya simu">
            <ul className="divide-y divide-line border-y border-line">
              {NAV.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href as Route}
                      aria-current={active ? "page" : undefined}
                      className={cn("block py-3.5 font-serif text-xl no-underline", active ? "font-semibold text-brand-dark" : "text-ink")}
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
                className="flex min-h-12 items-center justify-center rounded-md border border-brand-dark bg-brand px-5 font-semibold text-white no-underline"
              >
                {COMMON.call}
              </a>
            ) : null}
            {whatsappHref ? (
              <a
                href={whatsappHref}
                className="flex min-h-12 items-center justify-center rounded-md border border-line-strong bg-surface px-5 font-semibold text-ink no-underline"
              >
                {COMMON.whatsapp}
              </a>
            ) : null}
          </div>
        </div>
      </dialog>
    </>
  );
}
