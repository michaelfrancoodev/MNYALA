import Image from "next/image";
import Link from "next/link";
import { telLink, whatsappLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { PublicNav } from "./public-nav";

export function SiteHeader({ site, locale = "sw" }: { site: SiteSettings; locale?: Locale }) {
  const phoneHref = site.phone ? telLink(site.phone) : undefined;
  const whatsappHref = site.whatsapp ? whatsappLink(site.whatsapp, "Habari Mnyala, nahitaji bei na maelezo ya oda ya jumla na rejareja.") : undefined;
  const isSw = locale === "sw";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-surface shadow-2xs">
      {/* Top Utility Bar - Industrial / Trade Assurance */}
      <div className="border-b border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {isSw ? "Kiwanda Kikuu: Mbeya, Tanzania" : "Main Plant: Mbeya, Tanzania"}
            </span>
            <span className="hidden sm:inline-block text-slate-400">
              {isSw ? "Usambazaji Nchi Nzima (Dar, Arusha, Dodoma, Mwanza)" : "Nationwide Delivery (Dar, Arusha, Dodoma, Mwanza)"}
            </span>
            {site.phone ? (
              <a href={phoneHref} className="flex items-center gap-1.5 font-bold text-emerald-400 no-underline hover:text-emerald-300">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                {site.phone}
              </a>
            ) : null}
          </div>

          <div className="flex items-center gap-3.5">
            {site.hours ? <span className="hidden md:inline text-slate-400">{site.hours}</span> : null}
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      </div>

      {/* Main Commercial Header with Alibaba / Amazon Search */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 no-underline group shrink-0" aria-label="Mnyala Co. Ltd">
          <Image src="/brand/emblem.webp" alt="Mnyala" width={42} height={42} priority className="size-10 transition-transform group-hover:scale-105" />
          <div className="leading-tight">
            <span className="block text-2xl font-black tracking-tight text-ink">Mnyala</span>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted">
              {isSw ? "Kiwanda cha Nishati Safi" : "Clean Bio-Energy Plant"}
            </span>
          </div>
        </Link>

        {/* Alibaba / Amazon Search Bar */}
        <form action="/bidhaa" method="GET" className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="flex w-full items-center rounded-md border-2 border-slate-900 bg-surface overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-emerald-600">
            <span className="hidden lg:inline-block px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 border-r border-slate-300 shrink-0">
              {isSw ? "Bidhaa Zote" : "All Products"}
            </span>
            <input
              type="text"
              name="q"
              placeholder={isSw ? "Tafuta mkaa wa mbono, majiko ya kisasa, mbegu, mboji..." : "Search jatropha charcoal, stoves, seeds, bio-fertilizer..."}
              className="w-full px-3 py-2 text-xs font-medium text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              aria-label={isSw ? "Tafuta bidhaa" : "Search products"}
              className="flex items-center justify-center bg-slate-900 hover:bg-emerald-700 px-4 py-2.5 text-white transition-colors cursor-pointer"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-emerald-600 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors no-underline"
            >
              <svg className="size-4 text-emerald-700 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
              </svg>
              <span>{isSw ? "WhatsApp Kiwandani" : "WhatsApp Inquiry"}</span>
            </a>
          ) : null}

          <PublicNav phoneHref={phoneHref} whatsappHref={whatsappHref} locale={locale} />
        </div>
      </div>

      {/* Secondary B2B Quick Category Strip */}
      <div className="border-t border-line/80 bg-slate-50 py-2 px-4 sm:px-6 lg:px-8 text-xs font-bold text-slate-700">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-4 whitespace-nowrap">
            <Link href="/bidhaa" className="text-slate-900 hover:text-emerald-800 no-underline">
              {isSw ? "Katalogi Kamili" : "Full Catalog"}
            </Link>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <Link href="/bidhaa#mkaa-safi-wa-kisasa" className="text-slate-700 hover:text-emerald-800 no-underline">
              {isSw ? "Mkaa wa Mbono" : "Bio-Charcoal"}
            </Link>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <Link href="/bidhaa#majiko-ya-ufanisi" className="text-slate-700 hover:text-emerald-800 no-underline">
              {isSw ? "Majiko Sanifu" : "Clean Cookstoves"}
            </Link>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <Link href="/bidhaa#mbegu-za-mbono" className="text-slate-700 hover:text-emerald-800 no-underline">
              {isSw ? "Mbegu za Mbono" : "Jatropha Seeds"}
            </Link>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <Link href="/bidhaa#mboji-mbolea-asilia" className="text-slate-700 hover:text-emerald-800 no-underline">
              {isSw ? "Mbolea ya Mboji" : "Organic Fertilizer"}
            </Link>
            <span className="text-slate-300" aria-hidden="true">&bull;</span>
            <Link href="/#rfq" className="text-emerald-800 hover:text-emerald-950 font-black no-underline">
              {isSw ? "Maombi ya Nukuu (RFQ)" : "Request Bulk Quote"}
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-500 whitespace-nowrap">
            <span>{isSw ? "Uwezo wa Kiwanda: Tani 50+ kwa Mwezi" : "Factory Capacity: 50+ Tons/Month"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
