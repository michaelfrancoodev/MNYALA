import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { ProductCard } from "@/components/public/product-row";
import { SavingsCalculator } from "@/components/public/savings-calculator";
import { FastQuoteWidget } from "@/components/public/fast-quote-widget";
import { RfqForm } from "@/components/public/rfq-form";
import { nowMs } from "@/lib/clock";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Kiwanda cha Mkaa Safi wa Mbono & Majiko Sanifu - Mbeya, Tanzania" },
  description:
    "Kiwanda cha mkaa mbadala usio na moshi kutoka matunda ya mbono, majiko ya kisasa ya ufanisi, mbegu bora na mbolea asilia (mboji) Mbeya. Bei za kiwandani za jumla na rejareja.",
};

const RECENT_DISPATCHES = [
  { destination: "Dar es Salaam (Kariakoo)", orderId: "MN-2026-0012", volume: "Mifuko 60 ya 25kg", statusSw: "Imewasili", statusEn: "Delivered", time: "Saa 4 zilizopita" },
  { destination: "Mbeya Mjini (Mbalizi)", orderId: "MN-2026-0011", volume: "Mifuko 30 ya 25kg & Majiko 5", statusSw: "Imekamilika", statusEn: "Fulfilled", time: "Jana" },
  { destination: "Dodoma (Area D)", orderId: "MN-2026-0009", volume: "Mifuko 40 ya 25kg", statusSw: "Inasafirishwa", statusEn: "In Transit", time: "Siku 2 zilizopita" },
  { destination: "Arusha (Sakina)", orderId: "MN-2026-0007", volume: "Majiko 15 ya Kisasa", statusSw: "Imewasili", statusEn: "Delivered", time: "Siku 3 zilizopita" },
];

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
          logo: `${appUrl}/brand/logo.webp`,
          image: `${appUrl}/og.png`,
          ...(site.phone ? { telephone: site.phone } : {}),
          ...(site.email ? { email: site.email } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* Industrial Commercial Hub Header Bar (Alibaba Style) */}
      <div className="border-b border-slate-800 bg-slate-900 text-white py-2 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-emerald-400 uppercase tracking-wide">
              {isSw ? "Soko la Kiwanda Mbeya" : "Mbeya Plant Sourcing"}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-300 font-medium">
              {isSw
                ? "Oda za Jumla kuanzia Mifuko 20 & Tani 1-20 Zinatumwa Nchi Nzima"
                : "Bulk Wholesale from 20 Bags & 1-20 Tons Delivered Across Tanzania"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>{isSw ? "Huduma ya Wateja & Quotation:" : "Direct Plant Support:"}</span>
            {site.phone ? (
              <a href={telLink(site.phone)} className="text-white hover:text-emerald-300 font-bold no-underline">
                {site.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Above-the-Fold: 3-Column Industrial Command Center (Alibaba / Amazon B2B Showcase) */}
      <section className="border-b border-line bg-paper py-8 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[240px_1fr_310px] items-start">
            
            {/* Column 1: Left Industrial Category Directory */}
            <div className="hidden lg:block rounded-lg border border-line bg-surface p-4 shadow-xs">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-line pb-2.5">
                {isSw ? "Katalogi ya Kiwanda" : "Plant Catalog"}
              </h2>
              <ul className="mt-3 space-y-2 text-xs">
                <li>
                  <Link href="/bidhaa#mkaa-safi-wa-kisasa" className="group block rounded p-2 hover:bg-slate-50 transition-colors no-underline">
                    <p className="font-bold text-ink group-hover:text-emerald-800">
                      {isSw ? "Mkaa wa Mbono 25kg" : "Bio-Charcoal 25kg"}
                    </p>
                    <p className="text-[11px] text-muted">{isSw ? "Kuanzia TZS 22,000 / mfuko" : "From TZS 22,000 / bag"}</p>
                  </Link>
                </li>
                <li>
                  <Link href="/bidhaa#majiko-ya-ufanisi" className="group block rounded p-2 hover:bg-slate-50 transition-colors no-underline">
                    <p className="font-bold text-ink group-hover:text-emerald-800">
                      {isSw ? "Majiko ya Kisasa" : "Clean Cookstoves"}
                    </p>
                    <p className="text-[11px] text-muted">{isSw ? "Yanaokoa 50% ya mkaa" : "Save 50% fuel"}</p>
                  </Link>
                </li>
                <li>
                  <Link href="/bidhaa#mbegu-za-mbono" className="group block rounded p-2 hover:bg-slate-50 transition-colors no-underline">
                    <p className="font-bold text-ink group-hover:text-emerald-800">
                      {isSw ? "Mbegu Bora za Mbono" : "Jatropha Seeds"}
                    </p>
                    <p className="text-[11px] text-muted">{isSw ? "Uotaji 90%+, kilimo & nishati" : "90%+ germination rate"}</p>
                  </Link>
                </li>
                <li>
                  <Link href="/bidhaa#mboji-mbolea-asilia" className="group block rounded p-2 hover:bg-slate-50 transition-colors no-underline">
                    <p className="font-bold text-ink group-hover:text-emerald-800">
                      {isSw ? "Mbolea ya Mboji" : "Organic Fertilizer"}
                    </p>
                    <p className="text-[11px] text-muted">{isSw ? "Virutubisho vingi vya N-P-K" : "Rich organic N-P-K"}</p>
                  </Link>
                </li>
                <li className="border-t border-line/80 pt-2">
                  <Link href="/wasiliana" className="group block rounded p-2 hover:bg-slate-50 transition-colors no-underline">
                    <p className="font-bold text-ink group-hover:text-emerald-800">
                      {isSw ? "Usafirishaji Mikoani" : "Countrywide Logistics"}
                    </p>
                    <p className="text-[11px] text-muted">{isSw ? "Dar, Dodoma, Arusha, Mwanza" : "Direct freight handling"}</p>
                  </Link>
                </li>
              </ul>

              <div className="mt-5 rounded border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-700">
                <p className="font-bold text-slate-900">{isSw ? "Masaa ya Kazi Kiwandani:" : "Factory Hours:"}</p>
                <p className="mt-0.5 text-muted">{site.hours || "Jumatatu - Jumamosi (08:00 - 17:30)"}</p>
                <p className="mt-1 font-bold text-emerald-800">{isSw ? "Uwezo: Tani 50+ kwa mwezi" : "Capacity: 50T/month"}</p>
              </div>
            </div>

            {/* Column 2: Center Commercial Showcase Banner with Tiered Price Matrix */}
            <div className="rounded-lg border border-line bg-surface p-5 sm:p-7 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  {isSw ? "Kiwanda Kikuu cha Mbeya • B2B Direct" : "Main Mbeya Factory • B2B Direct"}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {isSw ? "Uzalishaji Endelevu wa Nishati" : "Sustainable Energy Production"}
                </span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-ink leading-tight">
                {isSw ? (
                  <>
                    Mkaa Safi wa Mbono & Majiko Sanifu:{" "}
                    <span className="text-emerald-800">Moto wa Saa 6+ Bila Moshi</span>
                  </>
                ) : (
                  <>
                    Smokeless Jatropha Bio-Charcoal & Cookstoves:{" "}
                    <span className="text-emerald-800">6+ Hours Steady Heat</span>
                  </>
                )}
              </h1>

              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd inazalisha mkaa mbadala wenye joto kali na muda mrefu wa kupikia kutoka matunda ya mbono. Ni nishati safi inayookoa hadi 45% ya gharama za nishati kwa majumbani, hoteli, shule za bweni, kambi na viwanda, ikilinda misitu ya asili ya Tanzania."
                  : "Mnyala Co. Ltd produces dense, high-heat biomass charcoal briquettes manufactured from jatropha seed husks. Save up to 45% on cooking expenses across hotels, schools, households, and poultry farms while ending toxic kitchen smoke."}
              </p>

              {/* Real B2B Tiered Wholesale Pricing Matrix */}
              <div className="mt-5 rounded-md border border-slate-300 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
                  {isSw ? "Bei za Kiwandani (Mkaa wa 25kg):" : "Factory Wholesale Price Schedule (25kg Bag):"}
                </p>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <div className="rounded border border-slate-200 bg-white p-2.5">
                    <p className="text-slate-500 font-semibold">{isSw ? "1 - 19 Mifuko (Rejareja)" : "1 - 19 Bags (Retail)"}</p>
                    <p className="text-base font-black text-ink mt-0.5">TZS 28,000</p>
                    <p className="text-[11px] text-muted">{isSw ? "kwa mfuko wa 25kg" : "per 25kg sack"}</p>
                  </div>
                  <div className="rounded border-2 border-emerald-600 bg-emerald-50/60 p-2.5">
                    <p className="text-emerald-900 font-bold">{isSw ? "20 - 99 Mifuko (Jumla)" : "20 - 99 Bags (Wholesale)"}</p>
                    <p className="text-base font-black text-emerald-900 mt-0.5">TZS 25,000</p>
                    <p className="text-[11px] font-semibold text-emerald-800">{isSw ? "Okoa TZS 3,000 / mfuko" : "Save TZS 3,000 / bag"}</p>
                  </div>
                  <div className="rounded border border-slate-200 bg-white p-2.5">
                    <p className="text-slate-500 font-semibold">{isSw ? "100+ Mifuko (Mawakala)" : "100+ Bags (Distributors)"}</p>
                    <p className="text-base font-black text-ink mt-0.5">TZS 22,000</p>
                    <p className="text-[11px] font-semibold text-emerald-800">{isSw ? "Okoa TZS 6,000 / mfuko" : "Save TZS 6,000 / bag"}</p>
                  </div>
                </div>
              </div>

              {/* Commercial Specs Strip */}
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4 text-center">
                <div className="rounded border border-line bg-paper p-2">
                  <p className="text-sm font-black text-slate-900">Saa 6 - 8</p>
                  <p className="text-[11px] font-semibold text-muted">{isSw ? "Muda wa Joto" : "Burn Duration"}</p>
                </div>
                <div className="rounded border border-line bg-paper p-2">
                  <p className="text-sm font-black text-slate-900">0% Moshi</p>
                  <p className="text-[11px] font-semibold text-muted">{isSw ? "Bila Harufu" : "Zero Smoke"}</p>
                </div>
                <div className="rounded border border-line bg-paper p-2">
                  <p className="text-sm font-black text-slate-900">&lt; 8% Unyevu</p>
                  <p className="text-[11px] font-semibold text-muted">{isSw ? "Upimaji Maabara" : "Lab Tested"}</p>
                </div>
                <div className="rounded border border-line bg-paper p-2">
                  <p className="text-sm font-black text-slate-900">Tani 50+</p>
                  <p className="text-[11px] font-semibold text-muted">{isSw ? "Uwezo wa Mwezi" : "Monthly Supply"}</p>
                </div>
              </div>

              {/* Direct Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {site.whatsapp ? (
                  <a
                    href={whatsappLink(site.whatsapp, "Habari Mnyala Co. Ltd, nahitaji kuagiza mkaa wa jumla kutoka kiwandani. Naomba bei na maelekezo ya usafirishaji.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded bg-emerald-700 hover:bg-emerald-800 px-5 py-2.5 text-xs font-bold text-white transition-colors no-underline shadow-xs"
                  >
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                    </svg>
                    <span>{isSw ? "Agiza Mzigo wa Jumla (WhatsApp)" : "Order Wholesale via WhatsApp"}</span>
                  </a>
                ) : null}
                <a
                  href="#rfq"
                  className="inline-flex items-center gap-2 rounded border border-slate-900 bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition-colors no-underline"
                >
                  <span>{isSw ? "Omba Nukuu ya Bei (RFQ)" : "Submit RFQ Quotation"}</span>
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 3: Right Verified Manufacturer Profile & Fast Quote Calculator */}
            <FastQuoteWidget whatsapp={site.whatsapp} locale={locale} />
          </div>
        </div>
      </section>

      {/* Section 2: Factory Direct Products Grid (Amazon / Alibaba Product Showcase) */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4 mb-8">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                {isSw ? "Bidhaa za Kiwanda Mbeya" : "Factory Direct Sourcing"}
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                {isSw ? "Katalogi Kamili ya Uzalishaji" : "Complete Manufacturing Catalog"}
              </h2>
            </div>
            <Link href="/bidhaa" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 no-underline">
              <span>{isSw ? "Tazama Bidhaa Zote Kiwandani" : "View Complete Catalog"}</span>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={site.whatsapp} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: Dedicated B2B Request for Quotation (RFQ) Form (The Alibaba Signature) */}
      <section className="border-b border-line bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <RfqForm whatsapp={site.whatsapp} locale={locale} renderedAt={nowMs()} />
        </div>
      </section>

      {/* Section 4: Technical Specifications & Laboratory Performance Matrix */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {isSw ? "Vipimo vya Maabara & Uhandisi" : "Lab Testing & Engineering Data"}
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {isSw ? "Mkaa wa Mbono dhidi ya Mkaa wa Kawaida wa Kuni" : "Bio-Charcoal vs. Traditional Wood Charcoal"}
            </h2>
            <p className="mt-1.5 text-xs text-ink-soft">
              {isSw
                ? "Data rasmi za kimaabara zinazothibitisha kwa nini migahawa, hoteli, shule na wafugaji wa kuku wanabadili kwenda Mnyala."
                : "Official lab-verified engineering specifications showing why commercial entities switch to Mnyala bio-charcoal."}
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-line bg-surface shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-slate-900 text-white font-bold uppercase tracking-wider">
                    <th className="px-4 py-3.5">{isSw ? "Kipengele cha Kiufundi" : "Technical Metric"}</th>
                    <th className="px-4 py-3.5 bg-emerald-900 text-emerald-200 font-black">
                      {isSw ? "Mkaa wa Mbono (Mnyala Co. Ltd)" : "Mnyala Bio-Charcoal"}
                    </th>
                    <th className="px-4 py-3.5 text-slate-300">{isSw ? "Mkaa wa Kawaida wa Miti" : "Traditional Wood Charcoal"}</th>
                    <th className="px-4 py-3.5 text-emerald-400">{isSw ? "Faida kwa Mnunuzi" : "Commercial Advantage"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Kiwango cha Joto (Calorific Value)" : "Calorific Value"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">4,800 - 5,200 kcal/kg</td>
                    <td className="px-4 py-3 text-slate-600">3,000 - 3,500 kcal/kg</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Chakula kinaiva haraka zaidi kwa 35%" : "35% faster boiling and grilling"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Muda wa Kuwaka (Burn Time)" : "Burn Duration"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">Saa 6 hadi 8 mfululizo</td>
                    <td className="px-4 py-3 text-slate-600">Saa 2 hadi 3 pekee</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Mfuko 1 unatosha siku nyingi bila kuongeza kila saa" : "Cuts bag consumption by half"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Asilimia ya Unyevu (Moisture Content)" : "Moisture Content"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">&lt; 8% (Imepimwa Kiwandani)</td>
                    <td className="px-4 py-3 text-slate-600">18% - 25% (Hupoteza uzito)</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Hauzimiki, haulipuki wala kutoa cheche za hatari" : "Zero sparks, instant ignition"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Moshi & Masizi (Smoke & Soot)" : "Smoke & Carbon Soot"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">0% Moshi (Haina Carbon Monoxide nzito)</td>
                    <td className="px-4 py-3 text-slate-600">Moshi mzito na masizi meusi</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Sufuria zinabaki safi, wapishi hawakohoi" : "Pots stay shiny, zero respiratory hazards"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Asilimia ya Majivu (Ash Content)" : "Ash Residue"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">&lt; 4% (Majivu mepesi sana)</td>
                    <td className="px-4 py-3 text-slate-600">14% - 20% (Uchafu mwingi jikoni)</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Jiko linabaki safi, hakuna kuziba hewa" : "Clean ash pit, uninterrupted airflow"}</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold">{isSw ? "Athari za Mazingira" : "Environmental Impact"}</td>
                    <td className="px-4 py-3 font-black text-emerald-900 bg-emerald-50/50">100% maganda ya matunda ya mbono</td>
                    <td className="px-4 py-3 text-slate-600">Ukataji miti ya asili ya Tanzania</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{isSw ? "Inalinda misitu, inapata kibali cha ESG" : "100% deforestation-free ESG compliance"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Interactive Monthly Energy Savings Calculator */}
      <section className="border-b border-line bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SavingsCalculator whatsapp={site.whatsapp} locale={locale} />
        </div>
      </section>

      {/* Section 6: Recent Dispatches & Live Delivery Feed (Transparency & Trust) */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4 mb-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                {isSw ? "Uthibitisho wa Mizigo ya Kiwandani" : "Live Factory Dispatches"}
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                {isSw ? "Mizigo Iliyotumwa Hivi Karibuni Mikoani" : "Recent Commercial Orders & Freight"}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {isSw ? "Inasasishwa Moja kwa Moja kutoka Mfumo wa Oda" : "Live Feed from Mnyala Logistics"}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {RECENT_DISPATCHES.map((d) => (
              <div key={d.orderId} className="rounded-lg border border-line bg-paper p-4 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-700">{d.orderId}</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                    {isSw ? d.statusSw : d.statusEn}
                  </span>
                </div>
                <p className="mt-2 text-sm font-extrabold text-ink">{d.destination}</p>
                <p className="mt-1 font-semibold text-emerald-800">{d.volume}</p>
                <p className="mt-2 text-[11px] text-muted">{d.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: B2B Trade Assurance & Buyer Guarantees */}
      <section className="border-b border-line bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {isSw ? "Uhakika wa Biashara na Usalama" : "Trade Assurance & Guarantees"}
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {isSw ? "Kwa Nini Ununue Moja kwa Moja Kiwandani Mnyala?" : "Why Source Factory-Direct with Mnyala?"}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-line bg-surface p-5 shadow-2xs">
              <div className="flex size-9 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-black mb-3">
                1
              </div>
              <h3 className="text-sm font-black text-ink">
                {isSw ? "Uhakika wa Ubora wa Kiwanda" : "Lab Quality Guarantee"}
              </h3>
              <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                {isSw
                  ? "Kila mzigo unapimwa kiwango cha unyevu (chini ya 8%) na nguvu ya mgandamizo ili kuzuia kuvunjika njiani."
                  : "Every production batch undergoes moisture (<8%) and density testing before packaging for zero in-transit crumbling."}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5 shadow-2xs">
              <div className="flex size-9 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-black mb-3">
                2
              </div>
              <h3 className="text-sm font-black text-ink">
                {isSw ? "Risiti Rasmi ya Kodi (TRA EFD)" : "TRA EFD Invoice"}
              </h3>
              <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                {isSw
                  ? "Tunatoa risiti rasmi za kodi za EFD na ankara rasmi za proforma kwa taasisi, mashule na kampuni."
                  : "Full fiscal compliance with official TRA EFD tax receipts and stamped proforma invoices for institutional procurement."}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5 shadow-2xs">
              <div className="flex size-9 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-black mb-3">
                3
              </div>
              <h3 className="text-sm font-black text-ink">
                {isSw ? "Usafirishaji Salama Nchi Nzima" : "Nationwide Freight"}
              </h3>
              <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                {isSw
                  ? "Tunashirikiana na malori ya mizigo na mabasi ya kuaminika kufikisha mzigo hadi Dar, Dodoma, Arusha, Mwanza na kote nchini."
                  : "Direct freight coordination via trusted carriers and logistics partners delivering across all Tanzanian regions."}
              </p>
            </div>

            <div className="rounded-lg border border-line bg-surface p-5 shadow-2xs">
              <div className="flex size-9 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-black mb-3">
                4
              </div>
              <h3 className="text-sm font-black text-ink">
                {isSw ? "Mkataba wa Ugavi wa Kila Mwezi" : "Annual Supply Contracts"}
              </h3>
              <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                {isSw
                  ? "Hoteli na shule zenye mikataba hupatiwa mzigo kwa ratiba maalum bila kukosa hata wakati wa mvua au masika."
                  : "Guaranteed monthly delivery buffers for contracted schools and hotels with zero rainy-season supply disruptions."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Verified Commercial Buyer Reviews (Social Proof) */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
              {isSw ? "Ushuhuda wa Wanunuzi wa Kibiashara" : "Verified Buyer Reviews"}
            </span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {isSw ? "Wateja Wetu Wanasema Nini?" : "Commercial Client Feedback"}
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-lg border border-line bg-paper p-5 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2.5" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Tumekuwa tukitumia mkaa wa Mnyala kwa ajili ya kuchoma nyama hotelini kwetu Mbeya. Joto lake linadumu masaa 7 na halina harufu yoyote inayobadilisha ladha ya nyama. Tumeokoa zaidi ya laki tatu kila mwezi."'
                  : '"We use Mnyala bio-charcoal for our hotel grill operations in Mbeya. The heat holds steady for 7 hours without any wood odor affecting meat flavors. We saved over TZS 300,000 monthly."'}
              </p>
              <div className="mt-3.5 border-t border-line/80 pt-2.5">
                <p className="text-xs font-bold text-ink">Meneja wa Jiko</p>
                <p className="text-[11px] text-muted">Mbeya Peak Hotel &bull; Aliagiza Mifuko 120 (25kg)</p>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-paper p-5 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2.5" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Kwa shule yetu yenye wanafunzi zaidi ya 800, kuchemsha maharage na ugali ilikuwa gharama kubwa sana kwa kuni. Tangu tuweke majiko sanifu na kuanza kutumia mkaa wa mbono, jiko ni safi na wapishi wetu hawapati tena kikohozi cha moshi."'
                  : '"For our boarding school with 800+ students, cooking was a massive firewood cost. Since installing efficient cookstoves and switching to jatropha charcoal, our kitchens are clean and cooks no longer suffer from smoke coughs."'}
              </p>
              <div className="mt-3.5 border-t border-line/80 pt-2.5">
                <p className="text-xs font-bold text-ink">Msimamizi wa Shule</p>
                <p className="text-[11px] text-muted">Shule ya Sekondari Iyunga, Mbeya &bull; Aliagiza Tani 2</p>
              </div>
            </div>

            <div className="rounded-lg border border-line bg-paper p-5 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-2.5" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-xs text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Mimi ni mfugaji wa kuku Mbalizi. Kupasha vifaranga joto la usiku kwa mkaa wa kawaida ilikuwa inaua vifaranga kwa moshi wa sumu. Mkaa wa Mnyala hauna moshi kabisa na unawaka usiku mzima hadi asubuhi."'
                  : '"As a poultry farmer in Mbalizi, brooding chicks with wood charcoal killed chicks with toxic carbon smoke. Mnyala charcoal produces zero smoke and burns straight through the night until dawn."'}
              </p>
              <div className="mt-3.5 border-t border-line/80 pt-2.5">
                <p className="text-xs font-bold text-ink">Erick Mwasambili</p>
                <p className="text-[11px] text-muted">Mfugaji wa Kuku, Mbalizi &bull; Aliagiza Mifuko 45</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production & Sourcing Story with Actual Imagery */}
      <section className="border-b border-line bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                {isSw ? "Uchakataji wa Kiwandani & Wakulima" : "Local Manufacturing & Sourcing"}
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">
                {isSw ? "Mtandao wa Wakulima 1,200+ wa Mbeya & Songwe" : "1,200+ Smallholder Sourcing Network"}
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd haitegemei madalali. Tunafanya kazi moja kwa moja na zaidi ya wakulima 1,200 wa mikoa ya Mbeya, Songwe na Rukwa wanaokusanya matunda ya mbono kutoka kwenye uzio na mashamba yao. Tunalipa fedha taslimu kijijini, kisha kusindika na kupima ubora katika kiwanda chetu kilichopo Mbeya."
                  : "Mnyala Co. Ltd sources directly from over 1,200 smallholder farmer families in Mbeya, Songwe, and Rukwa who harvest jatropha curcas. We provide guaranteed rural cash income, then process and quality-test each batch in our Mbeya plant."}
              </p>

              <div className="mt-5 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <svg className="size-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-800">
                    {isSw ? "Ufungashaji mzito wa mifuko ya poly inayozuia unyevu na isiyochafua gari." : "Heavy-duty poly-woven sacks preventing moisture penetration and soilage."}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <svg className="size-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-800">
                    {isSw ? "Akiba thabiti ya kiwanda inayohakikisha upatikanaji wa mzigo hata wakati wa masika." : "Permanent warehouse buffer securing steady supply even in peak rain seasons."}
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <svg className="size-4 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <p className="text-xs font-semibold text-slate-800">
                    {isSw ? "Kila tani ya mkaa wa mbono inalinda hekta 0.8 ya misitu ya asili ya Tanzania." : "Every ton of jatropha charcoal protects 0.8 hectares of indigenous forests."}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-lg border border-line bg-surface p-2 shadow-xs">
                <Image
                  src="/products/mnyala-charcoal-briquettes.jpg"
                  alt="Mkaa wa Mbono - Mnyala Bio-Charcoal"
                  width={500}
                  height={380}
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <p className="mt-2 text-xs font-bold text-ink px-1">
                  {isSw ? "Mkaa wa Mawe wa Mbono 25kg" : "Hexagonal Bio-Charcoal 25kg"}
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border border-line bg-surface p-2 shadow-xs">
                <Image
                  src="/products/mnyala-clean-cookstove.jpg"
                  alt="Majiko Sanifu ya Kisasa - Mnyala"
                  width={500}
                  height={380}
                  className="aspect-[4/3] w-full rounded object-cover"
                />
                <p className="mt-2 text-xs font-bold text-ink px-1">
                  {isSw ? "Jiko la Kisasa la Ufanisi" : "Clean Biomass Cookstove"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
