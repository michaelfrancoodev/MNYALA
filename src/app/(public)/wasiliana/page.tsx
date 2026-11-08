import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/contact-form";
import { mailtoLink, telLink } from "@/lib/contact-links";
import { nowMs } from "@/lib/clock";
import { SUBJECT_FOR_CATEGORY } from "@/lib/validators/contact";
import { productForPrefill } from "@/server/actions/contact";
import { getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Wasiliana Nasi | Mnyala Co. Ltd",
  description:
    "Wasiliana na Mnyala Co. Ltd kuhusu mkaa safi, majiko ya kisasa, mbegu za mbono na mbolea asilia Mbeya, Tanzania.",
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ bidhaa?: string }>;
}) {
  const { bidhaa } = await searchParams;
  const [site, product] = await Promise.all([
    getSiteSettings(),
    productForPrefill(bidhaa),
  ]);

  const phone = site.phone || "+255 758 730 108";
  const email = site.email || "info@mnyala.co.tz";
  const address = site.address || "Mbeya, Tanzania";

  const defaults = {
    subject: product ? SUBJECT_FOR_CATEGORY[product.category] : ("" as const),
    message: product ? `Habari, nahitaji kujua zaidi kuhusu ${product.name}.` : "",
    product: product?.slug ?? "",
  };

  return (
    <>
      {/* =====================================
              1. CONTACT HERO
      ====================================== */}
      <section className="contact-hero">
        <div className="contact-overlay">
          <span>WASILIANA NASI</span>
          <h1>Tuwasiliane Kuhusu Nishati Safi</h1>
          <p>
            Tuko tayari kujibu maswali yako, kupokea ushauri au maoni na kukupa bidhaa bora za mkaa safi, majiko, mbegu na mbolea asilia.
          </p>
        </div>
      </section>

      {/* =====================================
              2. CONTACT INFO CARDS
      ====================================== */}
      <section className="contact-info">
        <div className="section-title">
          <span className="section-tag">TUFIKIE</span>
          <h2>Tuko Hapa Kukusaidia</h2>
          <p>
            Wasiliana nasi kupitia njia yoyote hapa chini au tutumie fomu ya mawasiliano.
          </p>
        </div>

        <div className="contact-grid">
          {/* Address */}
          <div className="contact-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3>Anwani ya Ofisi</h3>
            <p>
              Mnyala Co. Ltd<br />
              {address}
            </p>
          </div>

          {/* Phone */}
          <div className="contact-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </div>
            <h3>Simu</h3>
            <p>
              <a href={telLink(phone)} className="text-slate-800 hover:text-[#2d7a3e] font-semibold no-underline">
                {phone}
              </a>
            </p>
          </div>

          {/* Email */}
          <div className="contact-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3>Barua Pepe</h3>
            <p>
              <a href={mailtoLink(email)} className="text-slate-800 hover:text-[#2d7a3e] font-semibold no-underline">
                {email}
              </a>
            </p>
          </div>

          {/* Hours */}
          <div className="contact-card">
            <div className="flex justify-center mb-3 text-[#2d7a3e]">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3>Masaa ya Kazi</h3>
            <p>
              {site.hours || "Jumatatu - Jumamosi\n8:00 AM - 5:00 PM"}
            </p>
          </div>
        </div>
      </section>

      {/* =====================================
              3. CONTACT FORM SECTION
      ====================================== */}
      <section className="contact-form-section">
        <div className="contact-container">
          {/* Left Text */}
          <div className="contact-text">
            <span>TUMA UJUMBE</span>
            <h2>Tungependa Kusikia Kutoka Kwako</h2>
            <p>
              Iwe unahitaji mkaa kwa ajili ya nyumba yako, unataka kuwa msambazaji, ushauri au una swali kuhusu majiko yetu, mbegu, au mbolea. Timu yetu iko tayari kukusaidia.
            </p>
            <ul>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Majibu ya Haraka</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Usaidizi wa Kitaalamu</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>Huduma ya Kuaminika</span>
              </li>
            </ul>
          </div>

          {/* Right Form (Directly Connected to Admin Database) */}
          <div className="contact-form rounded-2xl bg-white p-6 shadow-md border border-slate-200">
            <ContactForm defaults={defaults} renderedAt={nowMs()} />
          </div>
        </div>
      </section>

      {/* =====================================
              4. LOCATION CARD (Self-Contained, No External Trackers)
      ====================================== */}
      <section className="contact-map py-14">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">MAHALI TULIPO</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Tembelea Ofisi na Kiwanda Chetu
          </h2>
        </div>
        <div className="max-w-5xl mx-auto px-4">
          <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200 bg-[#0f3d2e] text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#4ade80]">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Makao Makuu na Kiwanda</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white">Mnyala Co. Ltd — {address}</h3>
              <p className="text-sm text-white/85 max-w-xl">
                Karibu kiwandani kwetu Mbeya kuona uzalishaji wa mkaa safi wa mbono, majiko ya ufanisi, mbegu bora na mbolea asilia ya mboji.
              </p>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Mbeya,Tanzania"
              target="_blank"
              rel="noopener noreferrer"
              className="btn shrink-0 inline-flex items-center gap-2"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" x2="9" y1="3" y2="18" />
                <line x1="15" x2="15" y1="6" y2="21" />
              </svg>
              <span>Fungua Ramani (Google Maps)</span>
            </a>
          </div>
        </div>
      </section>

      {/* =====================================
              5. CALL TO ACTION
      ====================================== */}
      <section className="contact-cta">
        <h2>Tayari Kufanya Kazi na Mnyala?</h2>
        <p>
          Wasiliana nasi leo na tuunde mustakabali wa kijani pamoja.
        </p>
        <Link href="/bidhaa" className="btn inline-flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span>Angalia Bidhaa</span>
        </Link>
      </section>
    </>
  );
}
