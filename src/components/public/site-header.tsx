"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { telLink, mailtoLink, whatsappLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import type { Locale } from "@/messages/i18n";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

export function SiteHeader({ site, locale = "sw" }: { site: SiteSettings; locale?: Locale }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isSw = locale === "sw";

  const phone = site.phone || "+255 758 730 108";
  const email = site.email || "info@mnyala.co.tz";
  const address = site.address || "Mbeya, Tanzania";
  const whatsapp = site.whatsapp || "+255758730108";

  const navLinks: Array<{ href: Route; label: string }> = [
    { href: "/", label: isSw ? "Mwanzo" : "Home" },
    { href: "/kuhusu", label: isSw ? "Kuhusu Sisi" : "About Us" },
    { href: "/bidhaa", label: isSw ? "Bidhaa Zetu" : "Our Products" },
    { href: "/picha", label: isSw ? "Picha & Kiwanda" : "Gallery" },
    { href: "/wasiliana", label: isSw ? "Wasiliana Nasi" : "Contact Us" },
  ];

  return (
    <header className="w-full relative z-50 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT / CONTACT BAR */}
      <div className="bg-[#121c29] text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <a
              href={telLink(phone)}
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <svg className="size-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{phone}</span>
            </a>

            <a
              href={mailtoLink(email)}
              className="hidden md:flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
            >
              <svg className="size-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>{email}</span>
            </a>

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <svg className="size-3.5 text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{address}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <span className="hidden lg:inline text-[11px] text-emerald-400 font-semibold tracking-wide">
              {isSw ? "Nishati Safi ya Asili • Mbeya, Tanzania" : "Clean Renewable Biomass • Mbeya, Tanzania"}
            </span>
            <span className="hidden lg:inline text-slate-600">|</span>
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      </div>

      {/* 2. MAIN BRAND HEADER (SINGLE MNYALA LOGO) */}
      <div className="bg-[#0f3d2e] text-white py-4 px-4 sm:px-6 lg:px-8 border-b border-emerald-900/60">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          {/* Brand Identity: Single Mnyala Logo + Typography */}
          <Link href="/" className="flex items-center gap-3.5 sm:gap-4 group no-underline text-white">
            <div className="relative size-14 sm:size-16 shrink-0 rounded-full bg-white p-1 shadow-md border-2 border-emerald-400/80 transition-transform group-hover:scale-105">
              <Image
                src="/original/logo.png"
                alt="Mnyala Co. Ltd Logo"
                fill
                sizes="64px"
                priority
                className="object-contain p-1 rounded-full"
              />
            </div>
            <div>
              <span className="block text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-emerald-300">
                {isSw ? "Suluhisho Endelevu la Nishati" : "Sustainable Energy Solutions"}
              </span>
              <span className="block text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight">
                MNYALA CO. LTD
              </span>
              <span className="hidden sm:block text-[11px] text-slate-200 font-normal">
                {isSw
                  ? "Mkaa Safi wa Kisasa • Majiko ya Ufanisi • Mbegu za Mbono • Mboji"
                  : "Eco-Friendly Charcoal • Biomass Stoves • Jatropha Seeds • Organic Compost"}
              </span>
            </div>
          </Link>

          {/* Quick Actions & Fast Order on Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                {isSw ? "Simu ya Kiwandani" : "Factory Hotline"}
              </p>
              <a
                href={telLink(phone)}
                className="text-base font-black text-emerald-300 hover:text-white transition-colors"
              >
                {phone}
              </a>
            </div>

            <a
              href={whatsappLink(whatsapp, isSw ? "Habari Mnyala Co. Ltd! Ninahitaji maelezo na kuagiza bidhaa." : "Hello Mnyala Co. Ltd! I would like to order products.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 text-xs sm:text-sm shadow-md transition-transform hover:-translate-y-0.5"
            >
              <svg className="size-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06s-1.05-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29" />
              </svg>
              <span>{isSw ? "Agiza WhatsApp" : "Order via WhatsApp"}</span>
            </a>
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg bg-emerald-900/80 text-white hover:bg-emerald-800 transition-colors"
              aria-label={menuOpen ? "Funga Menyu" : "Fungua Menyu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="4" x2="20" y1="12" y2="12" />
                  <line x1="4" x2="20" y1="6" y2="6" />
                  <line x1="4" x2="20" y1="18" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. DESKTOP NAVIGATION BAR */}
      <nav className="hidden md:block bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-1 list-none m-0 p-0">
            {navLinks.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`inline-block py-3.5 px-4 text-sm font-bold tracking-wide transition-all border-b-2 ${
                      active
                        ? "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                        : "border-transparent text-slate-700 hover:text-emerald-700 hover:border-slate-300"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="ml-auto py-2">
              <Link
                href="/bidhaa"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-4 py-1.5 transition-colors"
              >
                <span>{isSw ? "Orodha Kamili ya Bidhaa" : "Explore All Products"}</span>
                <span>&rarr;</span>
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* 4. RESPONSIVE MOBILE DRAWER */}
      {menuOpen ? (
        <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 py-6 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <ul className="space-y-1 list-none m-0 p-0 mb-6">
            {navLinks.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 px-4 rounded-lg text-base font-bold transition-colors ${
                      active
                        ? "bg-emerald-800 text-white"
                        : "text-slate-200 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <a
              href={whatsappLink(whatsapp, isSw ? "Habari Mnyala! Ninataka kuweka oda." : "Hello Mnyala! I want to place an order.")}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-500 py-3 text-center text-sm font-bold text-slate-950 shadow-md"
            >
              <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06s-1.05-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.43 1.03 2.6c.13.17 1.77 2.7 4.28 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29" />
              </svg>
              <span>{isSw ? "Agiza Sasa Kupitia WhatsApp" : "Order via WhatsApp"}</span>
            </a>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <a href={telLink(phone)} className="flex items-center gap-1.5 hover:text-white">
                <svg className="size-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>{phone}</span>
              </a>
              <LanguageSwitcher current={locale} />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
