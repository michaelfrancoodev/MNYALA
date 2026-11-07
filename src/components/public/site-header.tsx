import Image from "next/image";
import Link from "next/link";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PublicNav } from "./public-nav";

export function SiteHeader({ site, locale = "sw" }: { site: SiteSettings; locale?: Locale }) {
  const phoneHref = site.phone ? telLink(site.phone) : undefined;
  const whatsappHref = site.whatsapp ? whatsappLink(site.whatsapp) : undefined;
  const isSw = locale === "sw";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface/95 backdrop-blur-md shadow-2xs">
      {/* Top Utility Bar */}
      <div className="border-b border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-2 text-xs sm:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Mbeya, Tanzania
            </span>
            {site.phone ? (
              <a href={phoneHref} className="flex items-center gap-1.5 font-semibold text-white no-underline hover:text-emerald-300">
                <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {site.phone}
              </a>
            ) : null}
            {site.email ? (
              <a href={mailtoLink(site.email)} className="hidden text-slate-300 no-underline hover:text-white sm:inline">
                {site.email}
              </a>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            {site.hours ? <p className="hidden md:block text-slate-400">{site.hours}</p> : null}
            {/* Topbar Language Switcher */}
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="flex items-center gap-3.5 no-underline group" aria-label="Mnyala Co. Ltd">
          <Image src="/brand/emblem.webp" alt="Mnyala" width={44} height={44} priority className="size-11 transition-transform group-hover:scale-105" />
          <span className="leading-tight">
            <span className="block text-2xl font-extrabold tracking-tight text-ink">Mnyala</span>
            <span className="block whitespace-nowrap text-[11px] font-bold uppercase tracking-wider text-muted">
              {isSw ? "Nishati Safi • Mbeya" : "Clean Energy • Mbeya"}
            </span>
          </span>
        </Link>
        <PublicNav phoneHref={phoneHref} whatsappHref={whatsappHref} locale={locale} />
      </div>
    </header>
  );
}
