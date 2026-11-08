"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/public/media-image";
import type { MediaRef } from "@/server/services/site";

export type GalleryEntry = { id: string; title: string; description: string | null; categoryLabel: string; image: MediaRef };

/** A grid of photos using the original Mnyala gallery card design. Pressing one opens it large in a native <dialog>. */
export function GalleryGrid({ items }: { items: GalleryEntry[] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;
  const current = index !== null ? items[index] : undefined;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step]);

  return (
    <>
      <div className="gallery-container">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(i)}
            className="card block w-full text-left border-0 p-0 cursor-pointer"
            aria-label={`Fungua picha: ${item.title}`}
          >
            <MediaImage
              image={item.image}
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw"
              className="size-full object-cover"
            />
            <div className="overlay">
              <h3>{item.title}</h3>
              {item.description ? <p>{item.description}</p> : null}
              <span className="category-badge">{item.categoryLabel}</span>
            </div>
          </button>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label={current ? current.title : "Picha"}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setIndex(null);
        }}
        className="m-auto max-h-[94vh] w-[min(94vw,64rem)] overflow-auto rounded-3xl border border-line bg-surface p-0 shadow-2xl backdrop:bg-black/70"
      >
        {current ? (
          <div className="p-6 sm:p-8">
            <MediaImage image={current.image} sizes="94vw" className="mx-auto max-h-[68vh] w-auto max-w-full rounded-2xl object-contain shadow-md" />
            <div className="mt-6 flex flex-wrap items-start justify-between gap-4 border-t border-line/80 pt-5">
              <div>
                <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {current.categoryLabel}
                </span>
                <p className="mt-1 text-2xl font-bold text-ink">{current.title}</p>
                {current.description ? <p className="mt-2 text-sm text-ink-soft max-w-xl">{current.description}</p> : null}
                <p className="mt-2 text-xs font-semibold text-muted">
                  Picha {(index ?? 0) + 1} kati ya {items.length}
                </p>
              </div>
              <div className="flex gap-2">
                {items.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => step(-1)}
                      className="min-h-10 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink shadow-2xs hover:bg-slate-50 cursor-pointer"
                    >
                      Iliyotangulia
                    </button>
                    <button
                      type="button"
                      onClick={() => step(1)}
                      className="min-h-10 rounded-xl border border-line-strong bg-surface px-4 text-sm font-semibold text-ink shadow-2xs hover:bg-slate-50 cursor-pointer"
                    >
                      Inayofuata
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIndex(null)}
                  className="min-h-10 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-2xs hover:bg-black cursor-pointer"
                >
                  Funga
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
