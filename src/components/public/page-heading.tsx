import type { ReactNode } from "react";

/** The opening of every inner page: a small label, the title, and one plain paragraph. */
export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wider text-ember">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-3xl text-4xl font-semibold sm:text-5xl">{title}</h1>
        {children ? <div className="mt-5 max-w-2xl text-lg text-ink-soft">{children}</div> : null}
      </div>
    </div>
  );
}
