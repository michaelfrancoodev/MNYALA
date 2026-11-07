import Link from "next/link";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { buttonClasses } from "@/components/ui/button";
import { COMMON } from "@/messages/sw";
import { getSiteSettings, type SiteSettings } from "@/server/services/site";

export const dynamic = "force-dynamic";

async function settingsOrEmpty(): Promise<SiteSettings> {
  try {
    return await getSiteSettings();
  } catch {
    return { stats: [] };
  }
}

/** For any address that does not exist. It never links to the admin. */
export default async function NotFound() {
  const site = await settingsOrEmpty();
  return (
    <>
      <SiteHeader site={site} />
      <main id="main" className="mx-auto max-w-2xl px-5 py-20 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-ember">404</p>
        <h1 className="mt-2 text-4xl font-semibold">{COMMON.notFoundTitle}</h1>
        <p className="mt-4 text-lg text-ink-soft">{COMMON.notFoundText}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className={buttonClasses("primary")}>
            {COMMON.backHome}
          </Link>
          <Link href="/bidhaa" className={buttonClasses("secondary")}>
            {COMMON.seeProducts}
          </Link>
        </div>
      </main>
      <SiteFooter site={site} />
    </>
  );
}
