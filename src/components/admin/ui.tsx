import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ header */

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-ink-soft">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- badge */

type Tone = "neutral" | "success" | "warning" | "danger" | "info";
const tones: Record<Tone, string> = {
  neutral: "bg-paper text-ink-soft border-line-strong",
  success: "bg-brand-tint text-brand-dark border-brand",
  warning: "bg-ember-tint text-ember border-ember",
  danger: "bg-danger-tint text-danger border-danger",
  info: "bg-surface text-ink border-line-strong",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-sm border px-2 py-0.5 text-sm font-semibold", tones[tone])}>{children}</span>;
}

/* ------------------------------------------------------------ empty / notice */

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="font-serif text-xl font-semibold">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-ink-soft">{children}</div> : null}
    </div>
  );
}

/* -------------------------------------------------------------------- tabs */

export type TabItem = { href: string; label: string; count?: number; active: boolean };

export function LinkTabs({ items, label }: { items: TabItem[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-line">
        {items.map((t) => (
          <li key={t.label}>
            <Link
              href={t.href as Route}
              aria-current={t.active ? "page" : undefined}
              className={cn(
                "-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 no-underline",
                t.active ? "border-brand font-semibold text-ink" : "border-transparent text-ink-soft hover:text-ink",
              )}
            >
              {t.label}
              {t.count !== undefined ? <span className="rounded-sm bg-paper px-1.5 text-sm text-muted">{t.count}</span> : null}
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
        className="min-h-11 w-full min-w-0 rounded-md border border-line-strong bg-surface px-3 text-base"
      />
      <button type="submit" className="min-h-11 rounded-md border border-line-strong bg-surface px-4 font-semibold hover:bg-brand-tint">
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
  const link = "inline-flex min-h-11 items-center rounded-md border border-line-strong bg-surface px-4 font-semibold no-underline hover:bg-brand-tint";
  const off = "inline-flex min-h-11 items-center rounded-md border border-line bg-paper px-4 text-muted";
  return (
    <nav aria-label="Pages" className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Showing {from} to {to} of {total}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={hrefFor(page - 1) as Route} className={link} rel="prev">
            Previous
          </Link>
        ) : (
          <span className={off} aria-disabled="true">
            Previous
          </span>
        )}
        <span className="inline-flex min-h-11 items-center px-2 text-ink-soft">
          Page {page} of {pages}
        </span>
        {page < pages ? (
          <Link href={hrefFor(page + 1) as Route} className={link} rel="next">
            Next
          </Link>
        ) : (
          <span className={off} aria-disabled="true">
            Next
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
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <table aria-label={label} className="block w-full border-collapse md:table">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return (
    <thead className="sr-only md:not-sr-only md:table-header-group">
      <tr className="md:table-row md:border-b md:border-line md:bg-paper">{children}</tr>
    </thead>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return <th scope="col" className={cn("px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider text-muted", className)}>{children}</th>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="block divide-y divide-line md:table-row-group">{children}</tbody>;
}

export function Tr({ children, unread = false }: { children: ReactNode; unread?: boolean }) {
  return <tr className={cn("block px-4 py-3 md:table-row md:p-0", unread && "bg-brand-tint/50")}>{children}</tr>;
}

export function Td({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <td
      data-label={label}
      className={cn(
        "flex items-baseline justify-between gap-4 py-1 before:shrink-0 before:text-sm before:font-semibold before:text-muted before:content-[attr(data-label)] md:table-cell md:px-4 md:py-3 md:align-middle md:before:content-none",
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
    <div role="status" className="mb-5 rounded-md border-l-4 border-brand bg-brand-tint px-4 py-3">
      {text}
    </div>
  );
}
