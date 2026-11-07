import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/public/json-ld";
import { MediaImage } from "@/components/public/media-image";
import { ProductLine } from "@/components/public/product-row";
import { buttonClasses } from "@/components/ui/button";
import { telLink, whatsappLink } from "@/lib/contact-links";
import { getEnv } from "@/lib/env";
import { COMMON } from "@/messages/sw";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: { absolute: "Mnyala Co. Ltd | Mkaa safi kutoka kwa matunda ya mbono, Mbeya" },
  description:
    "Mkaa safi, majiko ya ufanisi, mbegu za mbono na mboji (mbolea asilia) kutoka Mbeya, Tanzania. Moto mrefu, moshi mdogo, na bei nafuu.",
};

const REASONS: Array<[string, string]> = [
  ["Rafiki kwa mazingira", "Mkaa wetu unatengenezwa kutokana na matunda ya mbono, hivyo kupunguza ukataji wa miti na kuhifadhi mazingira."],
  ["Moto mrefu", "Unawaka kwa muda mrefu na joto la kudumu, hivyo ni bora kwa kupikia majumbani na biashara."],
  ["Moshi mdogo", "Hutoa moshi mdogo sana na majivu machache, hivyo ni salama zaidi kwa afya ya familia yako."],
  ["Mbolea kutoka mabaki", "Mabaki ya uzalishaji tunayageuza kuwa mbolea asilia kwa kilimo cha mazao ya chakula."],
  ["Uwasilishaji wa uhakika", "Tunahakikisha bidhaa zinafika kwa wakati kwa wateja wa majumbani, hoteli, viwanda na masoko."],
  ["Bei nafuu", "Mkaa wa ubora wa juu kwa bei rafiki kwa mteja."],
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

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-14">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-ember">Mbeya, Tanzania</p>
            <h1 className="mt-3 text-4xl font-semibold sm:text-5xl lg:text-6xl">Mkaa safi unaotokana na matunda ya mbono</h1>
            <p className="mt-5 max-w-xl text-lg text-ink-soft">
              Mnyala Co. Ltd inakuletea mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas) na mbolea asilia
              kutokana na mabaki ya uzalishaji. Suluhisho la nishati safi kwa majumbani, hoteli na viwanda.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bidhaa" className={buttonClasses("primary")}>
                {COMMON.seeProducts}
              </Link>
              <Link href="/wasiliana" className={buttonClasses("secondary")}>
                {COMMON.contactUs}
              </Link>
            </div>
          </div>
          {heroImage ? (
            <MediaImage
              image={heroImage}
              priority
              sizes="(min-width: 1024px) 28rem, 100vw"
              className="aspect-[4/3] w-full rounded-md border border-line object-cover lg:aspect-square"
            />
          ) : null}
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="max-w-2xl text-3xl font-semibold">Kutoka mti mmoja wa mbono</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {[
              ["Matunda", "Tunayageuza kuwa mkaa safi wa kisasa wenye joto kali na moshi mdogo."],
              ["Mbegu", "Tunawauzia wakulima wanaotaka kupanda miti ya mbono, hata kama ukuta wa miti."],
              ["Mabaki", "Mabaki ya uzalishaji wa mkaa hayatupwi: yanageuzwa kuwa mboji, mbolea asilia."],
            ].map(([title, text], i) => (
              <li key={title} className="border-t-2 border-brand pt-4">
                <p className="font-serif text-4xl font-semibold text-brand-dark" aria-hidden="true">
                  {i + 1}
                </p>
                <h3 className="mt-1 text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-ink-soft">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {products.length > 0 ? (
        <section className="border-b border-line">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-3xl font-semibold">Bidhaa zetu</h2>
              <Link href="/bidhaa" className="font-semibold">
                Bidhaa zote
              </Link>
            </div>
            <div className="mt-6 divide-y divide-line border-y border-line">
              {products.map((p) => (
                <ProductLine key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="max-w-2xl text-3xl font-semibold">Kwa nini wateja wanatuamini</h2>
          <dl className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
            {REASONS.map(([term, text]) => (
              <div key={term}>
                <dt className="font-serif text-xl font-semibold text-brand-dark">{term}</dt>
                <dd className="mt-1 text-ink-soft">{text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Upandaji miti</h2>
            <p className="mt-2 text-ink-soft">
              Tunaunga mkono watu binafsi, shule, taasisi na jamii katika upandaji wa miti ya mbono ili kulinda mazingira.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Elimu ya mazingira</h2>
            <p className="mt-2 text-ink-soft">
              Tunatoa mafunzo na kuhamasisha jamii kuhusu nishati safi, kuchakata taka na kulinda mazingira.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold">Una swali au unahitaji bei?</h2>
            <p className="mt-2 text-ink-soft">Tupigie simu, tuandikie kwa WhatsApp, au tuma ujumbe. Tutakujibu.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {site.phone ? (
              <a href={telLink(site.phone)} className={buttonClasses("primary")}>
                {COMMON.call}: {site.phone}
              </a>
            ) : null}
            {site.whatsapp ? (
              <a href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji bei.")} className={buttonClasses("secondary")}>
                {COMMON.whatsapp}
              </a>
            ) : null}
            <Link href="/wasiliana" className={buttonClasses("secondary")}>
              Tuma ujumbe
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
