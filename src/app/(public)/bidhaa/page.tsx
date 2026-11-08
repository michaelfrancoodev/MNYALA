import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { DirectOrderModal } from "@/components/public/direct-order-modal";
import { formatTzs } from "@/lib/format";
import { getLocale } from "@/messages/i18n";
import { getPublishedProducts } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Bidhaa Zetu | Mnyala Co. Ltd",
  description:
    "Suluhisho lako la nishati safi: Mkaa safi wa mbono, majiko ya ufanisi, mbegu bora za mbono, na mboji (mbolea asilia) Mbeya, Tanzania.",
};

const DEFAULT_IMAGES: Record<string, string> = {
  charcoal: "/original/product3.jpg",
  stove: "/original/stove1.jpg",
  seeds: "/original/mbegu.jpg",
  manure: "/original/mbolea.jpg",
};

export default async function ProductsPage() {
  const [products, locale] = await Promise.all([getPublishedProducts(), getLocale()]);
  const isSw = locale === "sw";

  return (
    <>
      {/* =====================================
              PRODUCTS HERO
      ====================================== */}
      <section className="products-hero">
        <div className="products-overlay">
          <span>{isSw ? "BIDHAA ZETU" : "OUR PRODUCTS"}</span>
          <h1>{isSw ? "Suluhisho Lako la Nishati Safi" : "Your Clean Energy Solution"}</h1>
          <p>
            {isSw
              ? "Kutoka kwenye mti wa mbono (Jatropha curcas), tunakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu bora, na mbolea asilia. Bidhaa zote kwa ajili ya Majumbani, shambani, na biashara yako."
              : "Derived from renewable jatropha curcas biomass, we bring you smokeless bio-charcoal, clean cookstoves, quality seeds, and organic bio-fertilizer for homes and commerce."}
          </p>
        </div>
      </section>

      {/* =====================================
              PRODUCTS INTRO
      ====================================== */}
      <section className="products-intro">
        <div className="container">
          <h2>{isSw ? "Nishati Safi kwa Kila Mtu" : "Clean Energy for Everyone"}</h2>
          <p>
            {isSw
              ? "Mnyala Co. Ltd inatengeneza na kuuza bidhaa nne kuu zinazotokana na mti wa mbono. Kila bidhaa imebuniwa kwa uangalifu ili kutoa thamani kubwa wakati ikilinda mazingira. Chagua kile unachohitaji leo."
              : "Mnyala Co. Ltd manufactures four core products from jatropha biomass. Each is engineered to deliver high performance while preserving our natural environment."}
          </p>
        </div>
      </section>

      {/* =====================================
              ALL PRODUCTS GRID
      ====================================== */}
      <section className="featured-products" style={{ background: "var(--white)" }}>
        <div className="section-title text-center max-w-xl mx-auto mb-10">
          <span className="section-tag">{isSw ? "BIDHAA ZOTE" : "ALL PRODUCTS"}</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {isSw ? "Chagua Kile Unachohitaji" : "Choose What You Need"}
          </h2>
        </div>

        <div className="products-grid">
          {products.map((p) => {
            const fallbackImg = DEFAULT_IMAGES[p.category] || "/original/product3.jpg";
            const detailHref = `/bidhaa/${p.slug}` as Route;
            return (
              <div key={p.id} id={p.slug} className="product-card flex flex-col justify-between scroll-mt-20 group">
                <Link href={detailHref} className="product-image block overflow-hidden">
                  <Image
                    src={fallbackImg}
                    alt={p.name}
                    width={500}
                    height={350}
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
                <div className="product-content flex flex-col justify-between grow p-5">
                  <div>
                    <Link href={detailHref} className="block">
                      <h3 className="flex items-center gap-2 group-hover:text-emerald-800 transition-colors">
                        <svg className="size-5 shrink-0 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                        </svg>
                        <span>{p.name}</span>
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-600 mt-2 mb-3 line-clamp-2 leading-relaxed">{p.summary}</p>

                    {p.features.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {p.features.slice(0, 2).map((feat) => (
                          <span key={feat} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 truncate max-w-full">
                            <span className="size-1.5 rounded-full bg-[#2d7a3e] shrink-0" />
                            <span className="truncate">{feat}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="mb-3">
                      {p.priceTzs ? (
                        <p className="text-base font-extrabold text-[#0f3d2e]">
                          {formatTzs(p.priceTzs)}
                          {p.priceUnit ? <span className="text-xs font-normal text-slate-500"> / {p.priceUnit}</span> : null}
                        </p>
                      ) : (
                        <p className="text-xs font-bold text-slate-500">Wasiliana kwa bei ya kiwandani</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <DirectOrderModal
                        product={p}
                        buttonLabel={isSw ? "Agiza Sasa" : "Order Now"}
                        buttonClassName="btn-product w-full text-center font-bold text-xs py-2 px-1"
                      />
                      <Link
                        href={detailHref}
                        className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 hover:text-emerald-800 py-2 px-1 transition-colors text-center"
                      >
                        {isSw ? "Maelezo Zaidi" : "View Details"}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================
              WHY CHOOSE US (BENEFITS)
      ====================================== */}
      <section className="why-products py-16 bg-[#f8faf7]">
        <div className="section-title text-center max-w-xl mx-auto mb-10">
          <span className="section-tag">{isSw ? "FAIDA ZA BIDHAA ZETU" : "PRODUCT ADVANTAGES"}</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {isSw ? "Kwa Nini Uchague Bidhaa za Mnyala?" : "Why Choose Mnyala Products?"}
          </h2>
        </div>

        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            <h3>{isSw ? "Moto Mrefu" : "Long Burn Time"}</h3>
            <p>
              {isSw
                ? "Mkaa wetu unawaka kwa muda mrefu na kutoa joto la kudumu kwa kipindi cha kupikia chakula chako."
                : "Burns for 6+ hours with steady thermal output, cooking meals completely without refilling."}
            </p>
          </div>

          <div className="benefit-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <h3>{isSw ? "Kulinda Misitu" : "Save Forests"}</h3>
            <p>
              {isSw
                ? "Tunatumia matunda ya mbono yaliyodondoka au kuchumwa, hivyo kupunguza ukataji wa miti ya asili."
                : "Harvested entirely from living jatropha shrubs, halting illegal tree felling across Tanzania."}
            </p>
          </div>

          <div className="benefit-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>{isSw ? "Moshi Mdogo" : "Low Smoke"}</h3>
            <p>
              {isSw
                ? "Inatoa kiwango kidogo cha moshi. Bora kwa afya ya familia na usafi wa mazingira ya nyumbani."
                : "Produces negligible smoke and ash, keeping cookware spotless and respiratory health protected."}
            </p>
          </div>

          <div className="benefit-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>{isSw ? "Endelevu" : "Sustainable"}</h3>
            <p>
              {isSw
                ? "Mti wa mbono unazalisha matunda kila mwaka bila kukatwa. Rasilimali endelevu isiyokwisha."
                : "A renewable annual crop yielding seeds and bio-charcoal year after year without depleting forests."}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
              SPECIFICATIONS TABLE
      ====================================== */}
      <section className="specifications py-16">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">{isSw ? "VIGEZO VYA BIDHAA" : "PRODUCT SPECIFICATIONS"}</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {isSw ? "Sifa za Mkaa Wetu" : "Charcoal Lab Specifications"}
          </h2>
        </div>

        <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>{isSw ? "Kipimo" : "Metric"}</th>
                <th>{isSw ? "Maelezo" : "Specification"}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Malighafi (Raw Material)</strong></td>
                <td>Matunda ya mbono (Jatropha curcas)</td>
              </tr>
              <tr>
                <td><strong>Muda wa Kuwaka (Burn Time)</strong></td>
                <td>Dakika 60 kwa kila gramu 100 (Saa 6+ kwa pakiti ya kaya)</td>
              </tr>
              <tr>
                <td><strong>Joto (Calorific Value)</strong></td>
                <td>17.46 kJ/g</td>
              </tr>
              <tr>
                <td><strong>Carbon Imara (Fixed Carbon)</strong></td>
                <td>22%</td>
              </tr>
              <tr>
                <td><strong>Uwezo wa Kuwaka (Combustibility)</strong></td>
                <td>74.2%</td>
              </tr>
              <tr>
                <td><strong>Majivu (Ash Content)</strong></td>
                <td>4%</td>
              </tr>
              <tr>
                <td><strong>Unyevu (Moisture Content)</strong></td>
                <td>9.1%</td>
              </tr>
              <tr>
                <td><strong>Bora Kwa (Recommended For)</strong></td>
                <td>Kupikia Nyumbani, Hotelini, Migahawa na Viwandani</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* =====================================
              PACKAGING OPTIONS
      ====================================== */}
      <section className="packaging py-16 bg-[#f8faf7]">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">{isSw ? "VIFUNGASHIO VILIVYOPO" : "PACKAGING OPTIONS"}</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {isSw ? "Ukubwa wa Vifungashio (Packages)" : "Available Package Sizes"}
          </h2>
        </div>

        <div className="package-grid">
          <div><span>100gm</span></div>
          <div><span>1 KG</span></div>
          <div><span>5 KG</span></div>
          <div><span>7 KG</span></div>
          <div><span>15 KG</span></div>
          <div><span>30 KG</span></div>
        </div>
      </section>

      {/* =====================================
              CALL TO ACTION (WITH ORDER LINK)
      ====================================== */}
      <section className="products-cta">
        <h2>
          {isSw
            ? "Unahitaji Mkaa Hai na Jiko Lake, Mbegu au Mbolea?"
            : "Need Clean Charcoal, Stoves, Seeds, or Bio-Fertilizer?"}
        </h2>
        <p>
          {isSw
            ? "Wasiliana na Mnyala Co. Ltd leo na upate bei maalum ya kiwandani kulingana na mahitaji yako."
            : "Contact Mnyala Co. Ltd today for factory-direct wholesale and retail pricing."}
        </p>
        <Link href="/wasiliana" className="btn inline-flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>{isSw ? "Wasiliana Nasi" : "Contact Us"}</span>
        </Link>
      </section>
    </>
  );
}
