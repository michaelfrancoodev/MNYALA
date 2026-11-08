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

const HIGHLIGHTS = [
  {
    title: "Moto Mrefu & Joto Kali",
    desc: "Unawaka kwa muda mrefu na joto thabiti, bora kwa kupikia majumbani, migahawani, na viwandani.",
  },
  {
    title: "Moshi Mdogo & Afya Bora",
    desc: "Hutoa moshi mdogo sana na majivu machache, hivyo kulinda afya ya familia yako jikoni.",
  },
  {
    title: "Eco-Friendly (Bila Kukata Miti)",
    desc: "Hutengenezwa kwa matunda na mbegu za mbono, hivyo kuokoa misitu na kuhifadhi mazingira.",
  },
  {
    title: "Mbolea Asilia (Mboji)",
    desc: "Mabaki ya mchakato wa uzalishaji tunayageuza kuwa mbolea yenye rutuba tele kwa kilimo.",
  },
];

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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Mkaa safi unaotokana na matunda ya mbono
            <br />
            <span style={{ color: "var(--accent)" }}>Kwa Maisha Bora na Mazingira Salama</span>
          </h1>
          <p>
            Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia kutokana na mabaki ya uzalishaji. Suluhisho la nishati safi majumbani, hoteli, na viwanda.
          </p>
          <div className="hero-buttons flex items-center justify-center gap-4 flex-wrap">
            <Link href="#bidhaa" className="btn">
              Angalia Bidhaa
            </Link>
            <Link href="/wasiliana" className="btn-secondary">
              Wasiliana Nasi
            </Link>
          </div>
        </div>
      </section>

      {/* Human-Centric Feature Section: Side-by-Side Narrative + Curved Visual Frame */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            {/* Story Content (Left Column on Desktop) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-100">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Kuhusu Suluhisho Letu • Mbeya, Tanzania
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight leading-tight">
                Nishati Safi Yenye Joto Kali, Isiyotoa Moshi Wala Kukata Miti
              </h2>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                Kwa miaka mingi, upishi umekuwa ukiathiri afya za familia kwa moshi na kuteketeza misitu yetu. Mnyala Co. Ltd imekuja na mabadiliko halisi: tunazalisha mkaa safi wa kisasa unaotokana na matunda na mbegu za mbono (Jatropha curcas). Matokeo yake ni moto wenye joto kali unaodumu kwa saa nyingi, usio na moshi unaochoma macho, na mabaki yake yanatengeneza mbolea asilia kwa kilimo.
              </p>

              {/* 4 Compact Value Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {HIGHLIGHTS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all hover:bg-slate-50 hover:shadow-xs">
                    <h3 className="text-sm font-bold text-[#0f3d2e] mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Link
                  href="/kuhusu"
                  className="inline-flex items-center gap-2 font-bold text-[#2d7a3e] hover:text-[#1e5a2b] transition-colors group"
                >
                  <span>Soma zaidi kuhusu safari na uzalishaji wetu</span>
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Visual Frame with Curved Aesthetic (Right Column on Desktop) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative background glow */}
                <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-tr from-emerald-100 to-amber-100 opacity-60 blur-xl" aria-hidden="true" />

                {/* Main Curved Image Container */}
                <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl bg-slate-900 aspect-[4/5] sm:aspect-square lg:aspect-[4/5]">
                  <Image
                    src="/lifestyle/mnyala-cooking-hero.jpg"
                    alt="Upishi salama na mkaa safi wa Mnyala Co. Ltd Mbeya"
                    width={800}
                    height={1000}
                    className="size-full object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />

                  {/* Circle Badge Stamp */}
                  <div className="absolute top-5 right-5 flex size-20 sm:size-22 items-center justify-center rounded-full bg-white/95 p-2 text-center shadow-lg backdrop-blur-xs border border-emerald-100">
                    <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-[#0f3d2e] leading-tight">
                      100%<br /><span className="text-[#f5a623]">Asilia</span><br />Mbeya
                    </p>
                  </div>

                  {/* Bottom Floating Glass Card */}
                  <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/60 p-4 text-white backdrop-blur-md border border-white/20">
                    <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">Uzalishaji Endelevu</p>
                    <p className="text-sm font-semibold text-white/90 leading-snug">
                      Kutoka matunda ya mbono hadi jikoni kwako — bila kukata miti ya asili.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section: 2x2 Clean Balanced Grid */}
      <section className="py-16 md:py-20 bg-[#f8faf7]" id="bidhaa">
        <div id="products" className="sr-only" aria-hidden="true">Bidhaa Zetu</div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
            <span className="inline-block rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0f3d2e]">
              Bidhaa Zetu
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
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Product Image Header */}
                <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-slate-100">
                  {p.image ? (
                    <MediaImage
                      image={p.image}
                      sizes="(min-width: 1024px) 30rem, 100vw"
                      className="size-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="size-full bg-[#e8f5e9] flex items-center justify-center p-6 text-center text-[#0f3d2e] font-bold">
                      {p.name}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0f3d2e] shadow-xs backdrop-blur-xs">
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
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#2d7a3e] px-4 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#1e5a2b] text-center"
                    >
                      Agiza Sasa
                    </Link>
                    <Link
                      href={`/bidhaa/${p.slug}`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:text-slate-900 text-center"
                    >
                      Soma zaidi
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Footer Hero (Black / Dark Background CTA with WhatsApp & Messages) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="relative overflow-hidden rounded-3xl bg-[#0a1410] px-6 py-12 sm:px-12 sm:py-16 lg:px-16 text-white shadow-2xl">
          {/* Subtle nature leaf glow */}
          <div className="absolute -top-24 -right-24 size-96 rounded-full bg-emerald-600/15 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden="true" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-xs border border-white/10">
              Mnyala Co. Ltd • Mbeya, Tanzania
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Uko Tayari Kubadilisha Upishi Wako na Nishati Safi?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Tunahudumia wateja wa majumbani, migahawa, hoteli, taasisi na viwanda kote nchini. Wasiliana nasi leo kupata mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono, au mbolea asilia.
            </p>

            {/* Action Buttons: WhatsApp & Tuma Ujumbe */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-600 transition-all"
              >
                <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.275.072.376-.044c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z" />
                </svg>
                <span>Wasiliana Kupitia WhatsApp</span>
              </a>

              <Link
                href="/wasiliana"
                className="w-full sm:w-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 px-6 py-3 text-sm font-bold text-white shadow-xs backdrop-blur-xs transition-all"
              >
                <span>Tuma Ujumbe wa Moja kwa Moja</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            {/* Direct Phone & Email info line */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
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
        </div>
      </section>
    </>
  );
}
