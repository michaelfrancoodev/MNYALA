import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Route } from "next";
import { MediaImage } from "@/components/public/media-image";
import { DirectOrderModal } from "@/components/public/direct-order-modal";
import { CATEGORY_DEFAULT_IMAGE, Price, ProductCard } from "@/components/public/product-row";
import { telLink } from "@/lib/contact-links";
import { PRODUCT_CATEGORY } from "@/messages/sw";
import {
  getPublishedProductBySlug,
  getRelatedProducts,
  getSiteSettings,
  type PublicProduct,
} from "@/server/services/site";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) return { title: "Bidhaa Haikupatikana" };

  return {
    title: `${product.name} | Mnyala Co. Ltd`,
    description: product.summary,
    openGraph: {
      title: `${product.name} | Mnyala Co. Ltd`,
      description: product.summary,
      type: "website",
    },
  };
}

// Category-specific lab analysis and specifications
const CATEGORY_SPECS: Record<
  PublicProduct["category"],
  {
    title: string;
    subtitle: string;
    specs: Array<{ metric: string; value: string; standard: string }>;
  }
> = {
  charcoal: {
    title: "Vipimo vya Maabara na Ubora wa Mkaa",
    subtitle: "Uchunguzi uliothibitishwa wa viwango vya nishati na usalama wa mazingira",
    specs: [
      { metric: "Kiwango cha Joto (Calorific Value)", value: "4,800 - 5,200 kcal/kg", standard: "TBS / ASTM D5865" },
      { metric: "Muda wa Kuwaka Bila Kuzimika", value: "Saa 6 hadi 8 Mfululizo", standard: "Kiwango cha Kimataifa" },
      { metric: "Kiwango cha Majivu (Ash Content)", value: "Chini ya 4.0% (Majivu Meupe)", standard: "ISO 1171" },
      { metric: "Kiwango cha Unyevu (Moisture Content)", value: "Chini ya 5.0%", standard: "ASTM D3173" },
      { metric: "Moshi na Harufu (Smoke & Odor)", value: "0% Moshi (Indoor Safe)", standard: "WHO Clean Cooking" },
      { metric: "Asili ya Malighafi", value: "100% Mbegu na Makombora ya Mbono", standard: "Bio-Waste Recovery" },
    ],
  },
  stove: {
    title: "Vipimo vya Muundo na Ufanisi wa Jiko",
    subtitle: "Muundo thabiti wa kuokoa zaidi ya 70% ya gharama za mkaa",
    specs: [
      { metric: "Uokoaji wa Nishati (Energy Efficiency)", value: "Hadi 70% punguzo la mkaa", standard: "ISO Tier 4 Standard" },
      { metric: "Nyenzo ya Nje (Outer Body)", value: "Chuma Imara cha Heavy-Gauge Steel", standard: "Rust Resistant" },
      { metric: "Chumba cha Moto (Combustion Chamber)", value: "Udongo Maalum wa Kauri (Refractory Liner)", standard: "1200°C Heat Rating" },
      { metric: "Uzito na Ubebaji", value: "Kilo 5.5 - Rahisi kubeba", standard: "Ergonomic Portable" },
      { metric: "Dhamana ya Kiwandani (Warranty)", value: "Miezi 12 ya Ubora Kamili", standard: "Mnyala Quality Guarantee" },
      { metric: "Aina ya Mkaa Inayofaa", value: "Mkaa wa Mbegu (Briquettes) na Mkaa wa Kawaida", standard: "Universal Bio-Stove" },
    ],
  },
  seeds: {
    title: "Vipimo vya Ubora wa Mbegu za Mbono",
    subtitle: "Mbegu zilizoteuliwa kwa ajili ya kilimo chenye tija ya juu",
    specs: [
      { metric: "Kiwango cha Kuota (Germination Rate)", value: "Zaidi ya 85% ndani ya siku 7-14", standard: "TOSCI Certified" },
      { metric: "Usafi wa Mbegu (Purity)", value: "Zaidi ya 98%", standard: "Seed Grade A" },
      { metric: "Kiwango cha Mafuta (Oil Content)", value: "Zaidi ya 35% ya uzito wa mbegu", standard: "Lab Tested" },
      { metric: "Uimara wa Mti", value: "Hustahimili ukame na udongo mgumu", standard: "Drought Tolerant" },
      { metric: "Matumizi Makuu", value: "Ua wa asili, mkaa mbadala, mbolea, na biofuel", standard: "Multi-Purpose" },
    ],
  },
  manure: {
    title: "Muundo wa Virutubisho vya Mbolea (Mboji)",
    subtitle: "Mbolea safi ya asili inayoboresha udongo na kuongeza mavuno",
    specs: [
      { metric: "Kiwango cha Nitrogen (N)", value: "Kiwango cha Juu kwa Majani na Ukuaji", standard: "Organic N-Rich" },
      { metric: "Kiwango cha Phosphorus (P) & Potassium (K)", value: "Ulinganifu asilia wa maua na mizizi", standard: "Balanced PK" },
      { metric: "Kiwango cha Mabaki Asilia (Organic Matter)", value: "Zaidi ya 65%", standard: "Soil Enrichment" },
      { metric: "Kiwango cha Tindikali (pH Level)", value: "6.5 - 7.5 (Kiwango Rafiki wa Mazao)", standard: "Neutral PH" },
      { metric: "Muda wa Athari Kwenye Udongo", value: "Inarutubisha udongo hadi misimu 3", standard: "Long-Acting Organic" },
    ],
  },
};

