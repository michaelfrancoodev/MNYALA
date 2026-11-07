import type { Metadata } from "next";
import Link from "next/link";
import { PageHeading } from "@/components/public/page-heading";
import { ProductEntry } from "@/components/public/product-row";
import { buttonClasses } from "@/components/ui/button";
import { COMMON } from "@/messages/sw";
import { getPublishedProducts, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Bidhaa",
  description: "Mkaa safi, majiko ya ufanisi, mbegu za mbono na mboji (mbolea asilia) kutoka Mnyala Co. Ltd, Mbeya.",
};

const WHY: Array<[string, string]> = [
  ["Moto mrefu", "Mkaa wetu unawaka kwa muda mrefu na kutoa joto la kudumu wakati wote wa kupika."],
  ["Unalinda misitu", "Tunatumia matunda ya mbono, hivyo kupunguza ukataji wa miti."],
  ["Moshi mdogo", "Unatoa kiwango kidogo cha moshi, jambo bora kwa afya ya familia na mazingira ya nyumbani."],
  ["Endelevu", "Mti wa mbono unazalisha matunda kila mwaka, rasilimali isiyokwisha."],
];

export default async function ProductsPage() {
  const [products, site] = await Promise.all([getPublishedProducts(), getSiteSettings()]);

  return (
    <>
      <PageHeading eyebrow="Bidhaa" title="Suluhisho lako la nishati safi">
        <p>
          Mnyala Co. Ltd inatengeneza na kuuza bidhaa nne kuu zinazotokana na mti wa mbono. Kila moja imebuniwa kwa uangalifu ili
          itoe thamani kubwa huku ikilinda mazingira. Chagua kile unachohitaji.
        </p>
      </PageHeading>

      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl divide-y divide-line px-5 sm:px-8">
          {products.length > 0 ? (
            products.map((p) => <ProductEntry key={p.id} product={p} whatsapp={site.whatsapp} />)
          ) : (
            <p className="py-16 text-lg text-ink-soft">Orodha ya bidhaa inaandaliwa. Tafadhali wasiliana nasi moja kwa moja.</p>
          )}
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2">
          <div>
            <h2 className="text-3xl font-semibold">Kwa nini mkaa wa Mnyala</h2>
            <dl className="mt-6 space-y-5">
              {WHY.map(([term, text]) => (
                <div key={term}>
                  <dt className="font-serif text-lg font-semibold text-brand-dark">{term}</dt>
                  <dd className="text-ink-soft">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h2 className="text-3xl font-semibold">Vifungashio</h2>
            <p className="mt-6 text-lg text-ink-soft">
              Mkaa unapatikana kwa vifungashio vya gramu 100, kilo 1, kilo 5, kilo 7, kilo 15 na kilo 30. Kwa oda kubwa, wasiliana
              nasi ili tukupe bei maalum.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-brand-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold">Unahitaji mkaa, jiko, mbegu au mbolea?</h2>
            <p className="mt-2 text-ink-soft">Wasiliana nasi leo upate bei kulingana na mahitaji yako.</p>
          </div>
          <Link href="/wasiliana" className={buttonClasses("primary")}>
            {COMMON.contactUs}
          </Link>
        </div>
      </section>
    </>
  );
}
