"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MediaImage } from "@/components/public/media-image";
import type { MediaRef } from "@/server/services/site";

export type GalleryEntry = { id: string; title: string; description: string | null; categoryLabel: string; image: MediaRef };

/** A grid of photos. Pressing one opens it large in a native <dialog>; arrow keys move between photos, Esc closes. */
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
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full text-left"
              aria-label={`Fungua picha: ${item.title}`}
            >
              <MediaImage
                image={item.image}
                sizes="(min-width: 1024px) 22rem, (min-width: 640px) 50vw, 100vw"
                className="aspect-[4/3] w-full rounded-md border border-line object-cover transition-opacity group-hover:opacity-90"
              />
              <span className="mt-2 block font-serif text-lg font-semibold">{item.title}</span>
              <span className="block text-sm text-muted">{item.categoryLabel}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        aria-label={current ? current.title : "Picha"}
        onClose={() => setIndex(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setIndex(null);
        }}
        className="m-auto max-h-[94vh] w-[min(94vw,64rem)] overflow-auto rounded-md border border-line bg-paper p-0 backdrop:bg-black/70"
      >
        {current ? (
          <div className="p-4 sm:p-6">
            <MediaImage image={current.image} sizes="94vw" className="mx-auto max-h-[68vh] w-auto max-w-full rounded-md object-contain" />
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-serif text-xl font-semibold">{current.title}</p>
                {current.description ? <p className="mt-1 text-ink-soft">{current.description}</p> : null}
                <p className="mt-1 text-sm text-muted">
                  Picha {(index ?? 0) + 1} kati ya {items.length}
                </p>
              </div>
              <div className="flex gap-2">
                {items.length > 1 ? (
                  <>
                    <button type="button" onClick={() => step(-1)} className="min-h-11 rounded-md border border-line-strong bg-surface px-4 font-semibold">
                      Iliyotangulia
                    </button>
                    <button type="button" onClick={() => step(1)} className="min-h-11 rounded-md border border-line-strong bg-surface px-4 font-semibold">
                      Inayofuata
                    </button>
                  </>
                ) : null}
                <button type="button" onClick={() => setIndex(null)} className="min-h-11 rounded-md border border-brand-dark bg-brand px-4 font-semibold text-white">
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
