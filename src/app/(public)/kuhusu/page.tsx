import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = {
  title: "Kuhusu Sisi | Mnyala Co. Ltd",
  description:
    "Mnyala Co. Ltd ni kampuni ya Kitanzania inayotengeneza mkaa safi, majiko, mbegu na mbolea asilia kutokana na matunda ya mti wa mbono jijini Mbeya.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const isSw = locale === "sw";

  return (
    <>
      {/* =========================
           1. ABOUT HERO
      ========================= */}
      <section className="about-hero">
        <div className="about-overlay">
          <span>{isSw ? "KARIBU KWA MNYALA CO. LTD" : "WELCOME TO MNYALA CO. LTD"}</span>
          <h1>
            {isSw
              ? "Tunageuza Matunda (mbono) kuwa Nishati Endelevu"
              : "Converting Jatropha Biomass Fruits into Sustainable Clean Energy"}
          </h1>
          <p>
            {isSw
              ? "Tunatengeneza mkaa safi, majiko, mbegu, na mbolea asilia kutokana na matunda ya mti wa mbono (Jatropha curcas). Lengo letu ni kulinda misitu, kupunguza taka, na kutoa nishati safi kwa jamii."
              : "Manufacturing smokeless bio-charcoal, cookstoves, seeds, and organic compost from jatropha curcas fruits. Protecting indigenous forests and empowering communities."}
          </p>
        </div>
      </section>

      {/* =========================
           2. WHO WE ARE
      ========================= */}
      <section className="about-section">
        <div className="about-image">
          <Image
            src="/original/staff.jpg"
            alt="Mnyala Co. Ltd - Timu ya Uzalishaji wa Mkaa Mbeya"
            width={700}
            height={500}
            className="size-full object-cover rounded-xl"
          />
        </div>

        <div className="about-text">
          <h2>{isSw ? "Sisi Ni Nani?" : "Who We Are"}</h2>
          <p>
            <strong>Mnyala Company Limited</strong> {isSw ? "ni kampuni ya Kitanzania iliyojitolea kutengeneza mkaa wa ubora wa juu kutokana na matunda ya mti wa mbono (Jatropha curcas). Tunamini kuwa matunda haya ni rasilimali muhimu yanayoweza kugeuzwa kuwa nishati safi huku tukilinda mazingira yetu." : "is a registered Tanzanian enterprise pioneering high-grade bio-charcoal production from jatropha curcas fruits in Mbeya. We turn agricultural biomass into accessible clean energy."}
          </p>
          <p>
            {isSw
              ? "Bidhaa zetu zinatoa suluhisho la gharama nafuu, salama, na endelevu badala ya mkaa wa kawaida, zikisaidia familia na biashara kupunguza athari za mazingira. Pia tunatengeneza mboji (mbolea asilia) kutokana na mabaki ya uzalishaji."
              : "Our products provide safe, affordable, and sustainable replacements for wood charcoal, cutting indoor smoke while producing organic compost from processing residues."}
          </p>
          <p>
            {isSw
              ? "Zaidi ya mkaa, tunauza majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa, pamoja na mbegu za mbono kwa wakulima wanaotaka kuanza kilimo cha mti huu wa thamani."
              : "Beyond charcoal, we manufacture clean cookstoves tailored for high efficiency, alongside certified jatropha seeds for farmers cultivating clean energy trees."}
          </p>
        </div>
      </section>

      {/* =========================
           3. OUR STORY
      ========================= */}
      <section className="company-story">
        <h2>{isSw ? "Hadithi Yetu" : "Our Story"}</h2>
        <p>
          {isSw
            ? "Mnyala Company ilianzishwa kwa dira moja rahisi: kugeuza rasilimali za kilimo kuwa bidhaa za nishati zenye thamani. Tuliona kiwango cha ukataji wa miti kinaongezeka, tukabuni mkaa unaolinda mazingira, na kupunguza hewa chafu inayotokana na uchomaji mkaa wa miti ya asili."
            : "Mnyala was founded on a simple vision: transform agricultural biomass into high-value energy products. Witnessing alarming deforestation rates, we innovated a clean fuel that preserves living forests while eliminating hazardous smoke."}
        </p>
        <p>
          {isSw
            ? "Tunaendelea kuwekeza katika ubunifu, endelevu, na uzalishaji wa ubora. Bidhaa zetu sasa zinajumuisha mkaa safi, mbegu, na mbolea asilia — zote zikitokana na mti mmoja wa mbono."
            : "We continuously invest in circular economy innovations. Our current ecosystem delivers bio-charcoal, planting seeds, and bio-fertilizer from the same renewable tree."}
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
          <h3>{isSw ? "Dira Yetu (Mission)" : "Our Mission"}</h3>
          <p>
            {isSw
              ? "Kutengeneza bidhaa za nishati zinazolinda mazingira kutokana na matunda ya mbono, kupunguza ukataji wa miti, na kutoa ajira kwa jamii. Kulihudumia bara la Africa kwa nishati endelevu."
              : "Manufacture eco-friendly cooking energy from jatropha biomass, stop indigenous deforestation, generate green jobs, and serve Africa with clean sustainable solutions."}
          </p>
        </div>

        <div className="mission-card">
          <div className="flex items-center justify-center size-12 rounded-full bg-emerald-100 text-[#2d7a3e] mb-4">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h3>{isSw ? "Maono Yetu (Vision)" : "Our Vision"}</h3>
          <p>
            {isSw
              ? "Kuwa kinara barani Afrika katika nishati endelevu na ubunifu wa bidhaa rafiki kwa mazingira, kwa kujenga mustakabali salama, kijani na wenye manufaa kwa jamii na vizazi vijavyo."
              : "To lead Africa in renewable energy innovation and eco-friendly products, securing a green, prosperous future for generations to come."}
          </p>
        </div>
      </section>

      {/* =========================
           5. IMPACT SECTION
      ========================= */}
      <section className="impact">
        <h2>{isSw ? "Mchango Wetu kwa Mazingira" : "Our Environmental Impact"}</h2>
        <div className="impact-grid">
          <div>
            <h3>500+</h3>
            <p>{isSw ? "Tani za mkaa wa miti Zimeokolewa" : "Tons of Wood Charcoal Saved"}</p>
          </div>
          <div>
            <h3>1000+</h3>
            <p>{isSw ? "Wateja Wanaofurahia Bidhaa Zetu" : "Households & Businesses Served"}</p>
          </div>
          <div>
            <h3>50+</h3>
            <p>{isSw ? "Washirika wa Biashara na Kilimo" : "Commercial & Farm Partners"}</p>
          </div>
          <div>
            <h3>100%</h3>
            <p>{isSw ? "Bidhaa Zinazolinda Mazingira" : "Eco-Friendly Products"}</p>
          </div>
        </div>
      </section>

      {/* =========================
           6. CTA SECTION
      ========================= */}
      <section className="about-cta">
        <h2>
          {isSw
            ? "Jiunge Nasi Kutengeneza Mustakabali wa Kijani"
            : "Join Us in Building a Greener Future"}
        </h2>
        <p>
          {isSw
            ? "Chagua bidhaa zetu za nishati safi na usaidie kulinda misitu ya asili ya Tanzania."
            : "Choose our clean energy products and help preserve Tanzania's indigenous forests."}
        </p>
        <Link href="/wasiliana" className="btn inline-flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>{isSw ? "Wasiliana Nasi" : "Contact Us"}</span>
        </Link>
      </section>
    </>
  );
}
