import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { formatTzs } from "@/lib/format";
import { COMMON, PRODUCT_CATEGORY } from "@/messages/sw";
import type { PublicProduct } from "@/server/services/site";
import { MediaImage } from "./media-image";
import { DirectOrderModal } from "./direct-order-modal";

export const CATEGORY_DEFAULT_IMAGE: Record<PublicProduct["category"], { src: string; alt: string }> = {
  charcoal: {
    src: "/original/product3.jpg",
    alt: "Mkaa Safi wa Mbono - Mnyala Bio-Charcoal Briquettes Mbeya",
  },
  stove: {
    src: "/original/stove1.jpg",
    alt: "Majiko ya Kisasa ya Ufanisi - Mnyala Clean Biomass Cookstoves",
  },
  seeds: {
    src: "/original/mbegu.jpg",
    alt: "Mbegu Bora za Mbono - Mnyala Selected Jatropha Curcas Seeds",
  },
  manure: {
    src: "/original/mbolea.jpg",
    alt: "Mbolea Asilia ya Mboji - Mnyala Organic Bio-Fertilizer Compost",
  },
};

export function Price({ product }: { product: Pick<PublicProduct, "priceTzs" | "priceUnit"> }) {
  if (product.priceTzs === null) {
    return (
      <span className="inline-block rounded bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
        {COMMON.priceOnRequest}
      </span>
    );
  }
  return (
    <span className="text-lg font-black text-ink tracking-tight">
      {formatTzs(product.priceTzs)}
      {product.priceUnit ? <span className="text-xs font-normal text-muted"> / {product.priceUnit}</span> : null}
    </span>
  );
}

/** Clean, responsive product card */
export function ProductCard({ product }: { product: PublicProduct; whatsapp?: string }) {
  const fallback = CATEGORY_DEFAULT_IMAGE[product.category];
  const detailHref = `/bidhaa/${product.slug}` as Route;

  return (
    <div className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-emerald-600 hover:shadow-md transition-all duration-200">
      <div>
        <Link href={detailHref} className="block relative overflow-hidden rounded-lg border border-slate-100 bg-slate-100">
          {product.image ? (
            <MediaImage
              image={product.image}
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : fallback ? (
            <Image
              src={fallback.src}
              alt={fallback.alt}
              width={600}
              height={450}
              className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-slate-800 font-bold text-sm">
              {PRODUCT_CATEGORY[product.category]}
            </div>
          )}
          <span className="absolute left-2.5 top-2.5 rounded bg-emerald-800/95 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-xs">
            {PRODUCT_CATEGORY[product.category]}
          </span>
        </Link>

        <div className="mt-4">
          <Link href={detailHref} className="block">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {product.summary}
          </p>
        </div>

        {product.features.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
            {product.features.slice(0, 2).map((f) => (
              <span key={f} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 truncate max-w-full">
                <svg className="size-3 shrink-0 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="truncate">{f}</span>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3.5">
        <div className="mb-3">
          <Price product={product} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <DirectOrderModal
            product={product}
            buttonLabel={COMMON.orderNow}
            buttonClassName="btn-product text-center text-xs font-bold w-full py-2 px-1"
          />
          <Link
            href={detailHref}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 hover:text-emerald-800 py-2 px-1 transition-colors text-center"
          >
            Maelezo Zaidi
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The full entry on the products catalog page. */
export function ProductEntry({ product }: { product: PublicProduct; whatsapp?: string }) {
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
              <DirectOrderModal
                product={product}
                buttonLabel={COMMON.orderNow}
                buttonClassName="btn-product font-bold px-6 py-2.5 text-xs"
              />
              <Link href={`/bidhaa/${product.slug}` as Route} className={buttonClasses("secondary", "md", "font-semibold")}>
                Maelezo Kamili &rarr;
              </Link>
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
        <Link href={`/bidhaa/${product.slug}` as Route} className={buttonClasses("secondary", "sm")}>
          Maelezo
          <span className="sr-only"> ya {product.name}</span>
        </Link>
      </div>
    </div>
  );
}
