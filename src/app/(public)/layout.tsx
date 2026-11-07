import type { Metadata } from "next";
import { SiteFooter } from "@/components/public/site-footer";
import { SiteHeader } from "@/components/public/site-header";
import { WhatsAppButton } from "@/components/public/whatsapp-button";
import { getEnv } from "@/lib/env";
import { COMMON } from "@/messages/sw";
import { getSiteSettings } from "@/server/services/site";

// Pages read the database on every request, so they are never built without one.
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(getEnv().APP_URL),
    openGraph: { siteName: "Mnyala Co. Ltd", locale: "sw_TZ", type: "website", images: [{ url: "/og.png", width: 1200, height: 630 }] },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const site = await getSiteSettings();
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-surface px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        {COMMON.skip}
      </a>
      <SiteHeader site={site} />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter site={site} />
      <WhatsAppButton number={site.whatsapp} />
    </>
  );
}
