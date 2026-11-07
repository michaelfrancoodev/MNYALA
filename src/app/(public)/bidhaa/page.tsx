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
  ["Moto Mrefu (Saa 6+)", "Mkaa wetu unawaka kwa muda mrefu sana na kutoa joto la kudumu wakati wote wa kupika."],
  ["Unalinda Misitu ya Asili", "Tunatumia matunda ya mbono yaliyodondoka au kuchumwa, hivyo kupunguza kabisa ukataji wa miti."],
  ["Bila Moshi Wala Harufu", "Unatoa kiwango kidogo sana cha moshi, jambo bora kwa afya ya familia na usafi wa vyombo na nyumba."],
  ["Endelevu na Rafiki kwa Kilimo", "Mti wa mbono unazalisha matunda kila mwaka bila kukatwa, na mabaki yanakuwa mbolea hai."],
];

const SIZES = [
  { size: "Gramu 100", use: "Sampuli na majaribio ya haraka" },
  { size: "Kilo 1", use: "Kupikia chakula cha familia ndogo" },
  { size: "Kilo 5", use: "Matumizi ya nyumbani kwa siku kadhaa" },
  { size: "Kilo 7", use: "Kifurushi cha wiki kwa familia" },
  { size: "Kilo 15", use: "Biashara ndogo, mikahawa na chipsi" },
  { size: "Kilo 30", use: "Hoteli, mashule, kambi na taasisi" },
];

export default async function ProductsPage() {
  const [products, site] = await Promise.all([getPublishedProducts(), getSiteSettings()]);

  return (
    <>
      <PageHeading eyebrow="Katalogi ya Bidhaa" title="Suluhisho Lako Kamili la Nishati Safi">
        <p>
          Mnyala Co. Ltd inatengeneza na kusambaza bidhaa zenye ubora wa juu zinazotokana na mti wa mbono. Kila moja imebuniwa kwa
          uangalifu ili kutoa thamani kubwa, kupunguza gharama zako, na kulinda mazingira.
        </p>
      </PageHeading>

      <section className="border-b border-line bg-paper py-12 sm:py-16">
        <div className="mx-auto max-w-6xl space-y-8 px-5 sm:px-8">
          {products.length > 0 ? (
            products.map((p) => <ProductEntry key={p.id} product={p} whatsapp={site.whatsapp} />)
          ) : (
            <div className="rounded-2xl border border-line bg-surface p-12 text-center text-ink-soft">
              <p className="text-lg">Orodha ya bidhaa inaandaliwa. Tafadhali wasiliana nasi moja kwa moja kwa maelezo.</p>
            </div>
          )}
        </div>
      </section>

      {/* Packaging sizes and specs */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Ulinganifu wa Thamani</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Kwa Nini Mkaa wa Mnyala?</h2>
            <div className="mt-6 space-y-4">
              {WHY.map(([term, text]) => (
                <div key={term} className="rounded-xl border border-line/80 bg-paper p-4">
                  <h3 className="text-base font-bold text-brand-dark">{term}</h3>
                  <p className="mt-1 text-sm text-ink-soft">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Ufungashaji wa Kisasa</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Vifungashio Vinavyopatikana</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Mkaa wetu umefungashwa kitaalamu kwa mifuko imara isiyovuja majivu, kuanzia rejareja ya nyumbani hadi oda kubwa za kibiashara.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {SIZES.map((item) => (
                <div key={item.size} className="rounded-xl border border-line/80 bg-paper p-4">
                  <p className="text-base font-bold text-ink">{item.size}</p>
                  <p className="mt-0.5 text-xs text-muted">{item.use}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-emerald-50 p-5 border border-emerald-200/80">
              <p className="text-sm font-bold text-emerald-950">Unahitaji mzigo wa jumla au tani?</p>
              <p className="mt-1 text-xs text-emerald-800">
                Tunatoa punguzo maalum kwa wanunuzi wa jumla, wasambazaji wa mikoani, na taasisi. Wasiliana nasi kwa quotation ya haraka.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer banner */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Unahitaji mkaa, jiko, mbegu au mbolea?</h2>
              <p className="mt-2 text-emerald-100/90 text-sm sm:text-base">
                Wasiliana nasi leo upate bei maalum kulingana na mahitaji yako au uthibitisho wa mzigo kufika eneo lako.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/wasiliana" className={buttonClasses("primary", "md", "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent")}>
                {COMMON.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
