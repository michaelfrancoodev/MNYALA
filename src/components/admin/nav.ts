import type { Role } from "@/server/auth/roles";

export type NavItem = { href: string; label: string; min: Role; count?: "messages" | "orders" };
export type NavGroup = { label?: string; items: NavItem[] };

/** Only pages that exist are listed. Add an entry in the same change that adds the page. */
export const NAV: NavGroup[] = [
  {
    items: [
      { href: "/admin", label: "Dashboard", min: "staff" },
      { href: "/admin/messages", label: "Messages", min: "staff", count: "messages" },
      { href: "/admin/orders", label: "Orders", min: "staff", count: "orders" },
      { href: "/admin/customers", label: "Customers", min: "staff" },
      { href: "/admin/products", label: "Products", min: "staff" },
      { href: "/admin/gallery", label: "Gallery", min: "admin" },
      { href: "/admin/reports", label: "Reports", min: "admin" },
      { href: "/admin/users", label: "Users", min: "super_admin" },
      { href: "/admin/activity", label: "Activity", min: "super_admin" },
      { href: "/admin/settings", label: "Settings", min: "staff" },
    ],
  },
];
