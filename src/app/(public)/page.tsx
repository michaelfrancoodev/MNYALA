import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { ProductCard } from "@/components/public/product-row";
import { buttonClasses } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { getLocale } from "@/messages/i18n";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa Safi wa Mbono & Majiko ya Kisasa - Mbeya, Tanzania" },
  description:
    "Kiwanda cha mkaa mbadala usio na moshi kutoka matunda ya mbono, majiko ya kisasa ya ufanisi, mbegu bora na mbolea asilia (mboji) Mbeya, Tanzania.",
};

const STATS = [
  {
    value: "60%+",
    labelSw: "Uokoaji wa Gharama",
    labelEn: "Fuel Cost Savings",
    descSw: "Familia na mikahawa huokoa zaidi ya nusu ya matumizi ya mwezi ya mkaa wa kupikia.",
    descEn: "Households and food businesses save over half their monthly cooking fuel expenses.",
  },
  {
    value: "Saa 6+",
    labelSw: "Moto wa Kudumu",
    labelEn: "Continuous Heat",
    descSw: "Pishi zima linapikwa mwanzo hadi mwisho bila kuhitaji kuongeza mkaa kila mara.",
    descEn: "A full family meal is cooked from start to finish without continuously refilling fuel.",
  },
  {
    value: "80%",
    labelSw: "Punguzo la Moshi",
    labelEn: "Smoke Reduction",
    descSw: "Hewa safi ndani ya nyumba; sufuria hazishiki masizi na hakuna kukohoa wala machozi.",
    descEn: "Clean kitchen air; cookware stays soot-free with zero burning eyes or coughing.",
  },
  {
    value: "100%",
    labelSw: "Uhifadhi wa Misitu",
    labelEn: "Forest Conservation",
    descSw: "Hutengenezwa kutokana na matunda ya mbono bila kukata hata mti mmoja wa asili.",
    descEn: "Made entirely from renewable jatropha curcas fruit husks with zero deforestation.",
  },
];

