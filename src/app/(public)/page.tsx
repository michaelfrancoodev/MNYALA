import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { ProductCard } from "@/components/public/product-row";
import { buttonClasses } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa Safi wa Mbono & Majiko ya Kisasa - Mbeya, Tanzania" },
  description:
    "Kiwanda cha mkaa mbadala usio na moshi kutoka matunda ya mbono, majiko ya ufanisi, mbegu bora na mboji (mbolea asilia) Mbeya, Tanzania.",
};

const BENEFITS = [
  {
    titleSw: "Moto wa Kudumu (Saa 6+)",
    titleEn: "Long Heat Duration (6+ Hours)",
    descSw: "Unawaka kwa joto kali na thabiti kwa muda mrefu zaidi ya mkaa wa kawaida, ukipunguza matumizi na gharama.",
    descEn: "Burns with strong, steady heat significantly longer than traditional charcoal, reducing daily fuel costs.",
    icon: (
      <svg className="size-6 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
      </svg>
    ),
  },
  {
    titleSw: "Bila Moshi & Salama kwa Afya",
    titleEn: "Smokeless & Safe for Health",
    descSw: "Hutoa moshi mdogo sana na majivu machache; sufuria hazishiki masizi na hakuna harufu kwenye chakula.",
    descEn: "Produces negligible smoke and minimal ash; cookware stays clean and food maintains its natural flavor.",
    icon: (
      <svg className="size-6 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    titleSw: "Kulinda Misitu ya Asili",
    titleEn: "Indigenous Forest Conservation",
    descSw: "Hautokani na ukataji wa miti ya asili. Unatengenezwa kutokana na matunda ya miti ya mbono (Jatropha curcas).",
    descEn: "Zero deforestation. Manufactured entirely from renewable jatropha curcas seed husks.",
    icon: (
      <svg className="size-6 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
        <path d="M7 16v6" />
        <path d="M13 19v3" />
        <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7l-3.5-4.6a1 1 0 0 0-1.5 0L8.7 7.3a1 1 0 0 0 .8 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H12" />
      </svg>
    ),
  },
  {
    titleSw: "Mbolea Asilia (Mboji)",
    titleEn: "Natural Bio-Fertilizer (Compost)",
    descSw: "Mabaki ya uchakataji yanageuzwa kuwa mboji asilia kurutubisha ardhi na kusaidia kilimo endelevu cha chakula.",
    descEn: "Processing by-products are repurposed into nutrient-rich compost that enriches soil naturally.",
    icon: (
      <svg className="size-6 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const [products, site, locale] = await Promise.all([
    getPublishedProducts(),
    getSiteSettings(),
    getLocale(),
  ]);

  const isSw = locale === "sw";
  const appUrl = getEnv().APP_URL.replace(/\/$/, "");
  const phoneHref = site.phone ? telLink(site.phone) : undefined;
  const whatsappHref = site.whatsapp
    ? whatsappLink(site.whatsapp, isSw ? "Habari Mnyala, nahitaji maelezo na bei ya bidhaa zenu." : "Hello Mnyala, I would like product information and pricing.")
    : undefined;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Mnyala Co. Ltd",
          url: appUrl,
          logo: `${appUrl}/brand/logo.webp`,
          image: `${appUrl}/og.png`,
          ...(site.phone ? { telephone: site.phone } : {}),
          ...(site.email ? { email: site.email } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* Clean, Confident, Dignified Hero Section */}
      <section className="border-b border-line bg-paper py-12 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {isSw ? "Kiwanda cha Mbeya, Tanzania" : "Mbeya Plant, Tanzania"}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-ink leading-tight">
                {isSw ? (
                  <>
                    Mkaa Safi wa Mbono &{" "}
                    <span className="text-emerald-800">Majiko ya Kisasa</span>
                  </>
                ) : (
                  <>
                    Clean Jatropha Bio-Charcoal &{" "}
                    <span className="text-emerald-800">Modern Cookstoves</span>
                  </>
                )}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd inazalisha mkaa mbadala usio na moshi unaotokana na matunda ya mbono na majiko sanifu ya kupikia jijini Mbeya. Pata moto thabiti wa muda mrefu unaookoa gharama za nishati huku ukilinda afya ya familia na misitu ya asili ya Tanzania."
                  : "Mnyala Co. Ltd manufactures smokeless biomass charcoal from jatropha fruits alongside clean cookstoves in Mbeya. Enjoy long-lasting steady cooking heat that reduces fuel costs while protecting family health and Tanzania's indigenous forests."}
              </p>

              {/* Direct Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                {site.phone ? (
                  <a
                    href={phoneHref}
                    className={buttonClasses("primary", "md", "bg-emerald-800 hover:bg-emerald-900 font-bold")}
                  >
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{isSw ? `Piga Simu: ${site.phone}` : `Call: ${site.phone}`}</span>
                  </a>
                ) : null}

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("secondary", "md", "font-semibold")}
                  >
                    <span>{isSw ? "Wasiliana WhatsApp" : "Chat on WhatsApp"}</span>
                  </a>
                ) : null}

                <Link href="/bidhaa" className="text-xs font-bold text-slate-700 hover:text-emerald-800 ml-1">
                  {isSw ? "Tazama Bidhaa Zote &rarr;" : "View All Products &rarr;"}
                </Link>
              </div>

              {/* 3 Clear Pillars */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line/80 pt-6">
                <div>
                  <p className="text-lg font-black text-ink">Saa 6+</p>
                  <p className="text-xs text-muted">{isSw ? "Moto wa Kudumu" : "Long Heat Burn"}</p>
                </div>
                <div>
                  <p className="text-lg font-black text-ink">Bila Moshi</p>
                  <p className="text-xs text-muted">{isSw ? "Salama kwa Afya" : "Clean Cooking"}</p>
                </div>
                <div>
                  <p className="text-lg font-black text-ink">100% Asilia</p>
                  <p className="text-xs text-muted">{isSw ? "Matunda ya Mbono" : "Jatropha Curcas"}</p>
                </div>
              </div>
            </div>

            {/* Visual Photography of the 2 Main Products */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-line bg-surface p-2.5 shadow-xs">
                <Image
                  src="/products/mnyala-charcoal-briquettes.jpg"
                  alt="Mkaa Safi wa Kisasa - Mnyala Bio-Charcoal Briquettes"
                  width={600}
                  height={450}
                  priority
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <div className="mt-2.5 px-1 pb-1">
                  <p className="text-sm font-bold text-ink">{isSw ? "Mkaa Safi wa Kisasa" : "Bio-Charcoal Briquettes"}</p>
                  <p className="text-xs text-muted">{isSw ? "Kutoka matunda ya mbono" : "From jatropha fruit husks"}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-line bg-surface p-2.5 shadow-xs">
                <Image
                  src="/products/mnyala-clean-cookstove.jpg"
                  alt="Majiko ya Ufanisi - Mnyala Clean Cookstove"
                  width={600}
                  height={450}
                  priority
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <div className="mt-2.5 px-1 pb-1">
                  <p className="text-sm font-bold text-ink">{isSw ? "Majiko ya Ufanisi" : "Clean Cookstoves"}</p>
                  <p className="text-xs text-muted">{isSw ? "Kupikia kwa unafuu na uimara" : "Efficient durable cooking"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Products Section from Database */}
      <section id="bidhaa" className="border-b border-line bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {isSw ? "Uzalishaji Wetu" : "Our Production"}
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
              {isSw ? "Bidhaa Zetu za Kiwandani" : "Our Factory Products"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {isSw
                ? "Bidhaa zote zinazalishwa jijini Mbeya na zinapatikana kwa matumizi ya nyumbani, hoteli, shule na biashara za jumla."
                : "All products are manufactured in Mbeya and available for households, hotels, schools, and wholesale distribution."}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={site.whatsapp} />
            ))}
          </div>
        </div>
      </section>

      {/* Clear Factual Benefits of Bio-Charcoal */}
      <section className="border-b border-line bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {isSw ? "Kwa Nini Mnyala?" : "Why Choose Mnyala?"}
            </p>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
              {isSw ? "Faida Halisi za Mkaa wa Mbono" : "Genuine Advantages of Jatropha Charcoal"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {isSw
                ? "Tofauti na mkaa wa kawaida unaotokana na kukata miti ya asili, mkaa wetu unakupa ubora, usafi na ulinzi wa mazingira."
                : "Unlike wood charcoal that causes deforestation, our jatropha charcoal offers high performance, cleanliness, and environmental protection."}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((b) => (
              <div key={b.titleSw} className="rounded-lg border border-line bg-surface p-5 shadow-xs">
                <div className="flex size-10 items-center justify-center rounded bg-emerald-50 text-emerald-800 mb-3.5">
                  {b.icon}
                </div>
                <h3 className="text-base font-bold text-ink">
                  {isSw ? b.titleSw : b.titleEn}
                </h3>
                <p className="mt-2 text-xs text-ink-soft leading-relaxed">
                  {isSw ? b.descSw : b.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sourcing & Community Context */}
      <section className="border-b border-line bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {isSw ? "Kuhusu Kiwanda Chetu" : "About Our Plant"}
              </p>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {isSw ? "Kiwanda cha Mnyala Co. Ltd — Mbeya" : "Mnyala Co. Ltd Plant — Mbeya"}
              </h2>
              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd ni kampuni iliyosajiliwa nchini Tanzania yenye kiwanda chake jijini Mbeya. Lengo letu ni kutoa suluhisho endelevu la nishati ya kupikia inayopunguza utegemezi wa kuni na mkaa wa asili, ikipunguza athari za uharibifu wa mazingira na kuboresha afya ya jamii."
                  : "Mnyala Co. Ltd is a registered Tanzanian company based in Mbeya. Our mission is to provide sustainable clean cooking energy that replaces traditional wood charcoal, reducing deforestation while safeguarding public health."}
              </p>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Tunafanya kazi kwa ukaribu na wakulima wanaokusanya matunda ya mti wa mbono (Jatropha curcas), kisha kuyachakata kiwandani kuwa mkaa bora, majiko ya ufanisi, mbegu za kupanda, na mboji asilia kurutubisha ardhi."
                  : "We collaborate with local farming communities harvesting jatropha curcas seed husks, processing them in our plant into high-grade charcoal briquettes, efficient cookstoves, planting seeds, and organic bio-fertilizer."}
              </p>

              <div className="mt-6 flex flex-wrap gap-4">
                <Link href="/kuhusu" className={buttonClasses("secondary", "sm", "font-bold")}>
                  {isSw ? "Soma Zaidi Kuhusu Sisi" : "Read More About Us"}
                </Link>
                <Link href="/picha" className={buttonClasses("secondary", "sm", "font-bold")}>
                  {isSw ? "Tazama Picha za Kiwandani" : "View Plant Gallery"}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-line bg-paper p-2.5 shadow-xs">
                <Image
                  src="/products/mnyala-jatropha-seeds.jpg"
                  alt="Mbegu Bora za Mbono - Mnyala Co. Ltd"
                  width={500}
                  height={375}
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <p className="mt-2 text-xs font-bold text-ink px-1">
                  {isSw ? "Mbegu Bora za Mbono" : "Jatropha Curcas Seeds"}
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-line bg-paper p-2.5 shadow-xs">
                <Image
                  src="/products/mnyala-organic-fertilizer.jpg"
                  alt="Mbolea Asilia ya Mboji - Mnyala Co. Ltd"
                  width={500}
                  height={375}
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <p className="mt-2 text-xs font-bold text-ink px-1">
                  {isSw ? "Mboji (Mbolea Asilia)" : "Organic Bio-Fertilizer"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Contact & Location Banner */}
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-line bg-surface p-6 sm:p-10 shadow-xs">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {isSw ? "Wasiliana Nasi" : "Contact & Orders"}
                </p>
                <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                  {isSw ? "Tuko Tayari Kukuhudumia" : "Get in Touch with Us"}
                </h2>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">
                  {isSw
                    ? "Iwe unahitaji mzigo wa jumla kwa ajili ya biashara, shule au hoteli, au unahitaji mifuko michache kwa matumizi ya nyumbani, wasiliana nasi moja kwa moja."
                    : "Whether you need bulk wholesale supply for your business, institution, or school, or retail bags for your home, reach out to us directly."}
                </p>

                <div className="mt-6 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5 font-bold">
                    <svg className="size-4 text-emerald-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Mbeya, Tanzania</span>
                  </div>
                  {site.phone ? (
                    <div className="flex items-center gap-2.5 font-bold">
                      <svg className="size-4 text-emerald-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <a href={phoneHref} className="text-ink hover:text-emerald-800 no-underline">
                        {site.phone}
                      </a>
                    </div>
                  ) : null}
                  {site.hours ? (
                    <div className="flex items-center gap-2.5 text-muted">
                      <svg className="size-4 text-emerald-800 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span>{site.hours}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("primary", "md", "bg-emerald-800 hover:bg-emerald-900 font-bold")}
                  >
                    <span>{isSw ? "Tuma Ujumbe WhatsApp" : "Message on WhatsApp"}</span>
                  </a>
                ) : null}
                <Link href="/wasiliana" className={buttonClasses("secondary", "md", "font-bold")}>
                  {isSw ? "Fomu ya Mawasiliano" : "Send Website Message"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
