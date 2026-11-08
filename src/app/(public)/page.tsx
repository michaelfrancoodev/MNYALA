import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { MediaImage } from "@/components/public/media-image";
import { getEnv } from "@/lib/env";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa safi kutoka kwa matunda ya mbono, Mbeya" },
  description:
    "Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia kutokana na mabaki ya uzalishaji Mbeya, Tanzania.",
};

const PRODUCT_FALLBACK_IMAGES: Record<string, string> = {
  "mkaa-safi-wa-kisasa": "/products/mnyala-charcoal-briquettes.jpg",
  "majiko-ya-ufanisi": "/products/mnyala-clean-cookstove.jpg",
  "mbegu-za-mbono": "/products/mnyala-jatropha-seeds.jpg",
  "mboji-mbolea-asilia": "/products/mnyala-organic-fertilizer.jpg",
};

export default async function HomePage() {
  const [products, site] = await Promise.all([
    getPublishedProducts(),
    getSiteSettings(),
  ]);

  const appUrl = getEnv().APP_URL.replace(/\/$/, "");
  const phone = site.phone || "+255 758 730 108";
  const rawPhone = phone.replace(/[^\d+]/g, "");
  const email = site.email || "info@mnyala.co.tz";
  const rawWa = (site.whatsapp || "255758730108").replace(/[^\d]/g, "");
  const waUrl = `https://wa.me/${rawWa}?text=Habari%20Mnyala%20Co.%20Ltd%2C%20nahitaji%20maelezo%20kuhusu%20bidhaa%20zenu`;

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
          telephone: phone,
          email: email,
          address: { "@type": "PostalAddress", addressLocality: "Mbeya", addressCountry: "TZ" },
        }}
      />

      {/* 1. HERO SECTION (ALL PRODUCTS HIGHLIGHTED) */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Mkaa safi unaotokana na matunda ya mbono, majiko, mbegu na mbolea
            <br />
            <span style={{ color: "var(--accent)" }}>Nishati Safi, Kilimo Bora na Mazingira Salama</span>
          </h1>
          <p>
            Mnyala Co. Ltd inakuletea mkaa safi wa kisasa unaotokana na matunda ya mbono, majiko imara ya kuokoa nishati, mbegu bora za mbono (Jatropha curcas), na mbolea asilia (mboji) kutokana na mabaki ya uzalishaji. Suluhisho kamili la nishati na kilimo endelevu kwa majumbani, hoteli, viwanda na wakulima kote Tanzania.
          </p>
          <div className="hero-buttons flex items-center justify-center gap-4 flex-wrap">
            <Link href="#bidhaa" className="btn">
              Angalia Bidhaa Zetu
            </Link>
            <Link href="/wasiliana" className="btn-secondary">
              Wasiliana Nasi
            </Link>
          </div>
        </div>
      </section>

      {/* 2. HUDUMA ZETU / HUMAN STORY SECTION (MATCHING USER SAMPLE EXACTLY) */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Story Text (Left) */}
            <div className="lg:col-span-6 space-y-6 lg:pr-6">
              <span className="inline-block rounded border border-slate-300 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1e4d3a]">
                HUDUMA ZETU
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
                Nishati Safi Yenye Joto Kali,
                <br />
                Isiyotoa Moshi Wala Kukata Miti
              </h2>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                Kwa miaka mingi upishi umeathiri afya zetu na misitu. Mnyala Co. Ltd inaleta mapinduzi halisi kwa kuzalisha mkaa safi wa kisasa unaotokana na mbegu za mbono (Jatropha curcas).{" "}
                <strong className="font-bold text-slate-900">
                  Joto kali la kudumu, bila moshi, na salama kabisa kwa familia na biashara yako.
                </strong>
              </p>

              <div className="pt-2">
                <Link
                  href="/kuhusu"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1e4d3a] px-7 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#15382a] transition-all"
                >
                  <span>Soma Zaidi</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Natural Cooking Photo (Right) */}
            <div className="lg:col-span-6 lg:border-l lg:border-slate-200 lg:pl-10">
              <div className="relative overflow-hidden rounded-2xl shadow-md bg-slate-100 aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3]">
                <Image
                  src="/lifestyle/mnyala-cooking-hero.jpg"
                  alt="Upishi salama na mkaa safi wa Mnyala Co. Ltd Mbeya"
                  width={800}
                  height={600}
                  className="size-full object-cover transition-transform duration-500 hover:scale-102"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS (2x2 GRID - CLEAN, COMPACT, HIGH RESOLUTION) */}
      <section className="py-16 md:py-24 bg-[#f8faf7]" id="bidhaa">
        <div id="products" className="sr-only" aria-hidden="true">Bidhaa Zetu</div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <span className="inline-block rounded border border-slate-300 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1e4d3a]">
              BIDHAA ZETU
            </span>
            <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
              Bidhaa Zetu Bora Zinazouzika
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
              Gundua bidhaa zetu zinazolinda mazingira zilizobuniwa kutoa nishati safi, endelevu, na bei nafuu kwa kila mtu.
            </p>
          </div>

          {/* Cards 2 Row 1 and Cards 2 Row 2 (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {products.map((p) => {
              const fallbackSrc = PRODUCT_FALLBACK_IMAGES[p.slug] || "/products/mnyala-charcoal-briquettes.jpg";
              return (
                <div
                  key={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:shadow-md"
                >
                  {/* Product Image Header */}
                  <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                    {p.image ? (
                      <MediaImage
                        image={p.image}
                        sizes="(min-width: 1024px) 30rem, 100vw"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Image
                        src={fallbackSrc}
                        alt={p.name}
                        width={600}
                        height={400}
                        className="size-full object-cover"
                      />
                    )}
                    <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[#0f3d2e] shadow-xs backdrop-blur-xs">
                      Mbeya, Tanzania
                    </span>
                  </div>

                  {/* Product Body Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-[#111827] tracking-tight">{p.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 leading-relaxed flex-1">
                      {p.summary}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-emerald-800">
                      Wasiliana kwa bei ya jumla na rejareja
                    </p>

                    {/* Actions */}
                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <Link
                        href={`/wasiliana?bidhaa=${p.slug}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#2d7a3e] px-4 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#1e5a2b] text-center"
                      >
                        Agiza Sasa
                      </Link>
                      <Link
                        href={`/bidhaa/${p.slug}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 text-center"
                      >
                        Soma zaidi
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/bidhaa"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-[#0f3d2e] shadow-2xs hover:bg-slate-50 transition-all"
            >
              <span>Tazama Orodha Kamili ya Bidhaa na Bei</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. FOOTER HERO (FULL WIDTH - NO MARGIN/GAP WITH FOOTER, DEEP BLACK GRADIENT) */}
      <section className="w-full bg-gradient-to-br from-[#0a1510] via-[#060e0a] to-[#020504] px-4 sm:px-8 py-16 md:py-20 text-white mb-0">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Uko Tayari Kubadilisha Upishi Wako na Nishati Safi?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Tunahudumia wateja wa majumbani, migahawa, hoteli, taasisi na viwanda kote nchini.
            <br className="hidden sm:inline" />
            Wasiliana nasi leo kupata mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono, au mbolea asilia.
          </p>

          {/* Action Buttons: WhatsApp (Green) & Tuma Ujumbe (Golden Yellow) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#25d366] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#20ba5a] transition-all"
            >
              <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
              </svg>
              <span>Wasiliana WhatsApp</span>
            </a>

            <Link
              href="/wasiliana"
              className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f5a623] px-7 py-3.5 text-sm font-bold text-black shadow-md hover:bg-[#e09513] transition-all"
            >
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <span>Tuma Ujumbe</span>
            </Link>
          </div>

          {/* Contact Details Line */}
          <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <a href={`tel:${rawPhone}`} className="hover:text-emerald-400 transition-colors font-medium">
              Piga simu: <span className="text-white font-bold">{phone}</span>
            </a>
            <span>•</span>
            <a href={`mailto:${email}`} className="hover:text-emerald-400 transition-colors font-medium">
              Barua pepe: <span className="text-white font-bold">{email}</span>
            </a>
            <span>•</span>
            <span className="text-slate-300">Ofisi: Mbeya, Tanzania</span>
          </div>
        </div>
      </section>
    </>
  );
}
