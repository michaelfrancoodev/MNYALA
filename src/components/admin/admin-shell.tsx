import Link from "next/link";
import type { ReactNode } from "react";
import { hasRole } from "@/server/auth/roles";
import type { SessionUser } from "@/server/auth/session";
import { MobileNav } from "./mobile-nav";
import { NAV } from "./nav";
import { NavLinks, type NavLinkGroup } from "./nav-links";
import { UserBlock } from "./user-block";

export type NavCounts = { messages?: number; orders?: number };

function visibleGroups(user: SessionUser, counts: NavCounts): NavLinkGroup[] {
  return NAV.map((group) => ({
    label: group.label,
    items: group.items
      .filter((item) => hasRole(user.role, item.min))
      .map((item) => ({ href: item.href, label: item.label, count: item.count ? counts[item.count] : undefined })),
  })).filter((group) => group.items.length > 0);
}

export function AdminShell({ user, counts, children }: { user: SessionUser; counts: NavCounts; children: ReactNode }) {
  const groups = visibleGroups(user, counts);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto border-r border-line bg-surface p-4 lg:flex">
        <div className="px-3 pt-1">
          <p className="font-serif text-2xl font-semibold text-brand-dark">Mnyala</p>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">Admin</p>
        </div>
        <div className="flex-1">
          <NavLinks groups={groups} />
        </div>
        <UserBlock user={user} />
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <Link href="/admin" className="font-serif text-xl font-semibold text-brand-dark no-underline">
            Mnyala Admin
          </Link>
          <MobileNav>
            <div className="flex-1">
              <NavLinks groups={groups} />
            </div>
            <div className="mt-6">
              <UserBlock user={user} />
            </div>
          </MobileNav>
        </header>
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
