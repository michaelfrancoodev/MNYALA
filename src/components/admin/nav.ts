import type { Role } from "@/server/auth/roles";

export type NavItem = { href: string; label: string; labelSw: string; min: Role; count?: "messages" | "orders" };
export type NavGroup = { label?: string; labelSw?: string; items: NavItem[] };

/** Only pages that exist are listed. Add an entry in the same change that adds the page. */
export const NAV: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", labelSw: "Dashibodi", min: "staff" },
      { href: "/admin/messages", label: "Messages", labelSw: "Ujumbe", min: "staff", count: "messages" },
      { href: "/admin/orders", label: "Orders", labelSw: "Maagizo", min: "staff", count: "orders" },
      { href: "/admin/customers", label: "Customers", labelSw: "Wateja", min: "staff" },
      { href: "/admin/products", label: "Products", labelSw: "Bidhaa", min: "staff" },
      { href: "/admin/gallery", label: "Gallery", labelSw: "Picha za Miradi", min: "admin" },
      { href: "/admin/reports", label: "Reports", labelSw: "Ripoti & Mauzo", min: "admin" },
      { href: "/admin/users", label: "Users", labelSw: "Watumiaji", min: "super_admin" },
      { href: "/admin/activity", label: "Activity Log", labelSw: "Kumbukumbu", min: "super_admin" },
      { href: "/admin/settings", label: "Settings", labelSw: "Mipangilio", min: "staff" },
    ],
  },
];
