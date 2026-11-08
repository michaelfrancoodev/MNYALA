"use client";

import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { telLink, mailtoLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import type { Locale } from "@/messages/i18n";

export function SiteHeader({
  site,
  locale = "sw",
}: {
  site: Pick<SiteSettings, "phone" | "email" | "address">;
  locale?: Locale;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const isSw = locale !== "en";

  const phone = site.phone || "+255 758 730 108";
  const email = site.email || "info@mnyala.co.tz";
  const address = site.address || "Mbeya, Tanzania";

  const navLinks: Array<{ href: Route; label: string }> = [
    { href: "/", label: isSw ? "Mwanzo" : "Home" },
    { href: "/kuhusu", label: isSw ? "Kuhusu sisi" : "About" },
    { href: "/bidhaa", label: isSw ? "Bidhaa" : "Products" },
    { href: "/picha", label: isSw ? "Picha" : "Gallery" },
    { href: "/wasiliana", label: isSw ? "Wasiliana" : "Contact" },
  ];

  useEffect(() => {
    if (!menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [menuOpen]);

  return (
    <header className="w-full relative z-50">
      {/* 1. TOP BAR */}
      <div className="top-bar">
        <div>
          <svg className="size-4 shrink-0 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <a href={telLink(phone)} className="text-white hover:text-[#4ade80] transition-colors no-underline">
            {phone}
          </a>
        </div>

        <div>
          <svg className="size-4 shrink-0 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          <a href={mailtoLink(email)} className="text-white hover:text-[#4ade80] transition-colors no-underline">
            {email}
          </a>
        </div>

        <div>
          <svg className="size-4 shrink-0 text-[#4ade80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>{address}</span>
        </div>

        <div className="hidden sm:flex ml-auto items-center">
          <Link
            href="/admin/login"
            className="text-white/80 hover:text-[#4ade80] transition-colors no-underline text-xs font-semibold flex items-center gap-1.5"
            title="Kuingia kwenye mfumo wa Admin"
          >
            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Admin</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN HEADER (MNYALA LOGO ON BOTH LEFT AND RIGHT) */}
      <div className="main-header">
        {/* Left Logo (Mnyala) */}
        <div className="header-logo left">
          <Image
            src="/original/logo.png"
            alt="Mnyala Logo"
            width={140}
            height={140}
            priority
            className="size-full object-contain rounded-full"
          />
        </div>

        {/* Center Title (div instead of h1 so each page has exactly one semantic h1) */}
        <div className="company-title">
          <div className="company-eyebrow">{isSw ? "Sustainable Energy Solutions" : "Sustainable Energy Solutions"}</div>
          <div className="company-brand-title">MNYALA CO. LTD</div>
          <p className="company-subtitle">
            {isSw
              ? "Producing Eco-Friendly Charcoal From Natural Fruits"
              : "Producing Eco-Friendly Charcoal From Natural Fruits"}
          </p>
        </div>

        {/* Right Logo (Mnyala) */}
        <div className="header-logo right">
          <Image
            src="/original/logo.png"
            alt="Mnyala Logo"
            width={140}
            height={140}
            priority
            className="size-full object-contain rounded-full"
          />
        </div>
      </div>

      {/* 3. MENU BAR (WHITE NAVIGATION) */}
      <nav ref={navRef} className="menu-bar" aria-label="Menyu kuu">
        <div className="nav-container">
          <span className="mobile-nav-label">
            {isSw ? "Menyu ya Tovuti" : "Site Menu"}
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="hamburger"
            aria-label="Menyu"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
          >
            {menuOpen ? (
              <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" x2="6" y1="6" y2="18" />
                <line x1="6" x2="18" y1="6" y2="18" />
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

        <ul id="nav-menu" className={`menu-bar-list ${menuOpen ? "active open" : ""}`}>
          {navLinks.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={active ? "active" : ""}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="lg:hidden border-t border-slate-100 mt-2 pt-2">
            <Link
              href="/admin/login"
              onClick={() => setMenuOpen(false)}
              className="text-brand font-bold flex items-center justify-between"
            >
              <span>{isSw ? "Mfumo wa Admin (Wafanyakazi)" : "Admin Portal (Staff)"}</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
