import type { Metadata } from "next";
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

const REASONS: Array<[string, string]> = [
  ["Eco-Friendly", "Mkaa wetu unatengenezwa kutokana na matunda ya mbono, hivyo kupunguza ukataji wa miti na kuhifadhi mazingira."],
  ["Moto Mrefu", "Unawaka kwa muda mrefu na joto la kudumu, hivyo kuwa bora kwa kupikia majumbani na biashara."],
  ["Moshi Mdogo", "Hutoa moshi mdogo sana na majivu machache, hivyo kuwa salama kwa afya ya familia yako."],
  ["Kuzalisha Mbolea", "Mabaki ya uzalishaji tunayageuza kuwa mbolea asilia bora kwa kilimo cha mazao ya chakula."],
  ["Uwasilishaji Wa Uhakika", "Tunahakikisha bidhaa zinafika kwa wakati kwa wateja wa majumbani, hoteli, viwanda, na masoko."],
  ["Bei Nafuu", "Mkaa wa ubora wa juu, kwa bei nafuu rafiki kwa mteja."],
];

const SERVICES: Array<[string, string]> = [
  ["Uuzaji na uzalishaji wa Mkaa Safi", "Tunatengeneza na kuuza mkaa safi wa kisasa unaofaa kwa matumizi ya nyumbani, hoteli, na viwanda. Moto wenye joto kali na moshi kwa kiasi kidogo."],
  ["Uuzaji na uzalishaji wa Majiko", "Tunauza majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa na imara."],
  ["Uuzaji wa Mbegu za Mbono", "Tunatoa mbegu bora za mti wa mbono (Jatropha curcas) kwa wakulima wanaotaka kuanza kilimo cha mti huu."],
  ["Uuzaji na uzalishaji wa Mboji (Mbolea)", "Mabaki ya mchakato wa kutengeneza mkaa tunayageuza kuwa mbolea asilia yenye virutubisho bora kwa mimea."],
  ["Upandaji Miti", "Tunaunga mkono watu binafsi, shule, taasisi na jamii katika upandaji wa miti ya mbono ili kulinda mazingira."],
  ["Elimu ya Mazingira", "Tunatoa mafunzo na kuhamasisha jamii kuhusu nishati safi, kuchakata taka, na kulinda mazingira."],
];

export default async function HomePage() {
  const [products, site] = await Promise.all([
    getPublishedProducts(),
    getSiteSettings(),
  ]);

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

      <section className="hero">
        <div className="hero-content">
          <h1>
            Mkaa safi unaotokana na matunda ya mbono
            <br />
            <span style={{ color: "var(--accent)" }}>Kwa Maisha Bora</span>
          </h1>
          <p>
            Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia kutokana na mabaki ya uzalishaji. Suluhisho la nishati safi majumbani, hoteli, na viwanda.
          </p>
          <div className="hero-buttons flex items-center justify-center gap-4 flex-wrap">
            <Link href="/bidhaa" className="btn">
              Angalia Bidhaa
            </Link>
            <Link href="/wasiliana" className="btn-secondary">
              Wasiliana Nasi
            </Link>
          </div>
        </div>
      </section>

      <section className="why-choose">
        <div className="section-header">
          <span className="section-tag">Kwanini Mnyala?</span>
          <h2>Kwa Nini Wateja Wanatuamini</h2>
          <p>
            Tumejitolea kutoa suluhisho za nishati endelevu kupitia uzalishaji wa mkaa safi unaolinda mazingira na kuokoa misitu.
          </p>
        </div>

        <div className="choose-container">
          {REASONS.map(([title, desc]) => (
            <div key={title} className="choose-card">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="services" id="services">
        <div className="section-header">
          <span className="section-tag">Huduma Zetu</span>
          <h2>Tunachokifanya</h2>
          <p>
            Tunatoa suluhisho mbalimbali za mazingira kupitia bidhaa za nishati mbadala, usaidizi wa kilimo, na maendeleo ya jamii.
          </p>
        </div>

        <div className="services-container">
          {SERVICES.map(([title, desc]) => (
            <div key={title} className="service-card">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="featured-products" id="products">
        <div className="section-header">
          <span className="section-tag">Bidhaa Zetu</span>
          <h2>Bidhaa Zetu Bora Zinazouzika</h2>
          <p>
            Gundua bidhaa zetu zinazolinda mazingira zilizobuniwa kutoa nishati safi, endelevu, na bei nafuu kwa kila mtu.
          </p>
        </div>

        <div className="products-container">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              <div className="product-image">
                {p.image ? (
                  <MediaImage
                    image={p.image}
                    sizes="(min-width: 1024px) 24rem, 100vw"
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="size-full bg-[#e8f5e9] flex items-center justify-center p-6 text-center text-[#0f3d2e] font-bold">
                    {p.name}
                  </div>
                )}
              </div>
              <div className="product-content">
                <h3>{p.name}</h3>
                <p>{p.summary}</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
                  <Link href={`/wasiliana?bidhaa=${p.slug}`} className="btn-product flex-1 text-center font-bold">
                    Agiza Sasa
                  </Link>
                  <Link href={`/bidhaa#${p.slug}`} className="btn-card-outline flex-1 text-center font-bold">
                    Maelezo Zaidi
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
