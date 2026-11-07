import Image from "next/image";
import Link from "next/link";
import { mailtoLink, telLink } from "@/lib/contact-links";
import { COMMON, NAV } from "@/messages/sw";
import type { SiteSettings } from "@/server/services/site";

export function SiteFooter({ site }: { site: SiteSettings }) {
  const social = [
    site.facebook ? { label: "Facebook", href: site.facebook } : null,
    site.instagram ? { label: "Instagram", href: site.instagram } : null,
  ].filter((s): s is { label: string; href: string } => s !== null);

  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/emblem.webp" alt="Mnyala" width={40} height={40} priority className="size-10" />
            <div>
              <p className="text-xl font-extrabold text-white">Mnyala Co. Ltd</p>
              <p className="text-xs font-semibold text-emerald-400">Nishati Safi & Kilimo Endelevu</p>
            </div>
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-400 leading-relaxed">
            Tunageuza matunda ya mti wa mbono (Jatropha curcas) kuwa mkaa safi wa kisasa usio na moshi, mbegu bora, na mbolea asilia (mboji).
            Lengo letu ni nishati safi, salama na uhifadhi thabiti wa mazingira ya Tanzania.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Makao Makuu: Mbeya, Tanzania
          </div>
        </div>

        <nav aria-label="Viungo vya chini">
          <p className="text-xs font-bold uppercase tracking-wider text-white">Kurasa za Tovuti</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-slate-400 transition-colors hover:text-white no-underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faragha" className="text-slate-400 transition-colors hover:text-white no-underline">
                {COMMON.privacy}
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-white">Mawasiliano Mbeya</p>
          <address className="mt-4 space-y-3 not-italic text-sm text-slate-400">
            {site.address ? (
              <div className="flex items-start gap-2.5">
                <svg className="size-4 shrink-0 text-emerald-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{site.address}</span>
              </div>
            ) : null}
            {site.phone ? (
              <div className="flex items-center gap-2.5">
                <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <a href={telLink(site.phone)} className="text-white hover:text-emerald-300 no-underline font-semibold">
                  {site.phone}
                </a>
              </div>
            ) : null}
            {site.email ? (
              <div className="flex items-center gap-2.5">
                <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <a href={mailtoLink(site.email)} className="text-slate-300 hover:text-white no-underline">
                  {site.email}
                </a>
              </div>
            ) : null}
            {site.hours ? (
              <div className="flex items-center gap-2.5">
                <svg className="size-4 shrink-0 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{site.hours}</span>
              </div>
            ) : null}
          </address>

          {social.length > 0 ? (
            <ul className="mt-5 flex gap-4 text-xs">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-800 px-3 py-1.5 text-slate-300 hover:bg-slate-700 hover:text-white no-underline transition-colors">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-850 bg-black/40">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-xs text-slate-400 sm:px-8">
          <p>
            &copy; {new Date().getFullYear()} Mnyala Co. Ltd. {COMMON.rights}
          </p>
          <Link href="/admin/login" rel="nofollow" className="text-slate-400 hover:text-white no-underline">
            {COMMON.staff}
          </Link>
        </div>
      </div>
    </footer>
  );
}
