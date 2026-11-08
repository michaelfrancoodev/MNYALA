import type { Metadata } from "next";
import Image from "next/image";
import { MediaImage } from "@/components/public/media-image";
import { getLocale } from "@/messages/i18n";
import { getPublishedGallery } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Matukio na Picha | Mnyala Co. Ltd",
  description:
    "Picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii tunayoihudumia jijini Mbeya, Tanzania.",
};

const FALLBACK_GALLERY = [
  {
    image: "/original/product3.jpg",
    titleSw: "Mkaa Safi wa Kisasa",
    titleEn: "Clean Bio-Charcoal",
    descSw: "Mkaa wetu unaotokana na matunda ya mbono",
    descEn: "Our charcoal briquettes from jatropha fruits",
    categorySw: "Bidhaa",
    categoryEn: "Product",
  },
  {
    image: "/original/stove1.jpg",
    titleSw: "Majiko ya Ufanisi",
    titleEn: "Efficient Cookstoves",
    descSw: "Majiko yetu yanayotumia mkaa kwa ufanisi",
    descEn: "Insulated stoves designed for smokeless briquettes",
    categorySw: "Bidhaa",
    categoryEn: "Product",
  },
  {
    image: "/original/mbegu.jpg",
    titleSw: "Mbegu za Mbono",
    titleEn: "Jatropha Curcas Seeds",
    descSw: "Mbegu bora za mti wa mbono kwa upandaji",
    descEn: "Selected seeds for agroforestry cultivation",
    categorySw: "Bidhaa",
    categoryEn: "Product",
  },
  {
    image: "/original/mbolea.jpg",
    titleSw: "Mboji - Mbolea Asilia",
    titleEn: "Organic Bio-Fertilizer",
    descSw: "Mbolea kutokana na mabaki ya uzalishaji",
    descEn: "Compost generated from processing residues",
    categorySw: "Bidhaa",
    categoryEn: "Product",
  },
  {
    image: "/original/uzalishaji mkaa.jpg",
    titleSw: "Mchakato wa Uzalishaji",
    titleEn: "Production Process",
    descSw: "Wafanyakazi wetu wakitengeneza mkaa kiwandani Mbeya",
    descEn: "Our factory staff carbonizing and compacting briquettes",
    categorySw: "Uzalishaji",
    categoryEn: "Production",
  },
  {
    image: "/original/mkaa wa jumla.jpg",
    titleSw: "Uuzaji wa Jumla",
    titleEn: "Wholesale Distribution",
    descSw: "Mifuko ya mkaa iko tayari kusafirishwa mikoani",
    descEn: "Packaged bio-charcoal sacks ready for dispatch",
    categorySw: "Usafirishaji",
    categoryEn: "Delivery",
  },
];

export default async function GalleryPage() {
  const [items, locale] = await Promise.all([getPublishedGallery(), getLocale()]);
  const isSw = locale === "sw";

  return (
    <>
      {/* =========================
           1. GALLERY HERO
      ========================= */}
      <section className="contact-hero" style={{ minHeight: "45vh", marginTop: 0 }}>
        <div className="contact-overlay">
          <span>{isSw ? "MATUKIO NA PICHA" : "EVENTS & GALLERY"}</span>
          <h1>{isSw ? "Tazama Kazi Zetu" : "View Our Work"}</h1>
          <p>
            {isSw
              ? "Picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii tunayoihudumia."
              : "Photographs of our production facility, clean products, and community impact."}
          </p>
        </div>
      </section>

      {/* =========================
           2. GALLERY INTRO
      ========================= */}
      <section className="gallery-intro">
        <div className="section-header">
          <span className="section-tag">{isSw ? "Matukio na Picha" : "Events & Photos"}</span>
          <h2>{isSw ? "Picha Zetu" : "Our Gallery"}</h2>
          <p>
            {isSw
              ? "Angalia picha za mchakato wetu wa uzalishaji, bidhaa zetu, na jamii inayotumika kwa suluhisho la nishati safi kutoka kwa mti wa mbono."
              : "Witness our eco-charcoal carbonization, packaging facilities, and nationwide distribution from Mbeya."}
          </p>
        </div>
      </section>

      {/* =========================
           3. GALLERY GRID
      ========================= */}
      <section className="gallery-section">
        <div className="gallery-container">
          {items.length > 0
            ? items.map((item) => (
                <div key={item.id} className="card">
                  {item.image ? (
                    <MediaImage
                      image={item.image}
                      sizes="(min-width: 1024px) 24rem, 100vw"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                      Mnyala Co. Ltd
                    </div>
                  )}
                  <div className="overlay">
                    <h3>{item.title}</h3>
                    {item.description ? <p>{item.description}</p> : null}
                    <span className="category-badge">{item.category}</span>
                  </div>
                </div>
              ))
            : FALLBACK_GALLERY.map((f) => (
                <div key={f.titleSw} className="card">
                  <Image
                    src={f.image}
                    alt={f.titleSw}
                    width={600}
                    height={450}
                    className="size-full object-cover"
                  />
                  <div className="overlay">
                    <h3>{isSw ? f.titleSw : f.titleEn}</h3>
                    <p>{isSw ? f.descSw : f.descEn}</p>
                    <span className="category-badge">{isSw ? f.categorySw : f.categoryEn}</span>
                  </div>
                </div>
              ))}
        </div>
      </section>
    </>
  );
}
