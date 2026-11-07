import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { MediaImage } from "@/components/public/media-image";
import { ProductCard } from "@/components/public/product-row";
import { buttonClasses } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { COMMON } from "@/messages/sw";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa Safi Kutoka Matunda ya Mbono, Mbeya" },
  description:
    "Mkaa safi, majiko ya ufanisi, mbegu za mbono na mboji (mbolea asilia) kutoka Mbeya, Tanzania. Moto mrefu wa saa 6+, moshi mdogo, na bei nafuu.",
};

const FEATURES = [
  {
    title: "Moto wa Kudumu (Saa 6+)",
    desc: "Unawaka kwa joto thabiti kwa muda mrefu zaidi ya mkaa wa kawaida, ukipunguza matumizi na gharama.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
      </svg>
    ),
  },
  {
    title: "Bila Moshi & Salama kwa Afya",
    desc: "Hutoa kiwango cha chini sana cha moshi na majivu machache, hivyo kulinda afya ya familia na mapafu.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: "Kulinda Misitu na Mazingira",
    desc: "Hautokani na ukataji wa miti ya asili. Unatengenezwa 100% kutokana na matunda ya miti ya mbono.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z" />
        <path d="M7 16v6" />
        <path d="M13 19v3" />
        <path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7l-3.5-4.6a1 1 0 0 0-1.5 0L8.7 7.3a1 1 0 0 0 .8 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H11l-3 3.3a1 1 0 0 0 .7 1.7H12" />
      </svg>
    ),
  },
  {
    title: "Mbolea Asilia Kutoka Mabaki",
    desc: "Mabaki ya uchakataji yanageuzwa kuwa mboji asilia (organic fertilizer) kurutubisha ardhi na kilimo cha chakula.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
        <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
      </svg>
    ),
  },
  {
    title: "Usambazaji wa Uhakika",
    desc: "Tunafikisha mizigo kwa wakati kwa wateja binafsi, wafanyabiashara, hoteli, mashule na viwanda kote nchini.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </svg>
    ),
  },
  {
    title: "Bei ya Kiwandani & Unafuu",
    desc: "Mkaa na bidhaa za ubora wa juu kwa bei rafiki. Punguzo kubwa kwa wanunuzi wa jumla na wateja wa kudumu.",
    icon: (
      <svg className="size-6 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <line x1="2" x2="22" y1="10" y2="10" />
      </svg>
    ),
  },
];

