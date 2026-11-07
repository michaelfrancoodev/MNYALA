import type { ReactNode } from "react";

/** The opening of every inner page: a clean label, the title, and descriptive text. */
export function PageHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="border-b border-line bg-gradient-to-b from-emerald-50/30 via-white to-paper">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16">
        {eyebrow ? (
          <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/60 shadow-2xs">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h1>
        {children ? <div className="mt-4 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed">{children}</div> : null}
      </div>
    </div>
  );
}
