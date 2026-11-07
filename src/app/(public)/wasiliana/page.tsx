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
  title: "Wasiliana nasi",
  description: "Tuma ujumbe, piga simu au tuandikie WhatsApp kuhusu mkaa, majiko, mbegu za mbono na mboji.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ bidhaa?: string }> }) {
  const { bidhaa } = await searchParams;
  const [site, product] = await Promise.all([getSiteSettings(), productForPrefill(bidhaa)]);

  const defaults = {
    subject: product ? SUBJECT_FOR_CATEGORY[product.category] : ("" as const),
    message: product ? `Habari, nahitaji kujua zaidi kuhusu ${product.name}.` : "",
    product: product?.slug ?? "",
  };

  return (
    <>
      <PageHeading eyebrow="Wasiliana nasi" title="Tuko tayari kukujibu">
        <p>
          Una swali, unahitaji bei, au unataka kuwa msambazaji? Tuandikie, tupigie simu au tuma ujumbe hapa chini. Tutakujibu.
        </p>
      </PageHeading>

      <section>
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="text-3xl font-semibold">Tuma ujumbe</h2>
            <p className="mt-2 max-w-prose text-ink-soft">
              Iwe unahitaji mkaa wa nyumbani, unataka kuwa msambazaji, au una swali kuhusu majiko, mbegu au mbolea, andika hapa.
            </p>
            <div className="mt-8">
              <ContactForm defaults={defaults} renderedAt={nowMs()} />
            </div>
          </div>

          <aside className="lg:border-l lg:border-line lg:pl-12">
            <h2 className="text-2xl font-semibold">Mawasiliano ya moja kwa moja</h2>
            <dl className="mt-6 space-y-5">
              {site.address ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted">Anwani</dt>
                  <dd className="mt-1 text-lg">{site.address}</dd>
                </div>
              ) : null}
              {site.phone ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted">Simu</dt>
                  <dd className="mt-1 text-lg">
                    <a href={telLink(site.phone)} className="font-semibold">
                      {site.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {site.email ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted">Barua pepe</dt>
                  <dd className="mt-1 text-lg">
                    <a href={mailtoLink(site.email)} className="font-semibold">
                      {site.email}
                    </a>
                  </dd>
                </div>
              ) : null}
              {site.hours ? (
                <div>
                  <dt className="text-sm font-semibold uppercase tracking-wider text-muted">Masaa ya kazi</dt>
                  <dd className="mt-1 text-lg">{site.hours}</dd>
                </div>
              ) : null}
            </dl>
            {site.whatsapp ? (
              <p className="mt-8">
                <a href={whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji msaada.")} className={buttonClasses("secondary")}>
                  {COMMON.whatsapp}
                </a>
              </p>
            ) : null}
          </aside>
        </div>
      </section>
    </>
  );
}
