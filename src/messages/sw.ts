/** Every word the public site shows that is not content from the database. Kiswahili. */

export const NAV = [
  { href: "/", label: "Mwanzo" },
  { href: "/kuhusu", label: "Kuhusu sisi" },
  { href: "/bidhaa", label: "Bidhaa" },
  { href: "/picha", label: "Picha" },
  { href: "/wasiliana", label: "Wasiliana" },
] as const;

export const PRODUCT_CATEGORY: Record<"charcoal" | "stove" | "seeds" | "manure", string> = {
  charcoal: "Mkaa",
  stove: "Majiko",
  seeds: "Mbegu",
  manure: "Mboji",
};

export const GALLERY_CATEGORY: Record<"product" | "production" | "delivery" | "community", string> = {
  product: "Bidhaa",
  production: "Uzalishaji",
  delivery: "Usafirishaji",
  community: "Jamii",
};

/** Subject choices on the contact form, and how an admin reads them. */
export const MESSAGE_SUBJECT: Record<"mkaa" | "majiko" | "mbegu" | "mboji" | "jumla" | "nyingine", string> = {
  mkaa: "Nahitaji mkaa",
  majiko: "Nahitaji majiko",
  mbegu: "Nahitaji mbegu",
  mboji: "Nahitaji mboji (mbolea)",
  jumla: "Nahitaji kwa kiwango kikubwa",
  nyingine: "Jambo lingine",
};

export const COMMON = {
  skip: "Ruka hadi maudhui",
  menu: "Menyu",
  close: "Funga",
  call: "Piga simu",
  whatsapp: "WhatsApp",
  contactUs: "Wasiliana nasi",
  seeProducts: "Angalia bidhaa",
  priceOnRequest: "Wasiliana kwa bei",
  orderNow: "Agiza sasa",
  askOnWhatsapp: "Uliza kwa WhatsApp",
  staff: "Wafanyakazi",
  rights: "Haki zote zimehifadhiwa.",
  privacy: "Faragha",
  notFoundTitle: "Ukurasa huu haupatikani",
  notFoundText: "Anwani uliyoandika haipo, au ukurasa umehamishwa. Rudi mwanzo au angalia bidhaa zetu.",
  errorTitle: "Samahani, kuna tatizo",
  errorText: "Hatukuweza kuonyesha ukurasa huu. Jaribu tena, au tupigie simu.",
  tryAgain: "Jaribu tena",
  backHome: "Rudi mwanzo",
} as const;
