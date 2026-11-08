import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { DirectOrderModal } from "@/components/public/direct-order-modal";
import { getEnv } from "@/lib/env";
import { getLocale } from "@/messages/i18n";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Nishati Safi ya Kisasa" },
  description:
    "Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia kutokana na mabaki ya uzalishaji Mbeya, Tanzania.",
};

const DEFAULT_IMAGES: Record<string, string> = {
  charcoal: "/original/product3.jpg",
  stove: "/original/stove1.jpg",
  seeds: "/original/mbegu.jpg",
  manure: "/original/mbolea.jpg",
};

export default async function HomePage() {
  const [products, site, locale] = await Promise.all([
    getPublishedProducts(),
    getSiteSettings(),
    getLocale(),
  ]);

  const isSw = locale === "sw";
  const appUrl = getEnv().APP_URL.replace(/\/$/, "");

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Mnyala Co. Ltd",
          url: appUrl,
          logo: `${appUrl}/original/logo.png`,
          image: `${appUrl}/original/product3.jpg`,
          ...(site.phone ? { telephone: site.phone } : {}),
          ...(site.email ? { email: site.email } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* =========================
           1. HERO SECTION
      ========================= */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            {isSw ? (
              <>
                Nishati Safi na rafiki kwa Mazingira
                <br />
                <span style={{ color: "var(--accent)" }}>Kwa Maisha Bora</span>
              </>
            ) : (
              <>
                Clean & Eco-Friendly Energy
                <br />
                <span style={{ color: "var(--accent)" }}>For a Better Life</span>
              </>
            )}
          </h1>
          <p>
            {isSw
              ? "Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia kutokana na mabaki ya uzalishaji. Suluhisho la nishati safi majumbani, hoteli, na viwanda."
              : "Mnyala Co. Ltd brings you modern clean bio-charcoal, high-efficiency cookstoves, jatropha curcas seeds, and organic bio-fertilizer. Sustainable clean energy for households, hotels, and industries."}
          </p>
          <div className="hero-buttons flex items-center justify-center gap-4 flex-wrap">
            <Link href="/bidhaa" className="btn flex items-center gap-2">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>{isSw ? "Angalia Bidhaa" : "Explore Products"}</span>
            </Link>

            <Link href="/wasiliana" className="btn-secondary flex items-center gap-2">
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{isSw ? "Wasiliana Nasi" : "Contact Us"}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
           2. WHY CHOOSE US
      ========================= */}
      <section className="why-choose">
        <div className="section-header">
          <span className="section-tag">{isSw ? "Kwanini Mnyala?" : "Why Mnyala?"}</span>
          <h2>{isSw ? "Kwa Nini Wateja Wanatuamini" : "Why Customers Trust Us"}</h2>
          <p>
            {isSw
              ? "Tumejitolea kutoa suluhisho za nishati endelevu kupitia uzalishaji wa mkaa safi unaolinda mazingira na kuokoa misitu."
              : "We are committed to delivering sustainable clean energy solutions through eco-charcoal that protects indigenous forests."}
          </p>
        </div>

        <div className="choose-container">
          {/* Card 1 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <h3>Eco-Friendly</h3>
            <p>
              {isSw
                ? "Mkaa wetu unatengenezwa kutokana na matunda ya mbono, hivyo kupunguza ukataji wa miti na kuhifadhi mazingira."
                : "Our charcoal is made from renewable jatropha fruits, preventing deforestation and preserving biodiversity."}
            </p>
          </div>

          {/* Card 2 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            <h3>{isSw ? "Moto Mrefu" : "Long Burn Time"}</h3>
            <p>
              {isSw
                ? "Unawaka kwa muda mrefu na joto la kudumu, hivyo kuwa bora kwa kupikia majumbani na biashara."
                : "Burns with prolonged, intense heat for 6+ hours, ideal for both domestic and commercial cooking."}
            </p>
          </div>

          {/* Card 3 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3>{isSw ? "Moshi Mdogo" : "Low Smoke"}</h3>
            <p>
              {isSw
                ? "Hutoa moshi mdogo sana na majivu machache, hivyo kuwa salama kwa afya ya familia yako."
                : "Produces minimal smoke and negligible ash, keeping indoor air pure and family lungs safe."}
            </p>
          </div>

          {/* Card 4 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
                <path d="M11 19h8.2a1.8 1.8 0 0 0 1.7-1.2l2-6a1.8 1.8 0 0 0-1.7-2.4H5" />
              </svg>
            </div>
            <h3>{isSw ? "Kuzalisha Mbolea" : "Bio-Fertilizer"}</h3>
            <p>
              {isSw
                ? "Mabaki ya uzalishaji tunayageuza kuwa mbolea asilia bora kwa kilimo cha mazao ya chakula."
                : "Processing by-products are repurposed into nutrient-rich compost that enriches agricultural soil."}
            </p>
          </div>

          {/* Card 5 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M15 18H9" />
                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10" />
                <circle cx="17" cy="18" r="2" />
                <circle cx="7" cy="18" r="2" />
              </svg>
            </div>
            <h3>{isSw ? "Uwasilishaji Wa Uhakika" : "Reliable Delivery"}</h3>
            <p>
              {isSw
                ? "Tunahakikisha bidhaa zinafika kwa wakati kwa wateja wa majumbani, hoteli, viwanda, na masoko."
                : "Timely nationwide distribution ensuring households, schools, hotels, and businesses never run out."}
            </p>
          </div>

          {/* Card 6 */}
          <div className="choose-card">
            <div className="flex justify-center mb-4 text-[#2d7a3e]">
              <svg className="size-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <h3>{isSw ? "Bei Nafuu" : "Affordable Pricing"}</h3>
            <p>
              {isSw
                ? "Mkaa wa ubora wa juu, kwa bei nafuu rafiki kwa mteja."
                : "Top-tier bio-charcoal fuel offered at factory-direct, highly competitive pricing."}
            </p>
          </div>
        </div>
      </section>

      {/* =========================
           3. OUR SERVICES
      ========================= */}
      <section className="services" id="services">
        <div className="section-header">
          <span className="section-tag">{isSw ? "Huduma Zetu" : "Our Services"}</span>
          <h2>{isSw ? "Tunachokifanya" : "What We Do"}</h2>
          <p>
            {isSw
              ? "Tunatoa suluhisho mbalimbali za mazingira kupitia bidhaa za nishati mbadala, usaidizi wa kilimo, na maendeleo ya jamii."
              : "We provide diverse eco-solutions spanning clean cooking fuel, modern cookstoves, agriculture, and community training."}
          </p>
        </div>

        <div className="services-container">
          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
              </svg>
            </div>
            <h3>{isSw ? "Uuzaji na uzalishaji wa Mkaa Safi" : "Clean Charcoal Production"}</h3>
            <p>
              {isSw
                ? "Tunatengeneza na kuuza mkaa safi wa kisasa unaofaa kwa matumizi ya nyumbani, hoteli, na viwanda. Moto wenye joto kali na moshi kwa kiasi kidogo."
                : "Manufacturing and distributing high-density briquettes suitable for homes, hotels, and catering institutions."}
            </p>
          </div>

          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="18" height="12" x="3" y="8" rx="2" />
                <path d="M7 8V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v3" />
              </svg>
            </div>
            <h3>{isSw ? "Uuzaji na uzalishaji wa Majiko" : "Cookstoves (Majiko) Supply"}</h3>
            <p>
              {isSw
                ? "Tunauza majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa na imara."
                : "Supplying durable, insulated cookstoves optimized for complete combustion with bio-charcoal."}
            </p>
          </div>

          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h3>{isSw ? "Uuzaji wa Mbegu za Mbono" : "Jatropha Seeds Supply"}</h3>
            <p>
              {isSw
                ? "Tunatoa mbegu bora za mti wa mbono (Jatropha curcas) kwa wakulima wanaotaka kuanza kilimo cha mti huu."
                : "Providing selected high-yield jatropha curcas seeds to farmers establishing renewable energy tree farms."}
            </p>
          </div>

          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 2v7.31" />
                <path d="M14 9.3V2" />
                <path d="M8.5 2h7" />
                <path d="M14 9.3a6.5 6.5 0 1 1-4 0" />
              </svg>
            </div>
            <h3>{isSw ? "Uuzaji na uzalishaji wa Mboji (Mbolea)" : "Organic Bio-Fertilizer"}</h3>
            <p>
              {isSw
                ? "Mabaki ya mchakato wa kutengeneza mkaa tunayageuza kuwa mbolea asilia yenye virutubisho bora kwa mimea."
                : "Nutrient-rich natural compost produced from organic bio-residue, ideal for rehabilitating agricultural soils."}
            </p>
          </div>

          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
                <path d="M7 16v6" />
                <path d="M13 19v3" />
                <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7l-3.5-4.6a1 1 0 0 0-1.5 0L8.7 7.3a1 1 0 0 0 .8 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H12" />
              </svg>
            </div>
            <h3>{isSw ? "Upandaji Miti" : "Reforestation Support"}</h3>
            <p>
              {isSw
                ? "Tunaunga mkono watu binafsi, shule, taasisi na jamii katika upandaji wa miti ya mbono ili kulinda mazingira."
                : "Supporting community tree planting initiatives with jatropha agroforestry for long-term ecological balance."}
            </p>
          </div>

          <div className="service-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>{isSw ? "Elimu ya Mazingira" : "Environmental Awareness"}</h3>
            <p>
              {isSw
                ? "Tunatoa mafunzo na kuhamasisha jamii kuhusu nishati safi, kuchakata taka, na kulinda mazingira."
                : "Conducting workshops on clean cooking benefits, waste upcycling, and forest conservation."}
            </p>
          </div>
        </div>
      </section>

      {/* =========================
           4. FEATURED PRODUCTS WITH DIRECT WHATSAPP ORDER FLOW
      ========================= */}
      <section className="featured-products" id="products">
        <div className="section-header">
          <span className="section-tag">{isSw ? "Bidhaa Zetu" : "Our Products"}</span>
          <h2>{isSw ? "Bidhaa Zetu Bora Zinazouzika" : "Our Featured Products"}</h2>
          <p>
            {isSw
              ? "Gundua bidhaa zetu zinazolinda mazingira zilizobuniwa kutoa nishati safi, endelevu, na bei nafuu kwa kila mtu."
              : "Explore our eco-friendly products designed to deliver clean, sustainable, and affordable energy."}
          </p>
        </div>

        <div className="products-container">
          {products.map((p) => {
            const fallbackImg = DEFAULT_IMAGES[p.category] || "/original/product3.jpg";
            const detailHref = `/bidhaa/${p.slug}` as Route;
            return (
              <div key={p.id} className="product-card flex flex-col justify-between group">
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
                        {p.features.slice(0, 2).map((f) => (
                          <span key={f} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 truncate max-w-full">
                            <span className="size-1.5 rounded-full bg-[#2d7a3e] shrink-0" />
                            <span className="truncate">{f}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Direct WhatsApp Order Button + Dedicated Detail Page Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                    <DirectOrderModal
                      product={p}
                      buttonLabel={isSw ? "Agiza Sasa" : "Order Now"}
                      buttonClassName="btn-product text-center font-bold text-xs py-2 px-1"
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
            );
          })}
        </div>
      </section>
    </>
  );
}