const PACKAGING_OPTIONS = [
  { size: "100g", label: "Sampuli ya Jaribio", desc: "Inafaa kwa wateja wapya wanaotaka kupima ubora wa moto." },
  { size: "1kg", label: "Pakiti ya Siku", desc: "Inatosha kupikia chakula cha familia kwa siku 2 hadi 3." },
  { size: "5kg", label: "Kifurushi cha Kaya", desc: "Kifurushi maarufu zaidi kwa kaya za mjini (Wiki 1 - 2)." },
  { size: "7kg", label: "Kifurushi cha Familia Kubwa", desc: "Muda mrefu wa matumizi na usafirishaji rahisi wa nyumbani." },
  { size: "15kg", label: "Kifurushi cha Biashara Ndogo", desc: "Migahawa midogo, wauza vyakula vya mtaani na chipsi." },
  { size: "30kg", label: "Gunia la Jumla & Viwandani", desc: "Bei nafuu zaidi ya kiwandani kwa ajili ya mahoteli na taasisi." },
];

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  const [site, related] = await Promise.all([
    getSiteSettings(),
    getRelatedProducts(slug, 3),
  ]);

  const fallback = CATEGORY_DEFAULT_IMAGE[product.category];
  const specData = CATEGORY_SPECS[product.category] || CATEGORY_SPECS.charcoal;
  const phone = site.phone || "+255 758 730 108";

  return (
    <div className="bg-slate-50/50 pb-20">
      {/* 1. BREADCRUMBS */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-medium text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-emerald-700 transition-colors">
              Mwanzo
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/bidhaa" className="hover:text-emerald-700 transition-colors">
              Bidhaa
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900 truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 2. PRODUCT HERO SECTION */}
      <section className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:grid-cols-2 lg:gap-12 lg:p-10">
          {/* Left: Product Visuals */}
          <div className="flex flex-col">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner group">
              {product.image ? (
                <MediaImage
                  image={product.image}
                  sizes="(min-width: 1024px) 36rem, 100vw"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  priority
                />
              ) : fallback ? (
                <Image
                  src={fallback.src}
                  alt={fallback.alt}
                  width={1000}
                  height={750}
                  priority
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 font-bold text-slate-500">
                  {PRODUCT_CATEGORY[product.category]}
                </div>
              )}

              <span className="absolute left-4 top-4 rounded-md bg-emerald-800/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-xs">
                {PRODUCT_CATEGORY[product.category]}
              </span>

              <span className="absolute right-4 top-4 rounded-md bg-slate-900/90 px-3 py-1 text-[11px] font-semibold text-slate-200 shadow-sm backdrop-blur-xs">
                Kiwanda cha Mbeya
              </span>
            </div>

            {/* Quality Badges */}
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-2.5">
                <p className="text-[11px] font-bold text-emerald-800">100% Asilia</p>
                <p className="text-[10px] text-slate-500">Bila kemikali hatari</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-2.5">
                <p className="text-[11px] font-bold text-emerald-800">Kiwango Bora</p>
                <p className="text-[10px] text-slate-500">Muda mrefu wa moto</p>
              </div>
              <div className="rounded-lg border border-slate-200/80 bg-slate-50 p-2.5">
                <p className="text-[11px] font-bold text-emerald-800">Tanzania Nzima</p>
                <p className="text-[10px] text-slate-500">Usafirishaji wa haraka</p>
              </div>
            </div>
          </div>

          {/* Right: Product Details & Purchase Actions */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {PRODUCT_CATEGORY[product.category]}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  SKU: MN-{product.category.toUpperCase()}-{product.slug.slice(0, 6).toUpperCase()}
                </span>
              </div>

              <h1 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3 border-y border-slate-100 py-3.5">
                <Price product={product} />
                <span className="text-xs text-slate-500">
                  (Bei ya kiwandani &bull; Inajumuisha punguzo la oda ya mtandaoni)
                </span>
              </div>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {product.summary}
              </p>

              {/* Sifa Kuu */}
              {product.features.length > 0 ? (
                <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-3">
                    Sifa Kuu za Bidhaa Hii:
                  </h3>
                  <ul className="grid gap-2.5 sm:grid-cols-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-xs font-medium text-slate-800">
                        <svg className="size-4 shrink-0 text-emerald-700 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>

            {/* CTAs */}
            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <DirectOrderModal
                  product={product}
                  buttonLabel="Agiza Sasa Kupitia WhatsApp"
                  buttonClassName="btn-product flex-1 py-3 text-center text-sm font-bold shadow-md hover:shadow-lg"
                />
                <a
                  href={telLink(phone)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-colors"
                >
                  <svg className="size-4 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Piga Simu Kiwandani
                </a>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <svg className="size-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                  Upatikanaji: Mzigo Upo Kiwandani
                </span>
                <Link
                  href={`/wasiliana?bidhaa=${product.slug}` as Route}
                  className="font-medium text-emerald-700 hover:underline"
                >
                  Una swali kuhusu bidhaa hii? Tuandikie &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TECHNICAL SPECIFICATIONS & LAB DATA TABLE */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Uthibitisho wa Kisayansi</span>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              {specData.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {specData.subtitle}
            </p>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Kipimo / Sifa</th>
                    <th scope="col" className="px-6 py-3.5">Matokeo ya Kiwandani</th>
                    <th scope="col" className="px-6 py-3.5">Kiwango / Uthibitisho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {specData.specs.map((item) => (
                    <tr key={item.metric} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{item.metric}</td>
                      <td className="px-6 py-4 font-bold text-emerald-800">{item.value}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">{item.standard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PACKAGING OPTIONS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Vifungashio vya Kiwandani</span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Vifurushi Vinavyopatikana
              </h2>
              <p className="mt-1.5 text-sm text-slate-600">
                Chagua kifurushi kinachokidhi mahitaji ya familia yako, mgahawa au biashara ya jumla.
              </p>
            </div>
            <DirectOrderModal
              product={product}
              buttonLabel="Agiza Kifurushi Sasa"
              buttonClassName="btn-product shrink-0 text-xs font-bold px-5 py-2.5"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGING_OPTIONS.map((pkg) => (
              <div
                key={pkg.size}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-5 hover:border-emerald-700 hover:bg-white hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-emerald-800 px-2.5 py-1 text-xs font-black text-white">
                      {pkg.size}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">Pakiti Imara</span>
                  </div>
                  <h3 className="mt-3 text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {pkg.label}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {pkg.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/60">
                  <DirectOrderModal
                    product={product}
                    initialPackageSize={pkg.size}
                    buttonLabel={`Agiza ${pkg.size}`}
                    buttonClassName="w-full rounded-md border border-slate-300 bg-white py-1.5 text-center text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-800 transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RELATED PRODUCTS */}
      {related.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Gundua Zaidi</span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">
                Bidhaa Zingine Zinazohusiana
              </h2>
            </div>
            <Link
              href="/bidhaa"
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              Tazama Bidhaa Zote &rarr;
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