export default async function HomePage() {
  const [products, site] = await Promise.all([getPublishedProducts(), getSiteSettings()]);
  const heroImage = products.find((p) => p.image)?.image ?? null;
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

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 py-16 sm:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
              Nishati Safi ya Kisasa • Mbeya, Tanzania
            </div>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl leading-[1.12]">
              Mkaa Safi wa Kisasa Kutoka{" "}
              <span className="text-emerald-700 underline decoration-emerald-300 decoration-wavy decoration-2">
                Matunda ya Mbono
              </span>
            </h1>

            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              Mnyala Co. Ltd inakuletea mapinduzi ya nishati safi: mkaa mbadala wenye joto kali na moshi mdogo, majiko
              ya kisasa ya ufanisi, mbegu bora za mbono na mbolea asilia (mboji). Suluhisho salama kwa familia yako na viwanda.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link href="/bidhaa" className={buttonClasses("primary", "md")}>
                <span>{COMMON.seeProducts}</span>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href="/wasiliana" className={buttonClasses("secondary", "md")}>
                {COMMON.contactUs}
              </Link>
              {site.whatsapp ? (
                <a
                  href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji bei na maelezo ya mkaa.")}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 px-3 py-2 no-underline"
                >
                  <span>WhatsApp Bei &rarr;</span>
                </a>
              ) : null}
            </div>

            {/* Trust Metric Badges */}
            <div className="mt-10 grid grid-cols-2 gap-4 border-t border-line/80 pt-6 sm:grid-cols-4">
              <div>
                <p className="text-xl font-extrabold text-brand-dark">100%</p>
                <p className="text-xs font-medium text-muted">Asilia & Mazingira</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-brand-dark">Saa 6+</p>
                <p className="text-xs font-medium text-muted">Moto Mrefu Thabiti</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-brand-dark">0% Moshi</p>
                <p className="text-xs font-medium text-muted">Salama kwa Afya</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-brand-dark">Bei Nafuu</p>
                <p className="text-xs font-medium text-muted">Kiwandani Mbeya</p>
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-xl">
              {heroImage ? (
                <MediaImage
                  image={heroImage}
                  priority
                  sizes="(min-width: 1024px) 28rem, 100vw"
                  className="aspect-[4/3] w-full rounded-2xl object-cover lg:aspect-square"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-brand-tint text-brand-dark font-bold text-2xl lg:aspect-square">
                  Mnyala Co. Ltd
                </div>
              )}
              <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-paper border border-line/60">
                <div>
                  <p className="text-sm font-bold text-ink">Mkaa Safi wa Mbono</p>
                  <p className="text-xs text-muted">Uzalishaji endelevu • Mbeya</p>
                </div>
                <span className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
                  Inapatikana
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Eco-Cycle Value Chain */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Uzalishaji wa Kijani</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Kutoka Shamba Hadi Jikoni: Mti wa Mbono
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Mfumo wetu unahakikisha kila sehemu ya zao la mbono (Jatropha curcas) inatumika kwa tija bila taka yoyote.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Matunda ya Mbono",
                text: "Tunayageuza kuwa mkaa safi wa kisasa wenye joto kali, unaowaka muda mrefu bila kutoa moshi mchafu wala harufu mbaya.",
              },
              {
                step: "02",
                title: "Mbegu Bora",
                text: "Tunawauzia wakulima na taasisi mbegu zilizoteuliwa kwa ajili ya kupanda miti ya mbono hata kama ua au ukuta wa kuzuia upepo.",
              },
              {
                step: "03",
                title: "Majiko Sanifu",
                text: "Tunasambaza majiko maalum ya kisasa yanayotumia mkaa kidogo sana na kuelekeza joto lote kwenye sufuria kwa haraka.",
              },
              {
                step: "04",
                title: "Mboji Asilia",
                text: "Mabaki yote ya uzalishaji hayatupwi: yanageuzwa kuwa mbolea asilia hai (organic compost) kurutubisha mazao ya chakula.",
              },
            ].map((card) => (
              <div key={card.step} className="rounded-2xl border border-line bg-paper p-6 shadow-2xs hover:shadow-md transition-all">
                <span className="text-3xl font-extrabold text-brand/30">{card.step}</span>
                <h3 className="mt-3 text-lg font-bold text-ink">{card.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 ? (
        <section className="border-b border-line bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-brand">Bidhaa Zetu</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  Chaguo Bora la Nishati & Kilimo
                </h2>
              </div>
              <Link href="/bidhaa" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-dark hover:underline">
                <span>Tazama Bidhaa Zote</span>
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} whatsapp={site.whatsapp} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Why Choose Us */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Ufanisi & Ubora</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Kwa Nini Wateja na Taasisi Wanatuamini
            </h2>
            <p className="mt-3 text-base text-ink-soft">
              Suluhisho letu linathibitishwa na wazazi, wapishi wa hoteli, wafugaji na wamiliki wa viwanda kote nchini.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-paper p-6 shadow-2xs hover:shadow-md transition-all">
                <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 shadow-2xs">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community & Forest Protection */}
      <section className="border-b border-line bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 md:grid-cols-2">
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-xs">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-brand">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 2a9 9 0 0 1 9 9c0 4.97-4.03 9-9 9a9 9 0 0 1-9-9c0-4.97 4.03-9 9-9Z" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-ink">Mpango wa Upandaji Miti</h3>
            <p className="mt-2 text-ink-soft leading-relaxed">
              Mnyala Co. Ltd inashirikiana na vikundi vya kijamii, shule, na wakulima binafsi Mbeya katika kugawa mbegu na kutoa miche
              ya miti ya mbono ili kurudisha uoto wa asili na kuzuia mmomonyoko wa udongo.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-surface p-8 shadow-xs">
            <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-brand">
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>
            <h3 className="mt-4 text-2xl font-bold text-ink">Elimu ya Mazingira & Nishati</h3>
            <p className="mt-2 text-ink-soft leading-relaxed">
              Tunatoa semina za vitendo jinsi ya kuokoa nishati, matumizi sahihi ya majiko sanifu, na mbinu za kilimo hai kwa kutumia
              mboji inayozalishwa kutokana na mabaki ya mkaa.
            </p>
          </div>
        </div>
      </section>

      {/* High-Impact CTA Section */}
      <section className="py-16 sm:py-20 bg-paper">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-8 sm:p-14 text-white shadow-xl">
            <div className="max-w-2xl">
              <span className="inline-block rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                Wasiliana Nasi Moja kwa Moja
              </span>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                Je, unahitaji mkaa, majiko au mbolea kwa jumla au rejareja?
              </h2>
              <p className="mt-4 text-base sm:text-lg text-emerald-100/90 leading-relaxed">
                Tupigie simu, tuandikie WhatsApp, au tuma ujumbe kupitia fomu yetu. Timu yetu Mbeya ipo tayari kukuhudumia haraka.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              {site.phone ? (
                <a href={telLink(site.phone)} className={buttonClasses("primary", "md", "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent")}>
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Piga Simu: {site.phone}</span>
                </a>
              ) : null}
              {site.whatsapp ? (
                <a
                  href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji kujua bei na jinsi ya kuagiza.")}
                  className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/20")}
                >
                  <span>{COMMON.whatsapp}</span>
                </a>
              ) : null}
              <Link href="/wasiliana" className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/20")}>
                Tuma Ujumbe
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
