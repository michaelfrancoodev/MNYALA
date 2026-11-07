import type { Role } from "@/server/auth/roles";

export type NavItem = { href: string; label: string; min: Role; count?: "messages" | "orders" };
export type NavGroup = { label?: string; items: NavItem[] };

/** Only pages that exist are listed. Add an entry in the same change that adds the page. */
export const NAV: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", min: "staff" },
      { href: "/admin/messages", label: "Messages", min: "staff", count: "messages" },
      { href: "/admin/products", label: "Products", min: "staff" },
      { href: "/admin/gallery", label: "Gallery", min: "admin" },
    ],
  },
];
