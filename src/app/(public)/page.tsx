import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { ProductCard } from "@/components/public/product-row";
import { SavingsCalculator } from "@/components/public/savings-calculator";
import { buttonClasses } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa Safi wa Mbono & Majiko Sanifu - Mbeya, Tanzania" },
  description:
    "Kiwanda cha mkaa mbadala usio na moshi kutoka matunda ya mbono, majiko ya kisasa, mbegu bora na mbolea asilia (mboji) Mbeya. Bei ya kiwandani ya jumla na rejareja.",
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
          logo: `${appUrl}/brand/logo.webp`,
          image: `${appUrl}/og.png`,
          ...(site.phone ? { telephone: site.phone } : {}),
          ...(site.email ? { email: site.email } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* Commercial Announcement Banner */}
      <div className="bg-emerald-900 text-white border-b border-emerald-950 py-2.5 px-5 sm:px-8 text-xs font-semibold">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
            <span>
              {isSw
                ? "Kiwanda Kipo Mbeya • Oda za Jumla & Rejareja Zinatumwa Nchi Nzima"
                : "Factory in Mbeya • Bulk Wholesale & Retail Delivered Countrywide"}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-emerald-200">
            <span>{isSw ? "Hoteli, Shule na Mikahawa: Bei Maalum ya Kiwandani" : "Hotels, Schools & Grills: Factory Direct Prices"}</span>
            {site.phone ? (
              <a href={telLink(site.phone)} className="text-white hover:underline font-bold">
                {site.phone}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {/* Category Quick Navigation Bar (Alibaba / Amazon Style) */}
      <div className="border-b border-line bg-surface py-3 px-5 sm:px-8 shadow-2xs">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-ink whitespace-nowrap">
            <span className="text-muted uppercase tracking-wider">{isSw ? "Chagua Bidhaa:" : "Categories:"}</span>
            <Link href="/bidhaa#mkaa" className="rounded-lg bg-emerald-50 px-3 py-1.5 text-emerald-900 hover:bg-emerald-100 no-underline">
              {isSw ? "Mkaa wa Mbono (Charcoal)" : "Bio-Charcoal"}
            </Link>
            <Link href="/bidhaa#majiko" className="rounded-lg bg-slate-100 px-3 py-1.5 text-ink hover:bg-slate-200 no-underline">
              {isSw ? "Majiko Sanifu (Cookstoves)" : "Clean Cookstoves"}
            </Link>
            <Link href="/bidhaa#mbegu" className="rounded-lg bg-slate-100 px-3 py-1.5 text-ink hover:bg-slate-200 no-underline">
              {isSw ? "Mbegu za Mbono (Seeds)" : "Jatropha Seeds"}
            </Link>
            <Link href="/bidhaa#mboji" className="rounded-lg bg-slate-100 px-3 py-1.5 text-ink hover:bg-slate-200 no-underline">
              {isSw ? "Mbolea Asilia (Compost)" : "Organic Fertilizer"}
            </Link>
          </div>
          {site.whatsapp ? (
            <a
              href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji orodha ya bei ya jumla na rejareja.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
            >
              <span>{isSw ? "Omba Quotation ya Jumla" : "Request Bulk Quotation"} &rarr;</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* High-Impact Commercial Hero Section */}
      <section className="relative border-b border-line bg-paper py-12 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              {isSw ? "Uzalishaji Halisi wa Kiwandani • Mbeya" : "Authentic Factory Production • Mbeya"}
            </div>

            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl leading-[1.18]">
              {isSw ? (
                <>
                  Mkaa Safi wa Mbono na Majiko Sanifu:{" "}
                  <span className="text-emerald-700">Moto wa Saa 6+ Bila Moshi</span>
                </>
              ) : (
                <>
                  Clean Jatropha Bio-Charcoal & Cookstoves:{" "}
                  <span className="text-emerald-700">6+ Hours Burn with Zero Smoke</span>
                </>
              )}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-ink-soft leading-relaxed max-w-xl">
              {isSw
                ? "Mnyala Co. Ltd inatengeneza mkaa mbadala wenye joto kali na endelevu unaotokana na matunda ya mbono. Ni nishati safi inayookoa hadi 45% ya matumizi ya nishati majumbani, mahotelini, mashuleni na viwandani, huku ikilinda misitu ya asili ya Tanzania."
                : "Mnyala Co. Ltd manufactures high-heat, smokeless biomass charcoal briquettes from jatropha seed husks. Save up to 45% on monthly fuel expenses across homes, restaurants, schools, and commercial kitchens while conserving Tanzania's forests."}
            </p>

            {/* Direct Commercial CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {site.whatsapp ? (
                <a
                  href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji kuagiza mkaa na majiko. Naomba bei na maelezo.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("primary", "md", "bg-emerald-600 hover:bg-emerald-700 border-transparent text-white shadow-md")}
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>{isSw ? "Agiza WhatsApp (Bei ya Haraka)" : "Order on WhatsApp"}</span>
                </a>
              ) : null}
              <Link href="/bidhaa" className={buttonClasses("secondary", "md")}>
                {isSw ? "Katalogi ya Bidhaa" : "Browse Catalog"}
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-line/80 pt-6 sm:grid-cols-4">
              <div className="rounded-xl border border-line/80 bg-surface p-3 shadow-2xs">
                <p className="text-lg font-black text-brand-dark">Saa 6 - 8</p>
                <p className="text-xs text-muted font-medium">{isSw ? "Moto wa Kudumu" : "Long Heat Duration"}</p>
              </div>
              <div className="rounded-xl border border-line/80 bg-surface p-3 shadow-2xs">
                <p className="text-lg font-black text-brand-dark">0% Moshi</p>
                <p className="text-xs text-muted font-medium">{isSw ? "Salama kwa Afya" : "Zero Toxic Smoke"}</p>
              </div>
              <div className="rounded-xl border border-line/80 bg-surface p-3 shadow-2xs">
                <p className="text-lg font-black text-brand-dark">Tani 50+</p>
                <p className="text-xs text-muted font-medium">{isSw ? "Uwezo wa Mwezi" : "Monthly Capacity"}</p>
              </div>
              <div className="rounded-xl border border-line/80 bg-surface p-3 shadow-2xs">
                <p className="text-lg font-black text-brand-dark">TZS 25,000</p>
                <p className="text-xs text-muted font-medium">{isSw ? "Mfuko wa 25kg" : "25kg Sack Direct"}</p>
              </div>
            </div>
          </div>

          {/* Real Commercial Product Hero Card */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface p-3.5 shadow-xl">
              <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                <Image
                  src="/products/mnyala-charcoal-briquettes.jpg"
                  alt="Mnyala Bio-Charcoal Briquettes - Mkaa Safi wa Mbono Mbeya"
                  width={800}
                  height={600}
                  priority
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-103"
                />
                <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-xs">
                  <span className="size-2 rounded-full bg-emerald-400" aria-hidden="true" />
                  {isSw ? "Picha Halisi ya Bidhaa" : "Actual Product Photo"}
                </span>
                <span className="absolute right-3 top-3 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                  {isSw ? "Inapatikana Kiwandani" : "In Stock"}
                </span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-paper border border-line/80">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-extrabold text-ink">Mkaa Safi wa Mbono (Bio-Charcoal)</p>
                    <p className="text-xs text-muted">
                      {isSw ? "Kifungashio: 25kg, 15kg, 5kg na 1kg" : "Packaging: 25kg, 15kg, 5kg & 1kg"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted uppercase font-bold">{isSw ? "Bei ya Kiwandani" : "Factory Price"}</p>
                    <p className="text-base font-extrabold text-brand-dark">TZS 25,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix: Mkaa wa Mbono vs Mkaa wa Kuni (Human Commercial Comparison) */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              {isSw ? "Ulinganifu wa Kiutendaji" : "Performance Comparison"}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {isSw ? "Mkaa wa Mbono dhidi ya Mkaa wa Kawaida wa Kuni" : "Mnyala Bio-Charcoal vs. Traditional Wood Charcoal"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {isSw
                ? "Tazama tofauti halisi ya kiuchumi na kiafya inayowafanya wamiliki wa hoteli, shule na familia kubadili kwenda Mnyala."
                : "Real, factual comparison showing why restaurants, schools, and households switch to Mnyala clean charcoal."}
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-surface shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-xs font-bold uppercase tracking-wider text-muted">
                    <th className="px-5 py-4">{isSw ? "Kipengele" : "Feature"}</th>
                    <th className="px-5 py-4 text-emerald-800 bg-emerald-50/60 font-black">
                      {isSw ? "Mkaa wa Mbono (Mnyala)" : "Mnyala Bio-Charcoal"}
                    </th>
                    <th className="px-5 py-4 text-slate-600">{isSw ? "Mkaa wa Kawaida wa Kuni" : "Traditional Wood Charcoal"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-ink">
                  <tr>
                    <td className="px-5 py-4 font-bold">{isSw ? "Muda wa Joto la Kupika" : "Burn Duration"}</td>
                    <td className="px-5 py-4 font-bold text-emerald-800 bg-emerald-50/30">
                      {isSw ? "Saa 6 hadi 8 bila kuzimika" : "6 to 8 hours continuous heat"}
                    </td>
                    <td className="px-5 py-4 text-muted">{isSw ? "Saa 2 hadi 3 pekee" : "Only 2 to 3 hours"}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold">{isSw ? "Moshi & Masizi" : "Smoke & Black Soot"}</td>
                    <td className="px-5 py-4 font-bold text-emerald-800 bg-emerald-50/30">
                      {isSw ? "0% Moshi, sufuria hazishiki masizi" : "0% Smoke, pots remain clean"}
                    </td>
                    <td className="px-5 py-4 text-muted">{isSw ? "Moshi mwingi, masizi mazito meusi" : "Heavy smoke, severe black soot"}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold">{isSw ? "Gharama ya Kila Mwezi" : "Monthly Fuel Cost"}</td>
                    <td className="px-5 py-4 font-bold text-emerald-800 bg-emerald-50/30">
                      {isSw ? "Inaokoa 40% hadi 45% ya fedha zako" : "Saves 40% to 45% of your money"}
                    </td>
                    <td className="px-5 py-4 text-muted">{isSw ? "Gharama kubwa sana kwa kununua kila siku" : "Expensive repeated daily purchases"}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold">{isSw ? "Afya ya Familia & Mapishi" : "Health & Safety"}</td>
                    <td className="px-5 py-4 font-bold text-emerald-800 bg-emerald-50/30">
                      {isSw ? "Salama kwa watoto na haina harufu kwenye chakula" : "Safe for children, zero foul odor in food"}
                    </td>
                    <td className="px-5 py-4 text-muted">{isSw ? "Kikohozi, machozi na magonjwa ya koo" : "Coughing, eye irritation, chest risks"}</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-4 font-bold">{isSw ? "Ulinzi wa Misitu ya Asili" : "Forest Conservation"}</td>
                    <td className="px-5 py-4 font-bold text-emerald-800 bg-emerald-50/30">
                      {isSw ? "100% matunda ya mbono, miti haikatwi" : "100% biomass fruits, zero deforestation"}
                    </td>
                    <td className="px-5 py-4 text-muted">{isSw ? "Ukataji mkubwa wa miti ya asili ya Tanzania" : "Drives indigenous forest depletion"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Savings Calculator */}
      <section className="border-b border-line bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <SavingsCalculator whatsapp={site.whatsapp} locale={locale} />
        </div>
      </section>

      {/* Featured Products Grid (Amazon / Alibaba Style) */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line/80 pb-6 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">
                {isSw ? "Orodha ya Bidhaa Zetu" : "Product Catalog"}
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                {isSw ? "Bidhaa Bora za Kiwandani" : "Featured Factory Products"}
              </h2>
            </div>
            <Link href="/bidhaa" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark hover:underline">
              <span>{isSw ? "Tazama Katalogi Yote" : "View Complete Catalog"}</span>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={site.whatsapp} />
            ))}
          </div>
        </div>
      </section>

      {/* Behind the Scenes: Real Mbeya Factory & Farmer Network */}
      <section className="border-b border-line bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              {isSw ? "Uzalishaji & Jamii Mbeya" : "Local Manufacturing & Farmers"}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {isSw ? "Mtandao wa Wakulima na Kiwanda cha Mbeya" : "Direct Sourcing from Mbeya Smallholders"}
            </h2>
            <p className="mt-4 text-base text-ink-soft leading-relaxed">
              {isSw
                ? "Tofauti na wauzaji wa kati, Mnyala Co. Ltd inafanya kazi moja kwa moja na mamia ya wakulima wa Mbeya, Rungwe, Kyela, na Mbarali wanaokusanya matunda ya mbono. Tunalipa fedha taslimu mashambani, kisha kuchakata na kupima ubora katika kiwanda chetu jijini Mbeya."
                : "Unlike middlemen, Mnyala Co. Ltd works directly with hundreds of smallholder farmers across Mbeya, Rungwe, Kyela, and Mbarali who harvest jatropha fruits. We provide direct cash income to farming communities, processing and quality-testing every batch in our Mbeya plant."}
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <svg className="size-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm text-ink font-medium">
                  {isSw ? "Upimaji wa ubora wa unyevunyevu chini ya 8% kwa joto kali." : "Strict moisture testing below 8% for maximum heat density."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <svg className="size-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm text-ink font-medium">
                  {isSw ? "Ufungashaji thabiti usiochafua gari wala nguo zako." : "Clean, heavy-duty packaging that never soils vehicles or hands."}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                  <svg className="size-3.5 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-sm text-ink font-medium">
                  {isSw ? "Uzalishaji unaoendelea mfululizo mwaka mzima bila kukosa." : "Year-round consistent supply buffer with zero seasonal shortages."}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface p-3.5 shadow-xl">
              <Image
                src="/products/mnyala-clean-cookstove.jpg"
                alt="Jiko Sanifu la Kisasa - Mnyala Co. Ltd"
                width={800}
                height={600}
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <div className="mt-3 p-3 rounded-xl bg-paper border border-line/80">
                <p className="text-sm font-bold text-ink">
                  {isSw ? "Jiko Sanifu la Kisasa Likitumika" : "Clean Cookstove in Operation"}
                </p>
                <p className="text-xs text-muted">
                  {isSw ? "Kupikia kwa ufanisi bila moshi, sufuria inabaki safi kabisa" : "Clean combustion, pot remains spotless without black soot"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Authentic Customer Reviews (Social Proof) */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">
              {isSw ? "Ushuhuda wa Wateja" : "Customer Testimonials"}
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              {isSw ? "Wateja Wetu Wanasema Nini?" : "What Real Commercial Buyers Say"}
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-line bg-paper p-6 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-3" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Tumekuwa tukitumia mkaa wa Mnyala kwa ajili ya kuchoma nyama hotelini kwetu Mbeya. Joto lake linadumu masaa 7 na halina harufu yoyote inayobadilisha ladha ya nyama. Tumeokoa zaidi ya laki tatu kila mwezi."'
                  : '"We use Mnyala bio-charcoal for our hotel grill operations in Mbeya. The heat holds steady for 7 hours without any wood odor affecting meat flavors. We saved over TZS 300,000 monthly."'}
              </p>
              <div className="mt-4 border-t border-line/80 pt-3">
                <p className="text-sm font-bold text-ink">Meneja wa Jiko</p>
                <p className="text-xs text-muted">Mbeya Peak Hotel & Restaurant</p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-3" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Kwa shule yetu yenye wanafunzi zaidi ya 800, kuchemsha maharage na ugali ilikuwa gharama kubwa sana kwa kuni. Tangu tuweke majiko sanifu na kuanza kutumia mkaa wa mbono, jiko ni safi na wapishi wetu hawapati tena kikohozi cha moshi."'
                  : '"For our boarding school with 800+ students, cooking was a massive firewood cost. Since installing efficient cookstoves and switching to jatropha charcoal, our kitchens are clean and cooks no longer suffer from smoke coughs."'}
              </p>
              <div className="mt-4 border-t border-line/80 pt-3">
                <p className="text-sm font-bold text-ink">Msimamizi wa Shule</p>
                <p className="text-xs text-muted">Shule ya Sekondari Iyunga, Mbeya</p>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-paper p-6 shadow-2xs">
              <div className="flex items-center gap-1 text-amber-500 mb-3" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="size-4 fill-amber-400 text-amber-400" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-ink-soft leading-relaxed italic">
                {isSw
                  ? '"Mimi ni mfugaji wa kuku Mbalizi. Kupasha vifaranga joto la usiku kwa mkaa wa kawaida ilikuwa inaua vifaranga kwa moshi wa sumu. Mkaa wa Mnyala hauna moshi kabisa na unawaka usiku mzima hadi asubuhi."'
                  : '"As a poultry farmer in Mbalizi, brooding chicks with wood charcoal killed chicks with toxic carbon smoke. Mnyala charcoal produces zero smoke and burns straight through the night until dawn."'}
              </p>
              <div className="mt-4 border-t border-line/80 pt-3">
                <p className="text-sm font-bold text-ink">Erick Mwasambili</p>
                <p className="text-xs text-muted">Mfugaji wa Kuku, Mbalizi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Commercial Wholesale & Direct Order CTA */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-8 sm:p-14 text-white shadow-xl">
            <div className="max-w-2xl">
              <span className="inline-block rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                {isSw ? "Oda za Kiwandani Mbeya" : "Direct Factory Supply"}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                {isSw
                  ? "Unahitaji mzigo wa mkaa, majiko au mbolea kwa bei ya jumla?"
                  : "Need bio-charcoal, stoves or compost supplied directly to your facility?"}
              </h2>
              <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
                {isSw
                  ? "Piga simu au tuandikie WhatsApp upokee bei maalum ya kiwandani. Tunatuma mizigo kuanzia mfuko 1 wa nyumbani hadi tani 30 kwa taasisi."
                  : "Call or message us on WhatsApp for factory-direct wholesale discounts. We fulfill orders from single residential bags to 30-ton institutional contracts."}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {site.phone ? (
                <a
                  href={telLink(site.phone)}
                  className={buttonClasses("primary", "md", "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent font-bold")}
                >
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{isSw ? `Piga Simu: ${site.phone}` : `Call: ${site.phone}`}</span>
                </a>
              ) : null}
              {site.whatsapp ? (
                <a
                  href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji bei ya jumla ya mkaa na majiko.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold")}
                >
                  <span>{isSw ? "WhatsApp Bei ya Haraka" : "Quick WhatsApp Quote"}</span>
                </a>
              ) : null}
              <Link
                href="/wasiliana"
                className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold")}
              >
                {isSw ? "Fomu ya Maombi" : "Inquiry Form"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
