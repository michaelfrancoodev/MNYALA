import type { Metadata } from "next";
import Link from "next/link";
import { GalleryGrid } from "@/components/public/gallery-grid";
import { cn } from "@/lib/cn";
import { GALLERY_CATEGORY } from "@/messages/sw";
import { getPublishedGallery } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Matukio na Picha | Mnyala Co. Ltd",
  description:
    "Picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii tunayoihudumia jijini Mbeya, Tanzania.",
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
      "inline-flex min-h-10 items-center rounded-full border px-5 py-2 text-sm font-bold transition-colors no-underline",
      active ? "border-[#2d7a3e] bg-[#2d7a3e] text-white shadow-xs" : "border-slate-300 bg-white text-slate-700 hover:bg-emerald-50 hover:text-[#2d7a3e]",
    );

  return (
    <>
      {/* =========================
           1. GALLERY HERO
      ========================= */}
      <section className="contact-hero">
        <div className="contact-overlay">
          <span>MATUKIO NA PICHA</span>
          <h1>Tazama Kazi Zetu</h1>
          <p>
            Picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii tunayoihudumia.
          </p>
        </div>
      </section>

      {/* =========================
           2. GALLERY INTRO
      ========================= */}
      <section className="gallery-intro">
        <div className="section-header">
          <span className="section-tag">Matukio na Picha</span>
          <h2>Picha Zetu</h2>
          <p>
            Angalia picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii inayotumika kwa suluhisho la nishati safi kutoka kwa mti wa mbono.
          </p>
        </div>

        {present.length > 1 ? (
          <nav aria-label="Chuja picha kwa aina" className="mt-8 flex flex-wrap justify-center gap-2.5">
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
      </section>

      {/* =========================
           3. GALLERY GRID
      ========================= */}
      <section className="gallery-section">
        {all.length === 0 ? (
          <div className="mx-auto max-w-4xl px-5 py-12 text-center">
            <p className="text-lg text-ink-soft">Picha zitaonekana hapa hivi karibuni.</p>
          </div>
        ) : (
          <GalleryGrid
            items={shown.map((g) => ({
              id: g.id,
              title: g.title,
              description: g.description,
              categoryLabel: GALLERY_CATEGORY[g.category],
              image: g.image,
            }))}
          />
        )}
      </section>
    </>
  );
}
