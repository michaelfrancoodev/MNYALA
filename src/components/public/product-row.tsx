import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import { COMMON, PRODUCT_CATEGORY } from "@/messages/sw";
import type { PublicProduct } from "@/server/services/site";
import { MediaImage } from "./media-image";

const CATEGORY_DEFAULT_IMAGE: Record<PublicProduct["category"], { src: string; alt: string }> = {
  charcoal: {
    src: "/products/mnyala-charcoal-briquettes.jpg",
    alt: "Mkaa Safi wa Mbono - Mnyala Bio-Charcoal Briquettes Mbeya",
  },
  stove: {
    src: "/products/mnyala-clean-cookstove.jpg",
    alt: "Majiko ya Kisasa ya Ufanisi - Mnyala Clean Biomass Cookstoves",
  },
  seeds: {
    src: "/products/mnyala-jatropha-seeds.jpg",
    alt: "Mbegu Bora za Mbono - Mnyala Selected Jatropha Curcas Seeds",
  },
  manure: {
    src: "/products/mnyala-organic-fertilizer.jpg",
    alt: "Mbolea Asilia ya Mboji - Mnyala Organic Bio-Fertilizer Compost",
  },
};

const B2B_SPECS: Record<PublicProduct["category"], { moq: string; wholesaleTiers: string; dispatch: string }> = {
  charcoal: {
    moq: "Mfuko 1 (Sampuli) / Mifuko 20 (Jumla)",
    wholesaleTiers: "1-19: TZS 28,000 | 20+: TZS 25,000 | 100+: TZS 22,000",
    dispatch: "Saa 24-48 Mikoani",
  },
  stove: {
    moq: "Jiko 1 (Rejareja) / Majiko 5 (Jumla)",
    wholesaleTiers: "Rejareja: TZS 45,000 | 5+: TZS 38,000",
    dispatch: "Saa 24-48 Mikoani",
  },
  seeds: {
    moq: "1 kg (Kiwango cha Chini)",
    wholesaleTiers: "1-9kg: TZS 5,000/kg | 10kg+: TZS 4,000/kg",
    dispatch: "Saa 24 Mikoani",
  },
  manure: {
    moq: "Mfuko 1 wa 50kg / Mifuko 10 (Jumla)",
    wholesaleTiers: "1-9: TZS 20,000 | 10+: TZS 16,000",
    dispatch: "Saa 24-48 Mikoani",
  },
};

export function Price({ product }: { product: Pick<PublicProduct, "priceTzs" | "priceUnit"> }) {
  if (product.priceTzs === null) {
    return <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs font-bold text-ink-soft">{COMMON.priceOnRequest}</span>;
  }
  return (
    <span className="text-xl font-black text-ink tracking-tight">
      {formatTzs(product.priceTzs)}
      {product.priceUnit ? <span className="text-xs font-semibold text-muted"> / {product.priceUnit}</span> : null}
    </span>
  );
}

