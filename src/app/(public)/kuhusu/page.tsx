import type { Metadata } from "next";
import Link from "next/link";
import { MediaImage } from "@/components/public/media-image";
import { PageHeading } from "@/components/public/page-heading";
import { buttonClasses } from "@/components/ui/button";
import { COMMON } from "@/messages/sw";
import { getPublishedGallery, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Kuhusu sisi",
  description:
    "Mnyala Co. Ltd ni kampuni ya Kitanzania inayotengeneza mkaa safi, majiko, mbegu na mbolea asilia kutokana na matunda ya mti wa mbono.",
};

export default async function AboutPage() {
  const [gallery, site] = await Promise.all([getPublishedGallery(), getSiteSettings()]);
  const photo = gallery.find((g) => g.category === "production")?.image ?? null;

  return (
    <>
      <PageHeading eyebrow="Kuhusu sisi" title="Tunageuza matunda ya mbono kuwa nishati endelevu">
        <p>
          Tunatengeneza mkaa safi, majiko, mbegu na mbolea asilia kutokana na matunda ya mti wa mbono (Jatropha curcas). Lengo
          letu ni kulinda misitu, kupunguza taka na kutoa nishati safi kwa jamii.
        </p>
      </PageHeading>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
          <div className="max-w-prose space-y-5 text-lg">
            <h2 className="text-3xl font-semibold">Sisi ni nani</h2>
            <p>
              Mnyala Company Limited ni kampuni ya Kitanzania iliyojitolea kutengeneza mkaa wa ubora wa juu kutokana na matunda ya
              mti wa mbono (Jatropha curcas). Tunaamini kuwa matunda haya ni rasilimali muhimu yanayoweza kugeuzwa kuwa nishati
              safi huku tukilinda mazingira yetu.
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
          {photo ? (
            <MediaImage image={photo} sizes="(min-width: 1024px) 24rem, 100vw" className="aspect-[4/3] w-full rounded-md border border-line object-cover lg:self-start" />
          ) : null}
        </div>
      </section>

      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <h2 className="text-3xl font-semibold">Hadithi yetu</h2>
          <div className="mt-5 max-w-prose space-y-5 text-lg">
            <p>
              Mnyala Company ilianzishwa kwa dira moja rahisi: kugeuza rasilimali za kilimo kuwa bidhaa za nishati zenye thamani.
              Tuliona kiwango cha ukataji wa miti kinaongezeka, tukabuni mkaa unaolinda mazingira na kupunguza hewa chafu
              inayotokana na uchomaji mkaa wa kawaida wa kuni.
            </p>
            <p>
              Tunaendelea kuwekeza katika ubunifu, uendelevu na uzalishaji wa ubora. Bidhaa zetu sasa zinajumuisha mkaa safi,
              mbegu na mbolea asilia, zote zikitokana na mti mmoja wa mbono.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Dira yetu</h2>
            <p className="mt-3 text-lg text-ink-soft">
              Kutengeneza bidhaa za nishati zinazolinda mazingira kutokana na matunda ya mbono, kupunguza ukataji wa miti, na
              kutoa ajira kwa jamii. Kuhudumia bara la Afrika.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Maono yetu</h2>
            <p className="mt-3 text-lg text-ink-soft">
              Kuwa kinara barani Afrika katika nishati endelevu na ubunifu wa bidhaa rafiki kwa mazingira, kwa kujenga
              mustakabali salama, wa kijani na wenye manufaa kwa jamii na vizazi vijavyo.
            </p>
          </div>
        </div>
      </section>

      {site.stats.length > 0 ? (
        <section className="border-b border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
            <h2 className="text-3xl font-semibold">Mchango wetu kwa mazingira</h2>
            <dl className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {site.stats.map((s) => (
                <div key={s.label} className="border-t-2 border-brand pt-3">
                  <dd className="font-serif text-4xl font-semibold text-brand-dark">{s.value}</dd>
                  <dt className="mt-1 text-ink-soft">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <section className="bg-brand-tint">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8">
          <h2 className="max-w-xl text-3xl font-semibold">Chagua nishati safi, linda misitu ya Tanzania</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/bidhaa" className={buttonClasses("primary")}>
              {COMMON.seeProducts}
            </Link>
            <Link href="/wasiliana" className={buttonClasses("secondary")}>
              {COMMON.contactUs}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
