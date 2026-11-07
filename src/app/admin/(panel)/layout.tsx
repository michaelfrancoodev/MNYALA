import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { safeNextPath } from "@/lib/validators/auth";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { unreadCount } from "@/server/services/messages-admin";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const requested = safeNextPath((await headers()).get("x-pathname"));
  const { user } = await requirePageRole("staff", requested ?? undefined);
  const messages = await unreadCount(getDb());
  return (
    <AdminShell user={user} counts={{ messages }}>
      {children}
    </AdminShell>
  );
}
