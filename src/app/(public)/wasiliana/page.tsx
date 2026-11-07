import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { PageHeading } from "@/components/public/page-heading";
import { buttonClasses } from "@/components/ui/button";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import { nowMs } from "@/lib/clock";
import { SUBJECT_FOR_CATEGORY } from "@/lib/validators/contact";
import { COMMON } from "@/messages/sw";
import { productForPrefill } from "@/server/actions/contact";
import { getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Wasiliana Nasi",
  description: "Tuma ujumbe, piga simu au tuandikie WhatsApp kuhusu mkaa safi, majiko, mbegu za mbono na mboji kutoka Mnyala Co. Ltd, Mbeya.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ bidhaa?: string }> }) {
  const { bidhaa } = await searchParams;
  const [site, product] = await Promise.all([getSiteSettings(), productForPrefill(bidhaa)]);

  const defaults = {
    subject: product ? SUBJECT_FOR_CATEGORY[product.category] : ("" as const),
    message: product ? `Habari, nahitaji kujua bei na utaratibu wa kuagiza ${product.name}.` : "",
    product: product?.slug ?? "",
  };

  return (
    <>
      <PageHeading eyebrow="Mawasiliano" title="Tuko Tayari Kukuhudumia">
        <p>
          Una swali, unahitaji bei ya jumla au rejareja, au unataka kuwa msambazaji wa bidhaa zetu? Tuandikie ujumbe hapa chini,
          tupigie simu, au tuandikie moja kwa moja kupitia WhatsApp.
        </p>
      </PageHeading>

      <section className="bg-paper py-12 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Main Form Card */}
          <div className="rounded-3xl border border-line bg-surface p-7 sm:p-10 shadow-xs">
            <div className="border-b border-line/80 pb-5 mb-7">
              <h2 className="text-2xl font-extrabold text-ink">Tuma Ujumbe wa Moja kwa Moja</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Jaza fomu hii fupi. Ujumbe wako utafika moja kwa moja kwa wasimamizi wetu na utajibiwa haraka.
              </p>
            </div>
            <ContactForm defaults={defaults} renderedAt={nowMs()} />
          </div>

          {/* Direct Contact Sidebar Card */}
          <aside className="space-y-6">
            <div className="rounded-3xl border border-line bg-surface p-7 sm:p-8 shadow-xs">
              <h2 className="text-xl font-bold text-ink border-b border-line/80 pb-3">Njia za Haraka</h2>
              <dl className="mt-5 space-y-5">
                {site.phone ? (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                      <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      Simu ya Huduma
                    </dt>
                    <dd className="mt-1 text-base font-bold text-ink">
                      <a href={telLink(site.phone)} className="hover:underline text-brand-dark">
                        {site.phone}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {site.email ? (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                      <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      Barua Pepe Rasmi
                    </dt>
                    <dd className="mt-1 text-base font-medium text-ink">
                      <a href={mailtoLink(site.email)} className="hover:underline text-brand-dark">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                ) : null}

                {site.address ? (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                      <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Eneo la Kiwanda & Ofisi
                    </dt>
                    <dd className="mt-1 text-sm text-ink-soft leading-relaxed">{site.address}</dd>
                  </div>
                ) : null}

                {site.hours ? (
                  <div>
                    <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted">
                      <svg className="size-4 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Muda wa Kazi
                    </dt>
                    <dd className="mt-1 text-sm text-ink-soft">{site.hours}</dd>
                  </div>
                ) : null}
              </dl>

              {site.whatsapp ? (
                <div className="mt-6 border-t border-line/80 pt-5">
                  <a
                    href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji msaada wa haraka kuhusu bidhaa zenu.")}
                    className={buttonClasses("primary", "md", "w-full bg-emerald-600 hover:bg-emerald-700 border-transparent text-white")}
                  >
                    <span>{COMMON.whatsapp}</span>
                  </a>
                </div>
              ) : null}
            </div>

            {/* Quick Promise Banner */}
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <svg className="size-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
                Uhakika wa Huduma
              </div>
              <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                Tunajibu maswali na maombi yote ndani ya saa 2 za kazi. Kwa dharura au oda ya siku hiyo hiyo, tafadhali piga simu moja kwa moja.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
