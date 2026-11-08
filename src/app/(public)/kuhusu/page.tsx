import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MediaImage } from "@/components/public/media-image";
import { getPublishedGallery, getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Kuhusu sisi | Mnyala Co. Ltd",
  description:
    "Mnyala Co. Ltd ni kampuni ya Kitanzania inayotengeneza mkaa safi, majiko, mbegu na mbolea asilia kutokana na matunda ya mti wa mbono jijini Mbeya.",
};

export default async function AboutPage() {
  const [gallery, site] = await Promise.all([getPublishedGallery(), getSiteSettings()]);
  const photo = gallery.find((g) => g.category === "production")?.image ?? null;

  return (
    <>
      {/* =========================
           1. ABOUT HERO
      ========================= */}
      <section className="about-hero">
        <div className="about-overlay">
          <span>KARIBU KWA MNYALA CO. LTD</span>
          <h1>Tunageuza Matunda (mbono) kuwa Nishati Endelevu</h1>
          <p>
            Tunatengeneza mkaa safi, majiko, mbegu, na mbolea asilia kutokana na matunda ya mti wa mbono (Jatropha curcas). Lengo letu ni kulinda misitu, kupunguza taka, na kutoa nishati safi kwa jamii.
          </p>
        </div>
      </section>

      {/* =========================
           2. WHO WE ARE
      ========================= */}
      <section className="about-section">
        <div className="about-image">
          {photo ? (
            <MediaImage
              image={photo}
              sizes="(min-width: 1024px) 32rem, 100vw"
              className="size-full object-cover rounded-xl"
            />
          ) : (
            <Image
              src="/original/staff.jpg"
              alt="Mnyala Co. Ltd - Timu ya Uzalishaji wa Mkaa Mbeya"
              width={700}
              height={500}
              className="size-full object-cover rounded-xl"
            />
          )}
        </div>

        <div className="about-text">
          <h2>Sisi Ni Nani?</h2>
          <p>
            <strong>Mnyala Company Limited</strong> ni kampuni ya Kitanzania iliyojitolea kutengeneza mkaa wa ubora wa juu kutokana na matunda ya mti wa mbono (Jatropha curcas). Tunaamini kuwa matunda haya ni rasilimali muhimu yanayoweza kugeuzwa kuwa nishati safi huku tukilinda mazingira yetu.
          </p>
          <p>
            Bidhaa zetu zinatoa suluhisho la gharama nafuu, salama, na endelevu badala ya mkaa wa kawaida, zikisaidia familia na biashara kupunguza athari za mazingira. Pia tunatengeneza mboji (mbolea asilia) kutokana na mabaki ya uzalishaji.
          </p>
          <p>
            Zaidi ya mkaa, tunauza majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa, pamoja na mbegu za mbono kwa wakulima wanaotaka kuanza kilimo cha mti huu wa thamani.
          </p>
        </div>
      </section>

      {/* =========================
           3. OUR STORY
      ========================= */}
      <section className="company-story">
        <h2>Hadithi Yetu</h2>
        <p>
          Mnyala Company ilianzishwa kwa dira moja rahisi: kugeuza rasilimali za kilimo kuwa bidhaa za nishati zenye thamani. Tuliona kiwango cha ukataji wa miti kinaongezeka, tukabuni mkaa unaolinda mazingira, na kupunguza hewa chafu inayotokana na uchomaji mkaa wa miti ya asili.
        </p>
        <p>
          Tunaendelea kuwekeza katika ubunifu, uendelevu, na uzalishaji wa ubora. Bidhaa zetu sasa zinajumuisha mkaa safi, mbegu, na mbolea asilia — zote zikitokana na mti mmoja wa mbono.
        </p>
      </section>

      {/* =========================
           4. MISSION & VISION
      ========================= */}
      <section className="mission-vision">
        <div className="mission-card">
          <div className="flex items-center justify-center size-12 rounded-full bg-emerald-100 text-[#2d7a3e] mb-4">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3>Dira Yetu</h3>
          <p>
            Kutengeneza bidhaa za nishati zinazolinda mazingira kutokana na matunda ya mbono, kupunguza ukataji wa miti, na kutoa ajira kwa jamii. Kulihudumia bara la Afrika kwa nishati endelevu.
          </p>
        </div>

        <div className="mission-card">
          <div className="flex items-center justify-center size-12 rounded-full bg-emerald-100 text-[#2d7a3e] mb-4">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h3>Maono Yetu</h3>
          <p>
            Kuwa kinara barani Afrika katika nishati endelevu na ubunifu wa bidhaa rafiki kwa mazingira, kwa kujenga mustakabali salama, kijani na wenye manufaa kwa jamii na vizazi vijavyo.
          </p>
        </div>
      </section>

      {/* =========================
           5. IMPACT SECTION (Shown when verified statistics are entered in site_settings)
      ========================= */}
      {site.stats.length > 0 ? (
        <section className="impact">
          <h2>Mchango Wetu kwa Mazingira</h2>
          <div className="impact-grid">
            {site.stats.map((s) => (
              <div key={s.label}>
                <h3>{s.value}</h3>
                <p>{s.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* =========================
           6. CTA SECTION
      ========================= */}
      <section className="about-cta">
        <h2>Jiunge Nasi Kutengeneza Mustakabali wa Kijani</h2>
        <p>
          Chagua bidhaa zetu za nishati safi na usaidie kulinda misitu ya asili ya Tanzania.
        </p>
        <Link href="/wasiliana" className="btn inline-flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Wasiliana Nasi</span>
        </Link>
      </section>
    </>
  );
}
