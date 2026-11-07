import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/public/media-image";
import { PageHeading } from "@/components/public/page-heading";
import { buttonClasses } from "@/components/ui/button";
import { COMMON } from "@/messages/sw";
import { getPublishedGallery, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Kuhusu Sisi",
  description:
    "Mnyala Co. Ltd ni kampuni ya Kitanzania inayotengeneza mkaa safi, majiko, mbegu na mbolea asilia kutokana na matunda ya mti wa mbono.",
};

export default async function AboutPage() {
  const [gallery, site] = await Promise.all([getPublishedGallery(), getSiteSettings()]);
  const photo = gallery.find((g) => g.category === "production")?.image ?? null;

  return (
    <>
      <PageHeading eyebrow="Kuhusu Kampuni" title="Tunageuza Matunda ya Mbono Kuwa Nishati Endelevu">
        <p>
          Mnyala Co. Ltd inatengeneza mkaa safi wa kisasa, majiko ya ufanisi, mbegu za mbono (Jatropha curcas), na mbolea asilia
          kutokana na matunda ya mti wa mbono. Lengo letu ni kulinda misitu ya asili, kupunguza moshi majumbani, na kutoa nishati
          safi na ya bei nafuu kwa jamii ya Tanzania.
        </p>
      </PageHeading>

      {/* Sisi ni Nani */}
      <section className="border-b border-line bg-paper py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-5 text-base sm:text-lg text-ink-soft leading-relaxed">
            <span className="text-xs font-bold uppercase tracking-wider text-brand">Utambulisho Wetu</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Sisi ni Nani</h2>
            <p>
              Mnyala Company Limited ni kampuni ya Kitanzania yenye makao makuu jijini Mbeya, iliyojitolea kutengeneza mkaa wa ubora
              wa juu kutokana na matunda ya mti wa mbono (Jatropha curcas). Tunaamini kuwa matunda haya ni rasilimali mbadala yenye
              thamani kubwa inayoweza kuokoa maelfu ya miti inayokatwa kila siku kwa ajili ya mkaa wa kuni.
            </p>
            <p>
              Bidhaa zetu zinatoa suluhisho la gharama nafuu, salama na endelevu badala ya mkaa wa kawaida, zikisaidia familia na
              biashara kupunguza athari za mazingira. Pia tunatengeneza mboji (mbolea asilia) kutokana na mabaki ya uzalishaji.
            </p>
            <p>
              Zaidi ya mkaa, tunauza majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa, pamoja na mbegu za mbono
              kwa wakulima wanaotaka kuanza kilimo cha mti huu wa thamani.
            </p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-xl">
              {photo ? (
                <MediaImage
                  image={photo}
                  sizes="(min-width: 1024px) 24rem, 100vw"
                  className="aspect-[4/3] w-full rounded-2xl object-cover"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-brand-tint text-brand-dark font-bold text-xl">
                  Kiwanda cha Mnyala, Mbeya
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dira na Maono */}
      <section className="border-b border-line bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-paper p-8 sm:p-10 shadow-xs">
              <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                Dira Yetu (Mission)
              </span>
              <h3 className="mt-4 text-2xl font-bold text-ink">Nishati Endelevu na Uhifadhi</h3>
              <p className="mt-3 text-base text-ink-soft leading-relaxed">
                Kutengeneza bidhaa za nishati safi zinazolinda mazingira kutokana na matunda ya mbono, kupunguza ukataji wa miti ya
                asili, kutoa ajira za kijani kwa jamii, na kuhudumia bara zima la Afrika kwa nishati endelevu.
              </p>
            </div>

            <div className="rounded-3xl border border-line bg-paper p-8 sm:p-10 shadow-xs">
              <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                Maono Yetu (Vision)
              </span>
              <h3 className="mt-4 text-2xl font-bold text-ink">Kuwa Kinara Barani Afrika</h3>
              <p className="mt-3 text-base text-ink-soft leading-relaxed">
                Kuwa kinara barani Afrika katika nishati mbadala na ubunifu wa bidhaa rafiki kwa mazingira, kwa kujenga lazima
                salama, ya kijani na yenye manufaa ya kiuchumi kwa jamii na vizazi vijavyo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter */}
      {site.stats.length > 0 ? (
        <section className="border-b border-line bg-paper py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8">
            <h2 className="text-3xl font-extrabold text-ink text-center">Mchango Wetu Katika Mazingira & Jamii</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label} className="rounded-2xl border border-line bg-surface p-6 text-center shadow-2xs">
                  <p className="text-4xl font-extrabold text-brand-dark">{s.value}</p>
                  <p className="mt-2 text-sm font-semibold text-ink-soft">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA Banner */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-gradient-to-r from-emerald-800 to-slate-900 p-8 sm:p-12 text-white shadow-xl">
            <div className="max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold">Chagua Nishati Safi, Linda Misitu ya Tanzania</h2>
              <p className="mt-2 text-emerald-100/90 text-sm sm:text-base">
                Jiunge na mamia ya familia na biashara zinazotumia mkaa wa mbono leo.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/bidhaa" className={buttonClasses("primary", "md", "bg-emerald-500 hover:bg-emerald-600 text-white border-transparent")}>
                {COMMON.seeProducts}
              </Link>
              <Link href="/wasiliana" className={buttonClasses("secondary", "md", "bg-white/10 hover:bg-white/20 text-white border-white/20")}>
                {COMMON.contactUs}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
