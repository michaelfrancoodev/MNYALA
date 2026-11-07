import { headers } from "next/headers";
import { AdminShell } from "@/components/admin/admin-shell";
import { safeNextPath } from "@/lib/validators/auth";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { unreadCount } from "@/server/services/messages-admin";
import { orderCounts } from "@/server/services/orders-admin";
import { getLocale } from "@/messages/i18n";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const requested = safeNextPath((await headers()).get("x-pathname"));
  const { user } = await requirePageRole("staff", requested ?? undefined);
  const db = getDb();
  const [messages, orders, locale] = await Promise.all([
    unreadCount(db),
    orderCounts(db).then((c) => c.new),
    getLocale(),
  ]);
  return (
    <AdminShell user={user} counts={{ messages, orders }} locale={locale}>
      {children}
    </AdminShell>
  );
}
