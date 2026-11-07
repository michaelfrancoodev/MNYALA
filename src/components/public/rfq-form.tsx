"use client";

import { useActionState, useRef, useState } from "react";
import { submitContactAction } from "@/server/actions/contact";
import { whatsappLink } from "@/lib/contact-links";
import type { Locale } from "@/messages/i18n";

export function RfqForm({
  whatsapp,
  locale = "sw",
  renderedAt = 0,
}: {
  whatsapp?: string;
  locale?: Locale;
  renderedAt?: number;
}) {
  const isSw = locale === "sw";
  const [state, formAction, isPending] = useActionState(submitContactAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  const [selectedProduct, setSelectedProduct] = useState("mkaa-safi-wa-kisasa");
  const [volume, setVolume] = useState("Mifuko 50 ya 25kg");
  const [city, setCity] = useState("Dar es Salaam");

  const generatedNotes = isSw
    ? `Huu ni ombi rasmi la nukuu ya bei (RFQ):\n- Bidhaa: ${selectedProduct}\n- Kiasi kinachohitajika: ${volume}\n- Eneo la kuwasilisha: ${city}\n- Tafadhali tuma ankara rasmi ya bei (Proforma Invoice) yenye gharama za usafirishaji na risiti ya EFD.`
    : `This is a formal Request for Quotation (RFQ):\n- Product: ${selectedProduct}\n- Required Volume: ${volume}\n- Destination: ${city}\n- Please send formal proforma invoice with freight breakdown and TRA EFD compliance.`;

  return (
    <div id="rfq" className="scroll-mt-14 rounded-lg border-2 border-slate-900 bg-surface p-6 sm:p-10 shadow-md">
      <div className="border-b border-line pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
            {isSw ? "Soko la Jumla • B2B RFQ Hub" : "Wholesale Market • B2B RFQ Hub"}
          </span>
          <span className="text-xs font-bold text-emerald-800">
            {isSw ? "Majibu Ndani ya Saa 2 za Kazi" : "Responses within 2 business hours"}
          </span>
        </div>
        <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl tracking-tight">
          {isSw ? "Omba Nukuu ya Bei ya Jumla (Request for Quotation)" : "Request a Formal Wholesale Quotation (RFQ)"}
        </h2>
        <p className="mt-1.5 text-sm text-ink-soft max-w-3xl">
          {isSw
            ? "Kwa ajili ya shule za bweni, hoteli, migahawa, wafugaji wa kuku, taasisi na wasambazaji wa mikoani. Jaza fomu hii kupata ankara rasmi (Proforma Invoice) yenye punguzo la kiwandani na makadirio ya usafirishaji."
            : "For boarding schools, hotels, commercial grills, poultry farms, institutions and upcountry distributors. Fill this form for a formal proforma invoice with direct factory wholesale discounts."}
        </p>
      </div>

      {state?.ok ? (
        <div className="mt-6 rounded-md border border-emerald-300 bg-emerald-50 p-6">
          <div className="flex items-start gap-3">
            <svg className="size-6 text-emerald-700 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950">
                {isSw ? "Ombi Lako la Nukuu Limepokelewa Kiwandani!" : "Your Quotation Request has been received!"}
              </h3>
              <p className="mt-1 text-sm text-emerald-900">
                {isSw
                  ? "Meneja wetu wa mauzo ya jumla anakagua kiasi ulichoomba na atakupigia simu au kukutumia ankara rasmi hivi punde."
                  : "Our wholesale sales manager is reviewing your requested volume and will contact you shortly with the formal proforma invoice."}
              </p>
              {whatsapp ? (
                <div className="mt-4">
                  <a
                    href={whatsappLink(whatsapp, `Habari Mnyala, nimekamilisha kujaza ombi la nukuu ya bei ya jumla tovuti (RFQ). Naomba ufafanuzi wa haraka.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 transition-colors no-underline"
                  >
                    <span>{isSw ? "Fuatilia Haraka Kupitia WhatsApp" : "Fast-track via WhatsApp Hotline"}</span>
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : (
        <form ref={formRef} action={formAction} className="mt-6 space-y-5">
          {/* Anti-spam honeypot & render time */}
          <div className="hidden" aria-hidden="true">
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
            <input type="hidden" name="t" value={renderedAt} />
            <input type="hidden" name="subject" value="RFQ - Maombi ya Nukuu ya Bei ya Jumla" />
          </div>

          {state?.ok === false && state.message ? (
            <div className="rounded border border-red-300 bg-red-50 p-3 text-xs font-bold text-red-900">
              {state.message}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label htmlFor="rfq-fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Jina Kamili / Jina la Taasisi *" : "Full Name / Institution *"}
              </label>
              <input
                id="rfq-fullname"
                type="text"
                name="fullName"
                required
                defaultValue={state?.values?.fullName ?? ""}
                placeholder={isSw ? "Mfano: Shule ya Iyunga au John Mwita" : "e.g. Iyunga Secondary School"}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rfq-phone" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Namba ya Simu / WhatsApp *" : "Phone / WhatsApp Number *"}
              </label>
              <input
                id="rfq-phone"
                type="tel"
                name="phone"
                required
                defaultValue={state?.values?.phone ?? ""}
                placeholder="0758 730 108"
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rfq-email" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Barua Pepe (Email)" : "Email Address"}
              </label>
              <input
                id="rfq-email"
                type="email"
                name="email"
                defaultValue={state?.values?.email ?? ""}
                placeholder="info@kampuni.co.tz"
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="rfq-product" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Bidhaa Kuu *" : "Product Category *"}
              </label>
              <select
                id="rfq-product"
                name="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              >
                <option value="mkaa-safi-wa-kisasa">{isSw ? "Mkaa wa Mbono (Briquettes) 25kg" : "Bio-Charcoal (25kg Bags)"}</option>
                <option value="majiko-ya-ufanisi">{isSw ? "Majiko ya Ufanisi (Cookstoves)" : "Clean Biomass Cookstoves"}</option>
                <option value="mbegu-za-mbono">{isSw ? "Mbegu Bora za Mbono (Seeds)" : "Jatropha Curcas Seeds"}</option>
                <option value="mboji-mbolea-asilia">{isSw ? "Mbolea Asilia ya Mboji (Compost)" : "Organic Bio-Fertilizer"}</option>
              </select>
            </div>

            <div>
              <label htmlFor="rfq-volume" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Kiasi Kinachohitajika *" : "Required Volume *"}
              </label>
              <input
                id="rfq-volume"
                type="text"
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                placeholder={isSw ? "Mfano: Mifuko 100, Tani 5, Majiko 20" : "e.g. 100 bags, 5 tons"}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="rfq-city" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                {isSw ? "Mkoa / Wilaya ya Kupokelea *" : "Delivery Destination *"}
              </label>
              <input
                id="rfq-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={isSw ? "Dar es Salaam, Mbeya, Dodoma..." : "Dar es Salaam, Mbeya..."}
                className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-bold text-ink focus:border-emerald-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rfq-message" className="block text-xs font-bold uppercase tracking-wider text-slate-800">
              {isSw ? "Maelezo ya Ziada ya Mradi / Ujumbe Rasmi *" : "Project Requirements & Official Notes *"}
            </label>
            <textarea
              id="rfq-message"
              name="message"
              rows={3}
              required
              defaultValue={generatedNotes}
              className="mt-1 w-full rounded border border-line bg-paper px-3 py-2 text-xs font-medium text-ink focus:border-emerald-700 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line/80 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <svg className="size-4 text-emerald-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{isSw ? "Uhakika wa Risiti ya TRA EFD & Usafirishaji Nchi Nzima" : "TRA EFD Invoice & Nationwide Freight Assurance"}</span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded bg-slate-900 hover:bg-emerald-800 px-6 py-2.5 text-xs font-black uppercase tracking-wider text-white transition-colors disabled:opacity-60 cursor-pointer shadow-sm"
            >
              <span>{isPending ? (isSw ? "Inatuma Ombi..." : "Submitting...") : (isSw ? "Tuma Maombi ya Nukuu (Submit RFQ)" : "Submit Quotation Request")}</span>
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
