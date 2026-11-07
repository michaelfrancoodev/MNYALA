import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { PageHeading } from "@/components/public/page-heading";
import { cn } from "@/lib/cn";
import { GALLERY_CATEGORY } from "@/messages/sw";
import { getPublishedGallery } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Picha & Miradi",
  description: "Picha za bidhaa zetu na mchakato wa uzalishaji wa mkaa safi kutoka matunda ya mbono, Mbeya.",
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
      "inline-flex min-h-10 items-center rounded-xl border px-4 py-2 text-sm font-semibold transition-all no-underline shadow-2xs",
      active
        ? "border-brand-dark bg-brand text-white shadow-xs"
        : "border-line-strong bg-surface text-ink hover:bg-slate-100 hover:text-ink",
    );

  return (
    <>
      <PageHeading eyebrow="Nyumba ya Picha" title="Tazama Kazi na Shughuli Zetu">
        <p>Picha halisi za bidhaa zetu, vifungashio, mchakato wa uzalishaji kiwandani, na shughuli za kijamii Mbeya.</p>
      </PageHeading>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {all.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-soft">
              <p className="text-lg">Picha zitaonekana hapa hivi karibuni.</p>
            </div>
          ) : (
            <>
              {present.length > 1 ? (
                <nav aria-label="Chuja picha kwa aina" className="mb-10 flex flex-wrap gap-2.5">
                  <Link href="/picha" className={chip(selected === null)} aria-current={selected === null ? "page" : undefined}>
                    Picha Zote ({all.length})
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
