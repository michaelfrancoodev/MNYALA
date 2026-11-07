export const ROLES = ["staff", "admin", "super_admin"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = { staff: 1, admin: 2, super_admin: 3 };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** True when `role` is at least `minimum` (staff < admin < super_admin). */
export function hasRole(role: Role, minimum: Role): boolean {
  return RANK[role] >= RANK[minimum];
}

export const ROLE_LABEL: Record<Role, string> = {
  staff: "Staff",
  admin: "Admin",
  super_admin: "Super admin",
};
