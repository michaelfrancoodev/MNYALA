import Link from "next/link";
import { telLink, mailtoLink } from "@/lib/contact-links";
import type { SiteSettings } from "@/server/services/site";
import type { Locale } from "@/messages/i18n";

export function SiteFooter({ site, locale = "sw" }: { site: SiteSettings; locale?: Locale }) {
  const isSw = locale === "sw";
  const phone = site.phone || "+255 758 730 108";
  const email = site.email || "info@mnyala.co.tz";
  const address = site.address || "Mbeya, Tanzania";

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ABOUT */}
        <div className="footer-box">
          <h3 className="flex items-center gap-2">
            <svg className="size-5 shrink-0 text-[#f5a623]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
            <span>Mnyala Co. Ltd</span>
          </h3>
          <p>
            {isSw
              ? "Tunageuza matunda ya mti wa mbono (Jatropha curcas) kuwa mkaa safi wa kisasa, mbegu na mbolea asilia, pia tunauza majiko. Lengo letu ni kutoa nishati safi na kulinda mazingira Tanzania."
              : "We convert renewable jatropha curcas biomass fruits into clean bio-charcoal, high-efficiency cookstoves, seeds, and organic bio-fertilizer. Our mission is delivering clean energy while preserving Tanzania's natural environment."}
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-box">
          <h3>{isSw ? "Viungo vya Haraka" : "Quick Links"}</h3>
          <ul>
            <li>
              <Link href="/">{isSw ? "Mwanzo" : "Home"}</Link>
            </li>
            <li>
              <Link href="/kuhusu">{isSw ? "Kuhusu Sisi" : "About Us"}</Link>
            </li>
            <li>
              <Link href="/bidhaa">{isSw ? "Bidhaa" : "Products"}</Link>
            </li>
            <li>
              <Link href="/picha">{isSw ? "Picha" : "Gallery"}</Link>
            </li>
            <li>
              <Link href="/wasiliana">{isSw ? "Wasiliana" : "Contact"}</Link>
            </li>
          </ul>
        </div>

        {/* SERVICES */}
        <div className="footer-box">
          <h3>{isSw ? "Huduma Zetu" : "Our Services"}</h3>
          <ul>
            <li>
              <Link href="/bidhaa#charcoal">{isSw ? "Uzalishaji wa Mkaa Safi" : "Bio-charcoal Production"}</Link>
            </li>
            <li>
              <Link href="/bidhaa#stove">{isSw ? "Uuzaji wa Majiko ya Kisasa" : "Stoves (Majiko) Sales"}</Link>
            </li>
            <li>
              <Link href="/bidhaa#seeds">{isSw ? "Usambazaji wa Mbegu za Mbono" : "Jatropha Seeds Supply"}</Link>
            </li>
            <li>
              <Link href="/bidhaa#manure">{isSw ? "Mbolea Asilia (Mboji)" : "Organic Manure (Mboji)"}</Link>
            </li>
            <li>
              <Link href="/wasiliana">{isSw ? "Oda za Jumla na Usafirishaji" : "Bulk Orders & Delivery"}</Link>
            </li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-box">
          <h3>{isSw ? "Wasiliana Nasi" : "Contact Us"}</h3>
          <p className="flex items-center gap-2">
            <svg className="size-4 shrink-0 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <a href={telLink(phone)} className="text-white hover:text-[#22c55e] no-underline">
              {phone}
            </a>
          </p>
          <p className="flex items-center gap-2">
            <svg className="size-4 shrink-0 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <a href={mailtoLink(email)} className="text-white hover:text-[#22c55e] no-underline">
              {email}
            </a>
          </p>
          <p className="flex items-center gap-2">
            <svg className="size-4 shrink-0 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{address}</span>
          </p>

          <div className="social-icons flex items-center gap-3 mt-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2d7a3e] transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2d7a3e] transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://wa.me/255758730108" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="size-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#2d7a3e] transition-colors">
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Mnyala Co. Ltd. Haki Zote Zimehifadhiwa. | Sustainable Energy Solutions</p>
      </div>
    </footer>
  );
}