const COMPARISON_ROWS = [
  {
    featureSw: "Muda wa Moto kwa Pishi Moja",
    featureEn: "Burn Time per Meal",
    mnyalaSw: "Saa 6+ za moto mkali na thabiti",
    mnyalaEn: "6+ hours of steady, intense heat",
    regularSw: "Saa 1 hadi 2 tu, unazima haraka",
    regularEn: "Only 1 to 2 hours, fades quickly",
  },
  {
    featureSw: "Kiwango cha Moshi Jikoni",
    featureEn: "Kitchen Smoke Level",
    mnyalaSw: "Bila moshi kabisa (Smokeless)",
    mnyalaEn: "Completely smokeless combustion",
    regularSw: "Moshi mzito unaochoma macho na mapafu",
    regularEn: "Heavy smoke irritating eyes and lungs",
  },
  {
    featureSw: "Hali ya Vyombo na Sufuria",
    featureEn: "Condition of Cookware",
    mnyalaSw: "Sufuria zinabaki safi bila masizi meusi",
    mnyalaEn: "Cookware stays pristine and soot-free",
    regularSw: "Vyombo vinageuka vyeusi tii kwa masizi",
    regularEn: "Pots become heavily blackened with soot",
  },
  {
    featureSw: "Athari kwa Misitu ya Asili",
    featureEn: "Environmental Forest Impact",
    mnyalaSw: "Zero Deforestation (Matunda ya mbono)",
    mnyalaEn: "Zero Deforestation (Renewable seeds)",
    regularSw: "Ukataji haramu wa miti ya asili ya Tanzania",
    regularEn: "Illegal logging of indigenous forests",
  },
  {
    featureSw: "Gharama za Kila Mwezi",
    featureEn: "Monthly Fuel Budget",
    mnyalaSw: "Unaokoa hadi 60% ya bajeti ya nishati",
    mnyalaEn: "Saves up to 60% of monthly cooking spend",
    regularSw: "Gharama kubwa inayopanda kila kukicha",
    regularEn: "High, constantly escalating recurrent costs",
  },
  {
    featureSw: "Majivu na Usafi wa Jiko",
    featureEn: "Ash Residue & Kitchen Cleanliness",
    mnyalaSw: "Chini ya 5% ya majivu safi yanayogeuka mboji",
    mnyalaEn: "Under 5% clean ash, usable as compost",
    regularSw: "Majivu mengi yanayosambaa ovyo jikoni",
    regularEn: "Excessive dirty ash scattered around kitchen",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    titleSw: "Matunda Endelevu ya Mbono",
    titleEn: "Renewable Jatropha Biomass",
    descSw: "Wakulima hukusanya matunda ya mbono (Jatropha curcas) yaliyokomaa. Mti unabaki hai shambani ukitoa matunda kila msimu.",
    descEn: "Local farmers harvest ripe jatropha curcas fruit husks. The living tree remains untouched, bearing fruit year after year.",
  },
  {
    step: "02",
    titleSw: "Uchakataji wa Pyrolysis Kiwandani",
    titleEn: "Controlled Pyrolysis Carbonization",
    descSw: "Maganda hupashwa joto kwa kiwango cha juu bila oksijeni ili kuondoa gesi chafu zote, kisha kushindiliwa kuwa mkaa imara wenye msongamano mkubwa.",
    descEn: "Husks undergo high-temperature oxygen-controlled pyrolysis to extract volatile smoke compounds, compacted into dense briquettes.",
  },
  {
    step: "03",
    titleSw: "Mwako Safi Usio na Moshi wala Cheche",
    titleEn: "Smokeless Radiant Heat Combustion",
    descSw: "Mkaa unawaka kwa njia ya mionzi ya joto thabiti (radiant heat) bila moshi, bila harufu mbaya, na bila kulipua cheche za moto.",
    descEn: "Fuel burns with consistent, high-temperature radiant energy with zero open smoke, zero foul odors, and zero dangerous sparks.",
  },
  {
    step: "04",
    titleSw: "Mboji Asilia Kurutubisha Mashamba",
    titleEn: "Organic Bio-Fertilizer Regeneration",
    descSw: "Mabaki madogo ya majivu na maganda yenye nitrojeni na fosforasi yanageuzwa kuwa mboji asilia inayorudishwa ardhini kurutubisha mazao.",
    descEn: "Residual mineral-rich ash and seed press-cake are composted into natural bio-fertilizer, returning nutrients to agricultural soil.",
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
    ? whatsappLink(
        site.whatsapp,
        isSw
          ? "Habari Mnyala Co. Ltd, nahitaji maelezo na bei ya bidhaa zenu za nishati safi."
          : "Hello Mnyala Co. Ltd, I would like information and pricing for your clean energy products."
      )
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
          image: `${appUrl}/lifestyle/mnyala-cooking-hero.jpg`,
          ...(site.phone ? { telephone: site.phone } : {}),
          ...(site.email ? { email: site.email } : {}),
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* 1. LIFESTYLE HERO SECTION (BioLite & Burn Manufacturing Style) */}
      <section className="border-b border-line bg-paper py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
            {/* Left Content Column */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <svg className="size-3.5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
                <span>{isSw ? "Nishati Safi ya Kisasa • Kiwanda cha Mbeya" : "Clean Cooking Energy • Mbeya Plant"}</span>
              </div>

              <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-ink leading-[1.12]">
                {isSw ? (
                  <>
                    Pika Bila Moshi.{" "}
                    <span className="text-emerald-800">Okoa Gharama.</span>{" "}
                    Linda Misitu ya Asili.
                  </>
                ) : (
                  <>
                    Cook Clean.{" "}
                    <span className="text-emerald-800">Cut Costs.</span>{" "}
                    Protect Indigenous Forests.
                  </>
                )}
              </h1>

              <p className="mt-5 text-base sm:text-lg text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd inabadilisha jiko la Kitanzania kwa mkaa safi wa mbono na majiko sanifu ya ufanisi wa juu. Furahia moto mkali unaodumu zaidi ya saa 6, sufuria safi zisizo na masizi, na hewa safi inayolinda afya ya familia yako."
                  : "Mnyala Co. Ltd transforms Tanzanian kitchens with smokeless jatropha bio-charcoal and precision-engineered clean cookstoves. Experience 6+ hours of strong, steady cooking heat, spotless cookware, and unpolluted air for family health."}
              </p>

              {/* Action Buttons (Burn Manufacturing High-Contrast CTAs) */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/bidhaa"
                  className={buttonClasses("primary", "md", "bg-emerald-800 hover:bg-emerald-900 text-white font-bold shadow-sm")}
                >
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="8" cy="21" r="1" />
                    <circle cx="19" cy="21" r="1" />
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                  </svg>
                  <span>{isSw ? "Tazama Bidhaa na Bei" : "View Products & Pricing"}</span>
                </Link>

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("secondary", "md", "font-semibold")}
                  >
                    <svg className="size-4 shrink-0 text-emerald-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span>{isSw ? "Wasiliana WhatsApp" : "Chat on WhatsApp"}</span>
                  </a>
                ) : null}

                {site.phone ? (
                  <a href={phoneHref} className="text-xs font-bold text-slate-700 hover:text-emerald-800 py-2 px-1">
                    {isSw ? `Piga: ${site.phone}` : `Call: ${site.phone}`}
                  </a>
                ) : null}
              </div>

              {/* Trust Indicators (EcoZoom & Mimi Moto style) */}
              <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line/80 pt-6">
                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-emerald-700 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-ink">{isSw ? "Saa 6+ za Moto" : "6+ Hours Burn"}</p>
                    <p className="text-[11px] text-muted">{isSw ? "Hauzimiki haraka" : "Long-lasting heat"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-emerald-700 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-ink">{isSw ? "Bila Moshi" : "100% Smokeless"}</p>
                    <p className="text-[11px] text-muted">{isSw ? "Vyombo safi" : "Soot-free cookware"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-emerald-700 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <div>
                    <p className="text-xs font-bold text-ink">{isSw ? "Zero Miti" : "Zero Trees Cut"}</p>
                    <p className="text-[11px] text-muted">{isSw ? "Matunda ya mbono" : "Renewable jatropha"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Lifestyle Photography Column (BioLite Style) */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-xl">
                <Image
                  src="/lifestyle/mnyala-cooking-hero.jpg"
                  alt={
                    isSw
                      ? "Mama akipika chakula kwa furaha kwa kutumia jiko safi la Mnyala na mkaa wa mbono Mbeya"
                      : "Mother happily cooking with Mnyala clean-combustion cookstove and jatropha charcoal in Mbeya"
                  }
                  width={900}
                  height={675}
                  priority
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />

                {/* Floating Highlight Card (BioLite / Burn style) */}
                <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-white/30 bg-slate-950/85 p-4 text-white shadow-lg backdrop-blur-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wider text-emerald-400">
                        {isSw ? "Ubora Uliothibitishwa" : "Verified Performance"}
                      </p>
                      <p className="text-xs font-medium text-slate-200">
                        {isSw
                          ? "Saa 6+ za moto thabiti • Sufuria zinabaki safi bila masizi"
                          : "6+ hours continuous heat • Cookware stays spotless and soot-free"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. KEY EFFICIENCY & IMPACT METRICS BAR (EcoZoom & Envirofit Style) */}
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.value} className="rounded-xl border border-line/80 bg-paper p-6 shadow-2xs">
                <p className="text-3xl sm:text-4xl font-black text-emerald-800 tracking-tight">{s.value}</p>
                <h3 className="mt-2 text-base font-bold text-ink">{isSw ? s.labelSw : s.labelEn}</h3>
                <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">{isSw ? s.descSw : s.descEn}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. HOW THE TECHNOLOGY WORKS (Mimi Moto & BioLite Style) */}
      <section className="border-b border-line bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 items-center">
            {/* Macro Combustion Photography */}
            <div>
              <div className="relative overflow-hidden rounded-2xl border border-line bg-slate-950 p-2 shadow-xl">
                <Image
                  src="/lifestyle/mnyala-clean-combustion.jpg"
                  alt={
                    isSw
                      ? "Makaa ya mbono yakiwaka kwa joto kali na moto safi usio na moshi katika chumba cha mwako cha jiko la kisasa"
                      : "Jatropha bio-charcoal briquettes glowing with clean radiant heat and smokeless flame in modern cookstove"
                  }
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <div className="mt-3 px-3 pb-2 text-slate-300">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {isSw ? "Mwako Safi wa Mionzi ya Joto (Clean Combustion)" : "Smokeless Radiant Combustion"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isSw
                      ? "Msongamano mkubwa wa kaboni unatoa joto thabiti la kupikia bila moshi, harufu, wala cheche."
                      : "Dense carbon composition releases uniform cooking heat without smoke, odor, or sparks."}
                  </p>
                </div>
              </div>
            </div>

            {/* Science Explanation */}
            <div>
              <div className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                {isSw ? "Sayansi ya Moto Safi" : "Clean Combustion Science"}
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {isSw ? "Kwanini Mkaa wa Mbono ni Bora Zaidi?" : "Why Jatropha Bio-Charcoal Outperforms?"}
              </h2>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Tofauti na mkaa wa kawaida unaochomwa kienyeji na kutoa hewa chafu, teknolojia yetu inabadilisha maganda ya mbegu za mbono kuwa nishati imara na safi."
                  : "Unlike conventional wood charcoal produced through rudimentary kilns, our engineered process converts jatropha seed husks into high-density, pure clean cooking fuel."}
              </p>

              <div className="mt-6 space-y-4">
                {HOW_IT_WORKS.map((item) => (
                  <div key={item.step} className="flex gap-4 rounded-xl border border-line/70 bg-surface p-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-xs font-black text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-ink">{isSw ? item.titleSw : item.titleEn}</h3>
                      <p className="mt-1 text-xs text-ink-soft leading-relaxed">{isSw ? item.descSw : item.descEn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMMERCIAL PRODUCT SHOWCASE (Burn Manufacturing Style) */}
      <section id="bidhaa" className="border-b border-line bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {isSw ? "Katalogi ya Kiwandani" : "Factory Catalog"}
              </span>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {isSw ? "Bidhaa Zetu Halisi za Kiwandani" : "Our Authentic Factory Products"}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {isSw
                  ? "Bidhaa zote zinazalishwa jijini Mbeya na zinapatikana kwa rejareja ya nyumbani na oda kubwa za kibiashara."
                  : "All products are manufactured at our Mbeya plant and available for domestic use and bulk commercial supply."}
              </p>
            </div>

            <Link
              href="/bidhaa"
              className={buttonClasses("secondary", "sm", "font-bold self-start sm:self-auto shrink-0")}
            >
              {isSw ? "Tazama Katalogi Kamili" : "Full Catalog"}
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} whatsapp={site.whatsapp} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. FAMILY HEALTH & COMMUNITY IMPACT STORY (Envirofit Style) */}
      <section className="border-b border-line bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 items-center">
            {/* Impact Editorial Photography */}
            <div className="order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-2 shadow-xl">
                <Image
                  src="/lifestyle/mnyala-family-health.jpg"
                  alt={
                    isSw
                      ? "Mama na mtoto wakifurahia chakula kitamu katika jiko safi lisilo na moshi"
                      : "Mother and child enjoying a healthy meal in a clean, smoke-free domestic kitchen"
                  }
                  width={800}
                  height={600}
                  className="aspect-[4/3] w-full rounded-xl object-cover"
                />
                <div className="mt-3 px-3 pb-2 text-ink-soft">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    {isSw ? "Afya ya Familia Majumbani" : "Household Family Health"}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {isSw
                      ? "Kupika hakupaswi kuwa sababu ya magonjwa ya kifua, koo, na macho."
                      : "Cooking should never cause respiratory infections, throat irritation, or chronic lung conditions."}
                  </p>
                </div>
              </div>
            </div>

            {/* Impact Details */}
            <div className="order-1 lg:order-2">
              <div className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                {isSw ? "Athari Chanya kwa Jamii" : "Positive Human Impact"}
              </div>
              <h2 className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {isSw
                  ? "Kupika Kunapaswa Kuwa Furaha, Sio Chanzo cha Magonjwa"
                  : "Cooking Should Be a Joy, Not a Source of Illness"}
              </h2>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Takwimu za afya zinaonyesha kuwa kuvuta moshi wa kuni na mkaa duni jikoni ni sawa na kuvuta pakiti za sigara kila siku. Mnyala inaleta uhuru wa hewa safi kwa kila mama na familia."
                  : "Health data shows inhaling toxic indoor smoke from raw wood and primitive charcoal equals smoking packs of cigarettes daily. Mnyala restores clean air to mothers and children."}
              </p>

              <div className="mt-6 space-y-4">
                <div className="rounded-xl border border-line/80 bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <svg className="size-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <h3 className="text-sm font-bold text-ink">
                      {isSw ? "Kulinda Mapafu ya Mama na Watoto" : "Protecting Lungs of Mothers & Children"}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                    {isSw
                      ? "Punguzo la 80% ya moshi huondoa kabisa kikohozi, macho kuwasha, na hatari ya magonjwa sugu ya mfumo wa upumuaji."
                      : "80% smoke reduction eliminates persistent coughs, burning eyes, and chronic acute respiratory infections."}
                  </p>
                </div>

                <div className="rounded-xl border border-line/80 bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <svg className="size-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <h3 className="text-sm font-bold text-ink">
                      {isSw ? "Ukombozi wa Bajeti ya Kila Mwezi" : "Monthly Household Budget Relief"}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                    {isSw
                      ? "Pesa inayookolewa kwa kununua mkaa unaodumu kwa masaa mengi inabaki kwa ajili ya chakula, ada za shule na maendeleo ya familia."
                      : "Savings from fuel that burns far longer remain in the family pocket for education, nutrition, and domestic growth."}
                  </p>
                </div>

                <div className="rounded-xl border border-line/80 bg-surface p-4">
                  <div className="flex items-center gap-2">
                    <svg className="size-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
                      <path d="M7 16v6" />
                      <path d="M13 19v3" />
                      <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7l-3.5-4.6a1 1 0 0 0-1.5 0L8.7 7.3a1 1 0 0 0 .8 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H12" />
                    </svg>
                    <h3 className="text-sm font-bold text-ink">
                      {isSw ? "Kuokoa Misitu ya Asili ya Tanzania" : "Conserving Tanzania's Indigenous Forests"}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">
                    {isSw
                      ? "Kila mfuko wa mkaa wa mbono unalinda miti ya asili isikatwe, ukihifadhi vyanzo vya maji na kukabili ukame."
                      : "Each bag of jatropha charcoal prevents indigenous trees from being felled, protecting vital water basins and fighting drought."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. DIRECT COMPARISON MATRIX (EcoZoom & BioLite Style) */}
      <section className="border-b border-line bg-surface py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {isSw ? "Ulinganifu wa Thamani" : "Value Comparison"}
            </span>
            <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
              {isSw ? "Mkaa wa Kisasa wa Mnyala vs Mkaa wa Kawaida" : "Mnyala Bio-Charcoal vs Traditional Wood Charcoal"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {isSw
                ? "Tazama ulinganifu halisi wa utendaji kazi, gharama na usafi kati ya nishati safi ya Mnyala na mkaa wa kawaida."
                : "A side-by-side comparison of cooking performance, cleanliness, and cost efficiency."}
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-line bg-slate-50 text-ink">
                  <th className="py-4 px-4 sm:px-6 font-bold">{isSw ? "Kipengele" : "Feature"}</th>
                  <th className="py-4 px-4 sm:px-6 font-black text-emerald-900 bg-emerald-50/70">
                    {isSw ? "Mkaa wa Kisasa wa Mnyala" : "Mnyala Modern Bio-Charcoal"}
                  </th>
                  <th className="py-4 px-4 sm:px-6 font-semibold text-slate-600">
                    {isSw ? "Mkaa wa Kawaida wa Kuni" : "Traditional Wood Charcoal"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/70">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.featureSw} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-ink">
                      {isSw ? row.featureSw : row.featureEn}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-emerald-950 bg-emerald-50/40">
                      <div className="flex items-center gap-2">
                        <svg className="size-4 shrink-0 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{isSw ? row.mnyalaSw : row.mnyalaEn}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-600">
                      <div className="flex items-center gap-2">
                        <svg className="size-4 shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        <span>{isSw ? row.regularSw : row.regularEn}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. FACTORY & AGRICULTURAL ORIGIN IN MBEYA */}
      <section className="border-b border-line bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {isSw ? "Asili Yetu na Jamii" : "Our Origins & Community"}
              </span>
              <h2 className="mt-1.5 text-2xl sm:text-3xl font-black tracking-tight text-ink">
                {isSw ? "Kiwanda cha Mnyala Jijini Mbeya" : "Mnyala Factory in Mbeya, Tanzania"}
              </h2>
              <p className="mt-4 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Mnyala Co. Ltd ni kampuni ya Kitanzania yenye makao makuu na kiwanda jijini Mbeya. Dhamira yetu ni kujenga uchumi wa kijani unaowanufaisha wakulima wadogo wanaokusanya matunda ya mbono na kutoa nishati safi inayomuduwa na kila mtanzania."
                  : "Mnyala Co. Ltd is a Tanzanian enterprise headquartered with modern production facilities in Mbeya. Our mission is to anchor a green circular economy rewarding smallholder farmers who gather jatropha seeds while delivering clean cooking fuel to every household."}
              </p>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {isSw
                  ? "Zaidi ya mkaa, tunazalisha majiko sanifu ya kupikia, mbegu zilizochaguliwa za mbono kwa wakulima wapya, na mboji asilia kurutubisha ardhi bila kemikali."
                  : "Beyond charcoal, we manufacture clean biomass cookstoves, selected jatropha seeds for outgrowers, and nutrient-rich bio-fertilizer that rehabilitates depleted soils."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3.5">
                <Link href="/kuhusu" className={buttonClasses("secondary", "sm", "font-bold")}>
                  {isSw ? "Soma Kuhusu Kampuni" : "About Company"}
                </Link>
                <Link href="/picha" className={buttonClasses("secondary", "sm", "font-bold")}>
                  {isSw ? "Picha za Uzalishaji" : "Plant Gallery"}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="overflow-hidden rounded-xl border border-line bg-surface p-2.5 shadow-2xs">
                <Image
                  src="/products/mnyala-jatropha-seeds.jpg"
                  alt="Mbegu Bora za Mbono - Mnyala Co. Ltd"
                  width={500}
                  height={375}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <div className="mt-2.5 px-1">
                  <p className="text-xs font-bold text-ink">{isSw ? "Mbegu Bora za Mbono" : "Selected Jatropha Seeds"}</p>
                  <p className="text-[11px] text-muted">{isSw ? "Kuotesha na kupanda" : "Germination 90%+"}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-line bg-surface p-2.5 shadow-2xs">
                <Image
                  src="/products/mnyala-organic-fertilizer.jpg"
                  alt="Mbolea Asilia ya Mboji - Mnyala Co. Ltd"
                  width={500}
                  height={375}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <div className="mt-2.5 px-1">
                  <p className="text-xs font-bold text-ink">{isSw ? "Mboji (Mbolea Asilia)" : "Organic Bio-Fertilizer"}</p>
                  <p className="text-[11px] text-muted">{isSw ? "Rutuba hai ya udongo" : "Natural soil compost"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HIGH-CONTRAST DIRECT CONTACT & ORDER BANNER (Burn Manufacturing Style) */}
      <section className="bg-paper py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div>
                <span className="inline-block rounded-md bg-emerald-700/60 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-200">
                  {isSw ? "Agiza Sasa Kutoka Kiwandani" : "Order Directly From Factory"}
                </span>
                <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  {isSw
                    ? "Tayari Kuboresha Jiko Lako kwa Nishati Safi?"
                    : "Ready to Upgrade Your Kitchen with Clean Energy?"}
                </h2>
                <p className="mt-3 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
                  {isSw
                    ? "Wasiliana na kiwanda chetu jijini Mbeya kwa maelezo, sampuli, au oda za rejareja na jumla kwa mikoa yote ya Tanzania."
                    : "Connect directly with our Mbeya plant team for retail bags, wholesale institutional orders, or nationwide distribution."}
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-emerald-100">
                  <div className="flex items-center gap-1.5">
                    <svg className="size-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Mbeya & Songwe</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="size-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{isSw ? "Mizigo Nchi Nzima" : "Nationwide Delivery"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="size-4 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{isSw ? "Jumla na Rejareja" : "Wholesale & Retail"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses("primary", "md", "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md border-transparent")}
                  >
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span>{isSw ? "Tuma Ujumbe WhatsApp" : "Message on WhatsApp"}</span>
                  </a>
                ) : null}

                {phoneHref ? (
                  <a
                    href={phoneHref}
                    className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/25 font-bold")}
                  >
                    <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>{site.phone}</span>
                  </a>
                ) : null}

                <Link
                  href="/wasiliana"
                  className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/25 font-bold")}
                >
                  {isSw ? "Fomu ya Mawasiliano" : "Contact Form"}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
