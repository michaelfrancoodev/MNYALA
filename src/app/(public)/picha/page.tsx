import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { PageHeading } from "@/components/public/page-heading";
import { cn } from "@/lib/cn";
import { GALLERY_CATEGORY } from "@/messages/sw";
import { getPublishedGallery } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Picha",
  description: "Picha za bidhaa zetu na mchakato wa uzalishaji wa mkaa safi kutoka matunda ya mbono.",
};

type Category = keyof typeof GALLERY_CATEGORY;
const isCategory = (v: unknown): v is Category => typeof v === "string" && v in GALLERY_CATEGORY;

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ kundi?: string }> }) {
  const { kundi } = await searchParams;
  const all = await getPublishedGallery();
  const present = (Object.keys(GALLERY_CATEGORY) as Category[]).filter((c) => all.some((g) => g.category === c));
  const selected = isCategory(kundi) && present.includes(kundi) ? kundi : null;
  const shown = selected ? all.filter((g) => g.category === selected) : all;

  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-10 items-center rounded-md border px-4 text-base no-underline",
      active ? "border-brand-dark bg-brand font-semibold text-white" : "border-line-strong bg-surface text-ink hover:bg-brand-tint",
    );

  return (
    <>
      <PageHeading eyebrow="Picha" title="Tazama kazi zetu">
        <p>Picha za bidhaa zetu na za mchakato wa uzalishaji.</p>
      </PageHeading>
      <section>
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          {all.length === 0 ? (
            <p className="text-lg text-ink-soft">Picha zitaonekana hapa hivi karibuni.</p>
          ) : (
            <>
              {present.length > 1 ? (
                <nav aria-label="Chuja picha kwa aina" className="mb-8 flex flex-wrap gap-2">
                  <Link href="/picha" className={chip(selected === null)} aria-current={selected === null ? "page" : undefined}>
                    Zote
                  </Link>
                  {present.map((c) => (
                    <Link key={c} href={`/picha?kundi=${c}`} className={chip(selected === c)} aria-current={selected === c ? "page" : undefined}>
                      {GALLERY_CATEGORY[c]}
                    </Link>
                  ))}
                </nav>
              ) : null}
              <GalleryGrid
                items={shown.map((g) => ({
                  id: g.id,
                  title: g.title,
                  description: g.description,
                  categoryLabel: GALLERY_CATEGORY[g.category],
                  image: g.image,
                }))}
              />
            </>
          )}
        </div>
      </section>
    </>
  );
}