/** Alibaba / Amazon B2B Industrial Product Card */
export function ProductCard({ product, whatsapp }: { product: PublicProduct; whatsapp?: string }) {
  const fallback = CATEGORY_DEFAULT_IMAGE[product.category];
  const b2b = B2B_SPECS[product.category];

  return (
    <div className="group flex flex-col justify-between rounded-lg border border-line bg-surface p-4 shadow-xs hover:border-emerald-700 hover:shadow-md transition-all duration-200">
      <div>
        <div className="relative overflow-hidden rounded-md border border-line/80 bg-slate-100">
          {product.image ? (
            <MediaImage
              image={product.image}
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
          ) : fallback ? (
            <Image
              src={fallback.src}
              alt={fallback.alt}
              width={600}
              height={450}
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-ink font-bold text-sm">
              {PRODUCT_CATEGORY[product.category]}
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 rounded bg-slate-900/90 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
            {PRODUCT_CATEGORY[product.category]}
          </span>
          <span className="absolute right-2.5 top-2.5 rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
            In Stock
          </span>
        </div>

        <div className="mt-3.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted">
            Kiwanda cha Mbeya &bull; SKU: MN-{product.category.toUpperCase()}
          </p>
          <h3 className="mt-1 text-base font-extrabold text-ink group-hover:text-emerald-800 transition-colors leading-snug">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-ink-soft line-clamp-2 leading-relaxed">
            {product.summary}
          </p>
        </div>

        <div className="mt-3 rounded border border-line/70 bg-slate-50 p-2 text-xs">
          <p className="font-bold text-slate-800">
            Jumla & Rejareja: <span className="font-normal text-muted">{b2b.wholesaleTiers}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            MOQ: <span className="font-semibold text-slate-700">{b2b.moq}</span>
          </p>
        </div>

        {product.features.length > 0 ? (
          <ul className="mt-3 space-y-1 border-t border-line/60 pt-2.5">
            {product.features.slice(0, 2).map((f) => (
              <li key={f} className="flex items-center gap-1.5 text-xs text-slate-700">
                <svg className="size-3.5 shrink-0 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-4 border-t border-line/80 pt-3">
        <div className="mb-2.5 flex items-baseline justify-between">
          <Price product={product} />
          <span className="text-[11px] font-semibold text-emerald-800">{b2b.dispatch}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/wasiliana?bidhaa=${product.slug}`} className={buttonClasses("primary", "sm", "w-full text-xs font-bold")}>
            {COMMON.orderNow}
          </Link>
          {whatsapp ? (
            <a
              href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji bei ya jumla na maelekezo ya kuagiza ${product.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("secondary", "sm", "w-full text-xs font-semibold")}
            >
              WhatsApp
            </a>
          ) : (
            <Link href={`/bidhaa#${product.slug}`} className={buttonClasses("secondary", "sm", "w-full text-xs")}>
              Maelezo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

/** The full entry on the products catalog page. */
export function ProductEntry({ product, whatsapp }: { product: PublicProduct; whatsapp?: string }) {
  const fallback = CATEGORY_DEFAULT_IMAGE[product.category];

  return (
    <article id={product.slug} className="scroll-mt-10 rounded-lg border border-line bg-surface p-6 shadow-xs hover:border-emerald-700 hover:shadow-md transition-all duration-200 md:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-10">
        <div>
          {product.image ? (
            <div className="overflow-hidden rounded-md border border-line/80 bg-slate-100">
              <MediaImage
                image={product.image}
                sizes="(min-width: 768px) 22rem, 100vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-102"
              />
            </div>
          ) : fallback ? (
            <div className="overflow-hidden rounded-md border border-line/80 bg-slate-100">
              <Image
                src={fallback.src}
                alt={fallback.alt}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-102"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-md border border-line bg-slate-100" aria-hidden="true">
              <span className="text-lg font-bold text-ink">{PRODUCT_CATEGORY[product.category]}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-slate-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                {PRODUCT_CATEGORY[product.category]}
              </span>
              <span className="text-xs font-semibold text-muted">Kiwanda Mbeya &bull; SKU: MN-{product.category.toUpperCase()}</span>
            </div>
            <h2 className="mt-2 text-2xl font-black text-ink sm:text-3xl">{product.name}</h2>
            <p className="mt-3 text-base text-ink-soft leading-relaxed">{product.summary}</p>
            {product.features.length > 0 ? (
              <div className="mt-5 rounded-md bg-slate-50 p-4 border border-line/80">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">Vipimo na Sifa za Kiwandani:</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <svg className="size-4 shrink-0 text-emerald-700 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-line/80 pt-5">
            <div className="mb-4">
              <Price product={product} />
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/wasiliana?bidhaa=${product.slug}`} className={buttonClasses("primary", "md", "font-bold")}>
                {COMMON.orderNow}
              </Link>
              {whatsapp ? (
                <a
                  href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji kujua zaidi kuhusu ${product.name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("secondary", "md", "font-semibold")}
                >
                  {COMMON.askOnWhatsapp}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** A compact line for the home page. */
export function ProductLine({ product }: { product: PublicProduct }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-3 rounded-xl hover:bg-slate-50 transition-colors">
      <div>
        <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800">
          {PRODUCT_CATEGORY[product.category]}
        </span>
        <h3 className="text-lg font-bold text-ink mt-1">{product.name}</h3>
        <p className="text-sm text-ink-soft line-clamp-1">{product.summary}</p>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        <Price product={product} />
        <Link href={`/bidhaa#${product.slug}`} className={buttonClasses("secondary", "sm")}>
          Maelezo
          <span className="sr-only"> ya {product.name}</span>
        </Link>
      </div>
    </div>
  );
}
