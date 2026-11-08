import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ header */

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        {description ? <div className="mt-1.5 max-w-2xl text-sm sm:text-base text-ink-soft leading-relaxed">{description}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- badge */

type Tone = "neutral" | "success" | "warning" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-bold", tones[tone])}>
      {children}
    </span>
  );
}

/* ------------------------------------------------------------ empty / notice */

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center shadow-xs">
      <p className="text-xl font-bold text-ink">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- tabs */

export type TabItem = { href: string; label: string; count?: number; active: boolean };

export function LinkTabs({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 mb-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {items.map((t) => (
          <li key={t.label}>
            <Link
              href={t.href as Route}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 text-sm font-semibold transition-all no-underline",
                t.active
                  ? "border-brand text-brand-dark font-bold"
                  : "border-transparent text-ink-soft hover:border-slate-300 hover:text-ink",
              )}
            >
              <span>{t.label}</span>
              {t.count !== undefined ? (
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", t.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600")}>
                  {t.count}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------- search box */

/** A plain GET form, so searches are bookmarkable and work without JavaScript. */
export function SearchBox({
  action, defaultValue, placeholder, hidden = {}, label = "Search",
}: { action: string; defaultValue?: string; placeholder: string; hidden?: Record<string, string>; label?: string }) {
  return (
    <form action={action} method="get" role="search" className="flex w-full max-w-md gap-2">
      {Object.entries(hidden).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
      <label className="sr-only" htmlFor="q">
        {label}
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={100}
        className="min-h-11 w-full min-w-0 rounded-xl border border-line-strong bg-surface px-4 text-sm text-ink shadow-2xs placeholder:text-muted/60 focus:border-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/15"
      />
      <button
        type="submit"
        className="min-h-11 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink shadow-2xs hover:bg-slate-50 cursor-pointer"
      >
        {label}
      </button>
    </form>
  );
}

/* -------------------------------------------------------------- pagination */

export function Pagination({ page, pages, hrefFor, total, pageSize }: { page: number; pages: number; hrefFor: (p: number) => string; total: number; pageSize: number }) {
  if (pages <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const link = "inline-flex min-h-10 items-center rounded-xl border border-line-strong bg-surface px-3.5 text-sm font-semibold text-ink shadow-2xs no-underline hover:bg-slate-50";
  const off = "inline-flex min-h-10 items-center rounded-xl border border-line bg-paper px-3.5 text-sm text-muted cursor-not-allowed opacity-60";
  return (
    <nav aria-label="Pages" className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line/80 pt-4">
      <p className="text-xs font-medium text-muted">
        Showing <span className="font-bold text-ink">{from}</span> to <span className="font-bold text-ink">{to}</span> of <span className="font-bold text-ink">{total}</span>
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1) as Route} className={link} rel="prev">
            &larr; Previous
          </Link>
        ) : (
          <span className={off} aria-disabled="true">
            &larr; Previous
          </span>
        )}
        <span className="inline-flex min-h-10 items-center px-2 text-xs font-bold text-ink">
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link href={hrefFor(page + 1) as Route} className={link} rel="next">
            Next &rarr;
          </Link>
        ) : (
          <span className={off} aria-disabled="true">
            Next &rarr;
          </span>
        )}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------ responsive "table" */

/** A real table on wide screens, stacked cards on phones. Cells show their label on small screens. */
export function DataTable({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-2xs">
      <table aria-label={label} className="block w-full border-collapse md:table">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="sr-only md:not-sr-only md:table-header-group">
      <tr className="md:table-row md:border-b md:border-line md:bg-slate-50">{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th scope="col" className={cn("px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-muted", className)}>{children}</th>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="block divide-y divide-line md:table-row-group">{children}</tbody>;
}

export function Tr({ children, unread = false }: { children: ReactNode; unread?: boolean }) {
  return <tr className={cn("block px-4 py-3 md:table-row md:p-0 transition-colors hover:bg-slate-50/70", unread && "bg-emerald-50/60 font-semibold")}>{children}</tr>;
}

export function Td({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <td
      data-label={label}
      className={cn(
        "flex items-baseline justify-between gap-4 py-1.5 before:shrink-0 before:text-xs before:font-bold before:uppercase before:tracking-wider before:text-muted before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3.5 md:align-middle md:before:content-none text-sm text-ink",
        className,
      )}
    >
      <span className="min-w-0 text-right md:text-left">{children}</span>
    </td>
  );
}

/* -------------------------------------------------------------- notices */

export function Notice({ notices, code }: { notices: Record<string, string>; code?: string }) {
  const text = code ? notices[code] : undefined;
  if (!text) return null;
  return (
    <div role="status" className="mb-6 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-950 shadow-2xs">
      {text}
    </div>
  );
}
