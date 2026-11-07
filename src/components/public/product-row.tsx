import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import { COMMON, PRODUCT_CATEGORY } from "@/messages/sw";
import type { PublicProduct } from "@/server/services/site";
import { MediaImage } from "./media-image";

export function Price({ product }: { product: Pick<PublicProduct, "priceTzs" | "priceUnit"> }) {
  if (product.priceTzs === null) {
    return <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-ink-soft">{COMMON.priceOnRequest}</span>;
  }
  return (
    <span className="text-xl font-bold text-ink">
      {formatTzs(product.priceTzs)}
      {product.priceUnit ? <span className="text-sm font-normal text-muted"> / {product.priceUnit}</span> : null}
    </span>
  );
}

/** The modern card for product grids. */
export function ProductCard({ product, whatsapp }: { product: PublicProduct; whatsapp?: string }) {
  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 shadow-2xs hover:shadow-lg hover:border-brand/40 transition-all duration-300">
      <div>
        <div className="relative overflow-hidden rounded-xl border border-line/80 bg-slate-50">
          {product.image ? (
            <MediaImage
              image={product.image}
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-brand-tint/60 text-brand-dark font-bold text-base">
              {PRODUCT_CATEGORY[product.category]}
            </div>
          )}
          <span className="absolute left-3 top-3 inline-block rounded-lg bg-surface/90 backdrop-blur-md px-2.5 py-1 text-xs font-bold text-brand-dark shadow-xs">
            {PRODUCT_CATEGORY[product.category]}
          </span>
        </div>

        <div className="mt-4">
          <h3 className="text-xl font-bold text-ink group-hover:text-brand-dark transition-colors">
            {product.name}
          </h3>
          <p className="mt-2 text-sm text-ink-soft line-clamp-2 leading-relaxed">
            {product.summary}
          </p>
        </div>

        {product.features.length > 0 ? (
          <ul className="mt-4 space-y-1.5 border-t border-line/60 pt-3">
            {product.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-ink-soft">
                <svg className="size-3.5 shrink-0 text-brand" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-6 border-t border-line/80 pt-4">
        <div className="mb-3">
          <Price product={product} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/wasiliana?bidhaa=${product.slug}`} className={buttonClasses("primary", "sm", "w-full text-xs")}>
            {COMMON.orderNow}
          </Link>
          {whatsapp ? (
            <a
              href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji bei na maelezo kuhusu ${product.name}.`)}
              className={buttonClasses("secondary", "sm", "w-full text-xs")}
            >
              {COMMON.whatsapp}
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
  return (
    <article id={product.slug} className="scroll-mt-10 rounded-2xl border border-line bg-surface p-6 shadow-2xs hover:shadow-md transition-all duration-200 md:p-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_1fr] lg:gap-10">
        <div>
          {product.image ? (
            <div className="overflow-hidden rounded-xl border border-line/80 bg-slate-50">
              <MediaImage
                image={product.image}
                sizes="(min-width: 768px) 22rem, 100vw"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 hover:scale-102"
              />
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-line bg-brand-tint" aria-hidden="true">
              <span className="text-lg font-bold text-brand-dark">{PRODUCT_CATEGORY[product.category]}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-md bg-emerald-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/60">
                {PRODUCT_CATEGORY[product.category]}
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{product.name}</h2>
            <p className="mt-3 text-base text-ink-soft leading-relaxed">{product.summary}</p>
            {product.features.length > 0 ? (
              <div className="mt-5 rounded-xl bg-paper p-4 border border-line/60">
                <p className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Sifa Kuu:</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                      <svg className="size-4 shrink-0 text-brand mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              <Link href={`/wasiliana?bidhaa=${product.slug}`} className={buttonClasses("primary", "md")}>
                {COMMON.orderNow}
              </Link>
              {whatsapp ? (
                <a
                  href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji kujua zaidi kuhusu ${product.name}.`)}
                  className={buttonClasses("secondary", "md")}
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
