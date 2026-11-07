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
    <footer className="bg-brand-dark text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <p className="font-serif text-2xl font-semibold">Mnyala Co. Ltd</p>
          <p className="mt-3 max-w-sm text-white/85">
            Tunageuza matunda ya mti wa mbono (Jatropha curcas) kuwa mkaa safi, mbegu na mbolea asilia, na tunauza majiko.
            Lengo letu ni nishati safi na kulinda mazingira ya Tanzania.
          </p>
        </div>
        <nav aria-label="Viungo vya chini">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Kurasa</p>
          <ul className="mt-3 space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white underline-offset-4 hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/faragha" className="text-white underline-offset-4 hover:underline">
                {COMMON.privacy}
              </Link>
            </li>
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Mawasiliano</p>
          <address className="mt-3 space-y-2 not-italic">
            {site.address ? <p>{site.address}</p> : null}
            {site.phone ? (
              <p>
                <a href={telLink(site.phone)} className="text-white underline-offset-4 hover:underline">
                  {site.phone}
                </a>
              </p>
            ) : null}
            {site.email ? (
              <p>
                <a href={mailtoLink(site.email)} className="text-white underline-offset-4 hover:underline">
                  {site.email}
                </a>
              </p>
            ) : null}
            {site.hours ? <p className="text-white/85">{site.hours}</p> : null}
          </address>
          {social.length > 0 ? (
            <ul className="mt-4 flex gap-5">
              {social.map((s) => (
                <li key={s.label}>
                  <a href={s.href} rel="noopener noreferrer" className="text-white underline-offset-4 hover:underline">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-5 py-4 text-sm text-white/80 sm:px-8">
          <p>
            &copy; {new Date().getFullYear()} Mnyala Co. Ltd. {COMMON.rights}
          </p>
          <Link href="/admin/login" rel="nofollow" className="text-white/80 underline-offset-4 hover:underline">
            {COMMON.staff}
          </Link>
        </div>
      </div>
    </footer>
  );
}
