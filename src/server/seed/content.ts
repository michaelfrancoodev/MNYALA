/**
 * Starting content, taken from the previous Mnyala website.
 * Prices are deliberately empty (shown as "Wasiliana kwa bei") and no impact statistics are seeded:
 * the owner must supply and confirm those before they are published.
 */

export type SeedProduct = {
  slug: string;
  name: string;
  category: "charcoal" | "stove" | "seeds" | "manure";
  summary: string;
  features: string[];
  /** File inside seed-assets/, or null when the owner still has to provide a photo. */
  image: { file: string; alt: string } | null;
  sortOrder: number;
};

export const SEED_PRODUCTS: SeedProduct[] = [
  {
    slug: "mkaa-safi-wa-kisasa",
    name: "Mkaa Safi wa Kisasa",
    category: "charcoal",
    summary:
      "Mkaa wa ubora wa juu unaotokana na matunda ya mbono. Moto wenye joto kali, moshi kwa kiasi kidogo na bei nafuu kwa matumizi ya nyumbani na biashara.",
    features: [
      "Moto mrefu zaidi kuliko mkaa wa kawaida",
      "Moshi mdogo na majivu machache",
      "Bei nafuu kwa kila kifungashio",
      "Salama kwa afya ya familia",
    ],
    image: { file: "product-charcoal.jpg", alt: "Vipande vya mkaa mweusi vinavyowaka kwa moto mwekundu" },
    sortOrder: 10,
  },
  {
    slug: "majiko-ya-ufanisi",
    name: "Majiko ya Ufanisi",
    category: "stove",
    summary:
      "Majiko ya kisasa yaliyobuniwa kutumia mkaa wetu kwa ufanisi mkubwa. Yanahimili joto.",
    features: [
      "Imara na ya kudumu kwa miaka mingi",
      "Joto la kudumu na la kutosha",
      "Rahisi kutumika na kusafisha",
      "Yanafaa kwa mkaa hai (bio-charcoal)",
    ],
    image: { file: "product-stove.jpg", alt: "Jiko la chuma la mkaa lenye mwali wa moto juu yake" },
    sortOrder: 20,
  },
  {
    slug: "mbegu-za-mbono",
    name: "Mbegu za Mbono",
    category: "seeds",
    summary:
      "Mbegu bora za mti wa mbono (Jatropha curcas) kwa wakulima wanaotaka kuanza kilimo cha mti huu.",
    features: [
      "Mbegu zenye uhai wa juu na uzalishaji mzuri, kuanzia kilo 1",
      "Unaweza kupandwa kama ukuta wa miti",
      "Matunda yake yanatumika kutengeneza mkaa na mafuta",
    ],
    image: { file: "product-seeds.jpg", alt: "Mbegu za mbono zilizorundikwa pamoja" },
    sortOrder: 30,
  },
  {
    slug: "mboji-mbolea-asilia",
    name: "Mboji (Mbolea Asilia)",
    category: "manure",
    summary:
      "Mbolea asilia kutokana na mabaki ya mchakato wa mkaa, yenye virutubisho vya mimea kwa mazao bora.",
    features: [
      "Ina Nitrogen, Phosphorus na Potassium",
      "Inaboresha udongo na uimara wa mimea",
      "Salama kwa mazingira na afya ya binadamu",
      "Inafaa kwa mazao yote ya chakula",
    ],
    // The old photo showed another company's packaged product. Do not publish a photo until the owner supplies one.
    image: null,
    sortOrder: 40,
  },
];

export type SeedGalleryItem = {
  title: string;
  description: string;
  category: "product" | "production" | "delivery" | "community";
  image: { file: string; alt: string };
  sortOrder: number;
};

export const SEED_GALLERY: SeedGalleryItem[] = [
  {
    title: "Mkaa Safi wa Kisasa",
    description: "Mkaa unaotokana na matunda ya mbono.",
    category: "product",
    image: { file: "product-charcoal.jpg", alt: "Vipande vya mkaa mweusi vinavyowaka kwa moto mwekundu" },
    sortOrder: 10,
  },
  {
    title: "Majiko ya Ufanisi",
    description: "Jiko linalotumia mkaa wetu kwa ufanisi.",
    category: "product",
    image: { file: "product-stove.jpg", alt: "Jiko la chuma la mkaa lenye mwali wa moto juu yake" },
    sortOrder: 20,
  },
  {
    title: "Mbegu za Mbono",
    description: "Mbegu za mti wa mbono (Jatropha curcas).",
    category: "product",
    image: { file: "product-seeds.jpg", alt: "Mbegu za mbono zilizorundikwa pamoja" },
    sortOrder: 30,
  },
  {
    title: "Mchakato wa Uzalishaji",
    description: "Mtambo wa uzalishaji wa mkaa.",
    category: "production",
    image: { file: "gallery-production.jpg", alt: "Mtambo wa buluu ndani ya jengo la kiwanda" },
    sortOrder: 40,
  },
];

/** Contact details from the old website. Social links and impact statistics are intentionally absent. */
export const SEED_SETTINGS: Record<string, string> = {
  "contact.phone": "+255 758 730 108",
  "contact.whatsapp": "255758730108",
  "contact.email": "info@mnyala.co.tz",
  "contact.address": "Mbeya, Tanzania",
  "contact.hours": "Jumatatu - Jumamosi, 08:00 - 17:00",
  "site.tagline": "Producing Eco-Friendly Charcoal From Natural Fruits",
};
