import type { Metadata } from "next";
import { PageHeading } from "@/components/public/page-heading";
import { mailtoLink } from "@/lib/contact-links";
import { getSiteSettings } from "@/server/services/site";

export const metadata: Metadata = {
  title: "Faragha",
  description: "Jinsi Mnyala Co. Ltd inavyotumia taarifa unazotuma kupitia tovuti hii.",
};

export default async function PrivacyPage() {
  const site = await getSiteSettings();
  return (
    <>
      <PageHeading eyebrow="Faragha" title="Taarifa zako na jinsi tunavyozitumia" />
      <section>
        <div className="mx-auto max-w-3xl space-y-8 px-5 py-12 text-lg sm:px-8">
          <div>
            <h2 className="text-2xl font-semibold">Tunachokusanya</h2>
            <p className="mt-2">
              Unapotuma ujumbe kupitia fomu ya mawasiliano, tunapokea jina lako, barua pepe, namba ya simu (si lazima), kichwa
              cha ujumbe na ujumbe wenyewe. Ili kulinda tovuti dhidi ya ujumbe wa kero (spam), tunaweza pia kuweka kwa muda
              mfupi anwani ya mtandao (IP) ya kifaa chako.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Tunavyotumia</h2>
            <p className="mt-2">
              Tunatumia taarifa hizi kukujibu na kushughulikia maombi yako ya bidhaa. Hatuziuzi na hatuzitoi kwa makampuni
              mengine kwa matangazo.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Vidakuzi (cookies)</h2>
            <p className="mt-2">Kurasa za umma za tovuti hii hazitumii vidakuzi vya ufuatiliaji wala matangazo.</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Kuomba kufutiwa taarifa</h2>
            <p className="mt-2">
              Unaweza kuomba tufute au tukupe nakala ya taarifa ulizotutumia
              {site.email ? (
                <>
                  {" "}
                  kwa kuandika kwa{" "}
                  <a href={mailtoLink(site.email, "Ombi kuhusu taarifa zangu")} className="font-semibold">
                    {site.email}
                  </a>
                </>
              ) : null}
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
