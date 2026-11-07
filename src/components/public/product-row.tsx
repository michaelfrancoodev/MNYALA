import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { whatsappLink } from "@/lib/contact-links";
import { formatTzs } from "@/lib/format";
import { COMMON, PRODUCT_CATEGORY } from "@/messages/sw";
import type { PublicProduct } from "@/server/services/site";
import { MediaImage } from "./media-image";

export function Price({ product }: { product: Pick<PublicProduct, "priceTzs" | "priceUnit"> }) {
  if (product.priceTzs === null) return <span className="text-ink-soft">{COMMON.priceOnRequest}</span>;
  return (
    <span className="font-semibold text-ink">
      {formatTzs(product.priceTzs)}
      {product.priceUnit ? <span className="font-normal text-ink-soft"> / {product.priceUnit}</span> : null}
    </span>
  );
}

/** The full entry on the products page. */
export function ProductEntry({ product, whatsapp }: { product: PublicProduct; whatsapp?: string }) {
  return (
    <article id={product.slug} className="scroll-mt-6 grid gap-6 py-10 md:grid-cols-[minmax(0,22rem)_1fr] md:gap-10">
      {product.image ? (
        <MediaImage
          image={product.image}
          sizes="(min-width: 768px) 22rem, 100vw"
          className="aspect-[4/3] w-full rounded-md border border-line object-cover"
        />
      ) : (
        <div className="flex aspect-[4/3] items-end rounded-md border border-line bg-brand-tint p-4" aria-hidden="true">
          <span className="font-serif text-lg text-brand-dark">{PRODUCT_CATEGORY[product.category]}</span>
        </div>
      )}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-ember">{PRODUCT_CATEGORY[product.category]}</p>
        <h2 className="mt-1 text-3xl font-semibold">{product.name}</h2>
        <p className="mt-3 max-w-prose text-lg text-ink-soft">{product.summary}</p>
        {product.features.length > 0 ? (
          <ul className="mt-4 max-w-prose list-disc space-y-1 pl-5 marker:text-brand">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-5">
          <Price product={product} />
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={`/wasiliana?bidhaa=${product.slug}`} className={buttonClasses("primary")}>
            {COMMON.orderNow}
          </Link>
          {whatsapp ? (
            <a href={whatsappLink(whatsapp, `Habari Mnyala, nahitaji kujua zaidi kuhusu ${product.name}.`)} className={buttonClasses("secondary")}>
              {COMMON.askOnWhatsapp}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** A compact line for the home page. */
export function ProductLine({ product }: { product: PublicProduct }) {
  return (
    <div className="grid items-baseline gap-x-8 gap-y-1 py-5 md:grid-cols-[1fr_2fr_auto]">
      <h3 className="text-xl font-semibold">{product.name}</h3>
      <p className="text-ink-soft">{product.summary}</p>
      <Link href={`/bidhaa#${product.slug}`} className="font-semibold">
        Maelezo
        <span className="sr-only"> ya {product.name}</span>
      </Link>
    </div>
  );
}
