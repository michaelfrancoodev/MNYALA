import Image from "next/image";
import Link from "next/link";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import { PublicNav } from "./public-nav";

export function SiteHeader({ site }: { site: SiteSettings }) {
  const phoneHref = site.phone ? telLink(site.phone) : undefined;
  const whatsappHref = site.whatsapp ? whatsappLink(site.whatsapp) : undefined;
  return (
    <header className="border-b border-line bg-paper">
      {(site.phone || site.email) && (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-1.5 text-sm text-ink-soft sm:px-8">
            <p className="flex flex-wrap gap-x-5 gap-y-0.5">
              {site.phone ? (
                <a href={phoneHref} className="font-semibold text-ink no-underline hover:underline">
                  {site.phone}
                </a>
              ) : null}
              {site.email ? (
                <a href={mailtoLink(site.email)} className="hidden text-ink-soft no-underline hover:underline sm:inline">
                  {site.email}
                </a>
              ) : null}
            </p>
            {site.hours ? <p className="hidden md:block">{site.hours}</p> : null}
          </div>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="flex items-center gap-3 no-underline" aria-label="Mnyala Co. Ltd, mwanzo">
          <Image src="/brand/emblem.webp" alt="" width={44} height={44} priority className="size-11" />
          <span className="leading-tight">
            <span className="block font-serif text-2xl font-semibold text-brand-dark">Mnyala</span>
            <span className="block whitespace-nowrap text-xs font-semibold uppercase tracking-wider text-muted">Co. Ltd, Mbeya</span>
          </span>
        </Link>
        <PublicNav phoneHref={phoneHref} whatsappHref={whatsappHref} />
      </div>
    </header>
  );
}
