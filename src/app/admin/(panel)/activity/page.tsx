import type { Metadata } from "next";
import { Badge, DataTable, EmptyState, PageHeader, Pagination, SearchBox, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { formatDateTime } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { ACTIVITY_PAGE_SIZE, listActivityLogsAdmin } from "@/server/services/activity-admin";

export const metadata: Metadata = { title: "Activity Log" };

export default async function ActivityLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("super_admin", "/admin/activity");
  const raw = await searchParams;
  const page = Number(raw.page) || 1;
  const q = raw.q || "";

  const db = getDb();
  const list = await listActivityLogsAdmin(db, { q, page });

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/admin/activity?${s}` : "/admin/activity";
  };

  return (
    <>
      <PageHeader
        title="Activity Log"
        description="Immutable audit trail of administrative actions, user logins, and order updates."
      />

      <div className="mb-4">
        <SearchBox action="/admin/activity" defaultValue={q} placeholder="Filter by action (e.g. order, user, login)..." />
      </div>

      {list.total === 0 ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <>
          <DataTable label="Activity logs">
            <THead>
              <Th>Timestamp (EAT)</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Details / IP</Th>
            </THead>
            <TBody>
              {list.items.map((log) => (
                <Tr key={log.id}>
                  <Td label="Timestamp">
                    <span className="text-xs text-muted font-mono">{formatDateTime(log.createdAt)}</span>
                  </Td>
                  <Td label="Actor">
                    <div>
                      <p className="font-semibold text-sm text-ink">{log.userName || "System / Guest"}</p>
                      {log.userEmail ? <p className="text-xs text-muted font-mono">{log.userEmail}</p> : null}
                    </div>
                  </Td>
                  <Td label="Action">
                    <Badge tone={log.action.includes("deleted") ? "danger" : log.action.includes("created") ? "success" : "neutral"}>
                      {log.action}
                    </Badge>
                  </Td>
                  <Td label="Entity">
                    <span className="text-xs font-mono text-muted">
                      {log.entityType ? `${log.entityType}${log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}` : "—"}
                    </span>
                  </Td>
                  <Td label="Details / IP">
                    <div className="text-xs space-y-1">
                      {log.details ? (
                        <p className="font-mono text-ink-soft bg-paper px-1.5 py-0.5 rounded truncate max-w-sm">
                          {JSON.stringify(log.details)}
                        </p>
                      ) : null}
                      {log.ip ? <p className="text-muted font-mono text-[11px]">IP: {log.ip}</p> : null}
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>

          <Pagination page={list.page} pages={list.pages} total={list.total} pageSize={ACTIVITY_PAGE_SIZE} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}
