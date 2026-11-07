"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export type NavLinkGroup = { label?: string; items: Array<{ href: string; label: string; count?: number }> };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({ groups }: { groups: NavLinkGroup[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="space-y-6">
      {groups.map((group, i) => (
        <div key={group.label ?? i}>
          {group.label ? (
            <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">{group.label}</p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href as Route}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center justify-between rounded-md border-l-4 px-3 py-2 text-base no-underline",
                      active ? "border-brand bg-brand-tint font-semibold text-ink" : "border-transparent text-ink-soft hover:bg-paper hover:text-ink",
                    )}
                  >
                    <span>{item.label}</span>
                    {item.count ? (
                      <span className="rounded-sm bg-ember-tint px-1.5 text-sm font-semibold text-ember">
                        {item.count}
                        <span className="sr-only"> waiting</span>
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
