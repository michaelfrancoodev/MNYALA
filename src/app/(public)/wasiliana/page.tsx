import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/public/contact-form";
import { mailtoLink, telLink } from "@/lib/contact-links";
import { nowMs } from "@/lib/clock";
import { SUBJECT_FOR_CATEGORY } from "@/lib/validators/contact";
import { getLocale } from "@/messages/i18n";
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
  const [site, product, locale] = await Promise.all([
    getSiteSettings(),
    productForPrefill(bidhaa),
    getLocale(),
  ]);

  const isSw = locale === "sw";
  const phone = site.phone || "+255 758 730 108";
  const email = site.email || "info@mnyala.co.tz";
  const address = site.address || "Mbeya, Tanzania";

  const defaults = {
    subject: product ? SUBJECT_FOR_CATEGORY[product.category] : ("" as const),
    message: product ? `Habari, nahitaji kujua bei na utaratibu wa kuagiza ${product.name}.` : "",
    product: product?.slug ?? "",
  };

  return (
    <>
      {/* =====================================
              1. CONTACT HERO
      ====================================== */}
      <section className="contact-hero">
        <div className="contact-overlay">
          <span>{isSw ? "WASILIANA NASI" : "CONTACT US"}</span>
          <h1>{isSw ? "Tuwasiliane Kuhusu Nishati Safi" : "Get In Touch About Clean Energy"}</h1>
          <p>
            {isSw
              ? "Tuko tayari kujibu maswali yako, kupokea ushauri au maoni na kukupa bidhaa bora za mkaa safi, majiko, mbegu na mbolea asilia."
              : "We are ready to assist you with orders, feedback, and supply of bio-charcoal, cookstoves, seeds, and organic fertilizer."}
          </p>
        </div>
      </section>

      {/* =====================================
              2. CONTACT INFO CARDS
      ====================================== */}
      <section className="contact-info">
        <div className="section-title">
          <span className="section-tag">{isSw ? "TUFIKIE" : "REACH US"}</span>
          <h2>{isSw ? "Tuko Hapa Kukusaidia" : "We Are Here To Help"}</h2>
          <p>
            {isSw
              ? "Wasiliana nasi kupitia njia yoyote hapa chini au tutumie fomu ya mawasiliano."
              : "Connect with us through any channel below or submit an inquiry using our direct message form."}
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
            <h3>{isSw ? "Anwani ya Ofisi" : "Office Address"}</h3>
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
            <h3>{isSw ? "Simu" : "Phone"}</h3>
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
            <h3>{isSw ? "Barua Pepe" : "Email"}</h3>
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
            <h3>{isSw ? "Masaa ya Kazi" : "Working Hours"}</h3>
            <p>
              {site.hours || (isSw ? "Jumatatu - Jumamosi\n8:00 AM - 5:00 PM" : "Monday - Saturday\n8:00 AM - 5:00 PM")}
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
            <span>{isSw ? "TUMA UJUMBE" : "SEND MESSAGE"}</span>
            <h2>{isSw ? "Tungependa Kusikia Kutoka Kwako" : "We Would Love To Hear From You"}</h2>
            <p>
              {isSw
                ? "Iwe unahitaji mkaa kwa ajili ya nyumba yako, unataka kuwa msambazaji, ushauri au una swali kuhusu majiko yetu, mbegu, au mbolea. Timu yetu iko tayari kukusaidia."
                : "Whether you need household charcoal, wholesale distribution, agroforestry advice, or have questions regarding our clean cookstoves, our plant team is ready."}
            </p>
            <ul>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{isSw ? "Majibu ya Haraka" : "Prompt Response"}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{isSw ? "Usaidizi wa Kitaalamu" : "Expert Factory Guidance"}</span>
              </li>
              <li className="flex items-center gap-2">
                <svg className="size-4 shrink-0 text-[#2d7a3e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                <span>{isSw ? "Huduma ya Kuaminika" : "Trusted Nationwide Service"}</span>
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
              4. GOOGLE MAP
      ====================================== */}
      <section className="contact-map py-14">
        <div className="section-title text-center max-w-xl mx-auto mb-8">
          <span className="section-tag">{isSw ? "MAHALI TULIPO" : "OUR LOCATION"}</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            {isSw ? "Tembelea Ofisi Yetu" : "Visit Our Plant"}
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-4">
          <div className="overflow-hidden rounded-2xl shadow-md border border-slate-200">
            <iframe
              src="https://www.google.com/maps?q=Mbeya,Tanzania&output=embed"
              loading="lazy"
              allowFullScreen
              className="w-full h-[400px] border-0"
              title="Mnyala Co. Ltd Mbeya Map"
            />
          </div>
        </div>
      </section>

      {/* =====================================
              5. CALL TO ACTION
      ====================================== */}
      <section className="contact-cta">
        <h2>
          {isSw ? "Tayari Kufanya Kazi na Mnyala?" : "Ready To Partner With Mnyala?"}
        </h2>
        <p>
          {isSw
            ? "Wasiliana nasi leo na tuunde mustakabali wa kijani pamoja."
            : "Connect with us today and let us build a sustainable green future together."}
        </p>
        <Link href="/bidhaa" className="btn inline-flex items-center gap-2">
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span>{isSw ? "Angalia Bidhaa" : "View Products"}</span>
        </Link>
      </section>
    </>
  );
}
