import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/public/media-image";
import { whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Bidhaa Zetu | Mnyala Co. Ltd",
  description:
    "Suluhisho lako la nishati safi: Mkaa safi wa mbono, majiko ya ufanisi, mbegu bora za mbono, na mboji (mbolea asilia) Mbeya, Tanzania.",
};

const BENEFITS: Array<[string, string]> = [
  ["Moto Mrefu", "Mkaa wetu unawaka kwa muda mrefu na kutoa joto la kudumu kwa kipindi cha kupikia chakula chako."],
  ["Kulinda Misitu", "Tunatumia matunda ya mbono yaliyodondoka au kuchumwa, hivyo kupunguza ukataji wa miti ya asili."],
  ["Moshi Mdogo", "Inatoa kiwango kidogo cha moshi. Bora kwa afya ya familia na usafi wa mazingira ya nyumbani."],
  ["Endelevu", "Mti wa mbono unazalisha matunda kila mwaka bila kukatwa. Rasilimali endelevu isiyokwisha."],
];

const SPECS: Array<[string, string]> = [
  ["Malighafi (Raw Material)", "Matunda ya mbono (Jatropha curcas)"],
  ["Muda wa Kuwaka (Burn Time)", "Dakika 60 kwa kila gramu 100 (Saa 6+ kwa pakiti ya kaya)"],
  ["Joto (Calorific Value)", "17.46 kJ/g"],
  ["Carbon Imara (Fixed Carbon)", "22%"],
  ["Uwezo wa Kuwaka (Combustibility)", "74.2%"],
  ["Majivu (Ash Content)", "4%"],
  ["Unyevu (Moisture Content)", "9.1%"],
  ["Bora Kwa (Recommended For)", "Kupikia Nyumbani, Hotelini, Migahawa na Viwandani"],
];

export default async function ProductsPage() {
  const [products, site] = await Promise.all([getPublishedProducts(), getSiteSettings()]);
  const whatsapp = site.whatsapp || "+255 758 730 108";

  return (
    <>
      <section className="products-hero">
        <div className="products-overlay">
          <span>BIDHAA ZETU</span>
          <h1>Suluhisho Lako la Nishati Safi</h1>
          <p>
            Kutoka kwenye mti wa mbono (Jatropha curcas), tunakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu bora, na mbolea asilia. Bidhaa zote kwa ajili ya Majumbani, shambani, na biashara yako.
          </p>
        </div>
      </section>

      <section className="products-intro">
        <div className="container">
          <h2>Nishati Safi kwa Kila Mtu</h2>
          <p>
            Mnyala Co. Ltd inatengeneza na kuuza bidhaa nne kuu zinazotokana na mti wa mbono. Kila bidhaa imebuniwa kwa uangalifu ili kutoa thamani kubwa wakati ikilinda mazingira. Chagua kile unachohitaji leo.
          </p>
        </div>
      </section>

      <section className="featured-products" style={{ background: "var(--white)" }}>
        <div className="section-title text-center max-w-xl mx-auto mb-10">
          <span className="section-tag">BIDHAA ZOTE</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Chagua Kile Unachohitaji
          </h2>
        </div>

        <div className="products-grid">
          {products.map((p) => (
            <article key={p.id} id={p.slug} className="product-card flex flex-col justify-between scroll-mt-20">
              {p.image ? (
                <div className="product-image">
                  <MediaImage
                    image={p.image}
                    sizes="(min-width: 1024px) 24rem, 100vw"
                    className="size-full object-cover"
                  />
                </div>
              ) : (
                <div className="product-image bg-[#e8f5e9] flex items-center justify-center p-6 text-center text-[#0f3d2e] font-bold">
                  {p.name}
                </div>
              )}

              <div className="product-content flex flex-col justify-between grow">
                <div>
                  <h3>{p.name}</h3>
                  <p className="text-sm text-slate-600 mt-2 mb-3">{p.summary}</p>
                  {p.features.length > 0 ? (
                    <ul className="space-y-1 mb-4 text-xs text-slate-600 list-disc pl-4">
                      {p.features.map((feat) => (
                        <li key={feat}>{feat}</li>
                      ))}
                    </ul>
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
                      <p className="text-xs font-bold text-slate-600">Wasiliana kwa bei</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/wasiliana?bidhaa=${p.slug}`} className="btn-product w-full text-center font-bold">
                      Agiza Sasa
                    </Link>
                    <a
                      href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji kujua kuhusu ${p.name}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-[#2d7a3e] bg-emerald-50/70 py-2 px-2 text-center text-xs font-bold text-[#0f3d2e] hover:bg-[#2d7a3e] hover:text-white transition-colors"
                    >
                      Uliza kwa WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="why-products py-16 bg-[#f8faf7]">
        <div className="section-title text-center max-w-xl mx-auto mb-10">
          <span className="section-tag">FAIDA ZA BIDHAA ZETU</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Kwa Nini Uchague Bidhaa za Mnyala?
          </h2>
        </div>

        <div className="benefits-grid">
          {BENEFITS.map(([title, desc]) => (
            <div key={title} className="benefit-card">
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="specifications py-16">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">VIGEZO VYA BIDHAA</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Sifa za Mkaa Wetu
          </h2>
        </div>

        <div className="max-w-4xl mx-auto px-4 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Kipimo</th>
                <th>Maelezo</th>
              </tr>
            </thead>
            <tbody>
              {SPECS.map(([metric, val]) => (
                <tr key={metric}>
                  <td><strong>{metric}</strong></td>
                  <td>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="packaging py-16 bg-[#f8faf7]">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">VIFUNGASHIO VILIVYOPO</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Ukubwa wa Vifungashio (Packages)
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

      <section className="products-cta">
        <h2>Unahitaji Mkaa Hai na Jiko Lake, Mbegu au Mbolea?</h2>
        <p>
          Wasiliana na Mnyala Co. Ltd leo na upate bei maalum ya kiwandani kulingana na mahitaji yako.
        </p>
        <Link href="/wasiliana" className="btn">
          Wasiliana Nasi
        </Link>
      </section>
    </>
  );
}
