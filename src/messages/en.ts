/** English translations for public site and admin interfaces. */

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/kuhusu", label: "About Us" },
  { href: "/bidhaa", label: "Products" },
  { href: "/picha", label: "Gallery" },
  { href: "/wasiliana", label: "Contact Us" },
] as const;

export const PRODUCT_CATEGORY: Record<"charcoal" | "stove" | "seeds" | "manure", string> = {
  charcoal: "Bio-Charcoal",
  stove: "Cookstoves",
  seeds: "Jatropha Seeds",
  manure: "Organic Compost",
};

export const GALLERY_CATEGORY: Record<"product" | "production" | "delivery" | "community", string> = {
  product: "Products",
  production: "Manufacturing",
  delivery: "Logistics & Delivery",
  community: "Community & Reforestation",
};

export const MESSAGE_SUBJECT: Record<"mkaa" | "majiko" | "mbegu" | "mboji" | "jumla" | "nyingine", string> = {
  mkaa: "Inquire about Bio-Charcoal",
  majiko: "Inquire about Cookstoves",
  mbegu: "Inquire about Jatropha Seeds",
  mboji: "Inquire about Organic Compost",
  jumla: "Wholesale & Bulk Supply",
  nyingine: "General Inquiry",
};

export const COMMON = {
  skip: "Skip to content",
  menu: "Menu",
  close: "Close",
  call: "Call Us",
  whatsapp: "WhatsApp",
  contactUs: "Contact Us",
  seeProducts: "View Products",
  priceOnRequest: "Price on Request",
  orderNow: "Order Now",
  askOnWhatsapp: "Ask on WhatsApp",
  staff: "Staff Portal",
  rights: "All rights reserved.",
  privacy: "Privacy Policy",
  notFoundTitle: "Page Not Found",
  notFoundText: "The address you entered does not exist or has been moved. Return to the home page or browse our products.",
  errorTitle: "Something went wrong",
  errorText: "We could not load this page. Please try again or call our customer service.",
  tryAgain: "Try Again",
  backHome: "Back to Home",
} as const;

export const ADMIN = {
  dashboard: "Dashboard",
  messages: "Messages",
  orders: "Orders",
  customers: "Customers",
  products: "Products",
  gallery: "Gallery",
  reports: "Reports",
  users: "Users",
  activity: "Activity Log",
  settings: "Settings",
  logout: "Sign Out",
  portalTitle: "Admin Portal",
  online: "Online",
  viewSite: "Visit Website",
} as const;
