import type { Metadata } from "next";
import Link from "next/link";
import type { Route } from "next";
import { z } from "zod";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { SelectAll } from "@/components/admin/select-all";
import { Badge, DataTable, EmptyState, LinkTabs, Notice, PageHeader, Pagination, SearchBox, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/format";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { deleteMessagesAction, markMessagesAction } from "@/server/actions/messages";
import { getDb } from "@/server/db/client";
import { MESSAGE_TABS, MESSAGES_PAGE_SIZE, listMessages, messageCounts, statusOf, type MessageTab } from "@/server/services/messages-admin";

export const metadata: Metadata = { title: "Messages" };

const params = z.object({
  tab: z.enum(MESSAGE_TABS).catch("all"),
  q: z.string().trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
});

const NOTICES: Record<string, string> = {
  "marked-read": "Marked as read.",
  "marked-unread": "Marked as unread.",
  deleted: "Messages deleted.",
  "none-selected": "Tick at least one message first.",
};

const TAB_LABEL: Record<MessageTab, string> = { all: "All", unread: "Unread", read: "Read", replied: "Replied" };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { user } = await requirePageRole("staff", "/admin/messages");
  const raw = await searchParams;
  const { tab, q, page: requested } = params.parse({ tab: raw.tab, q: raw.q, page: raw.page });
  const db = getDb();
  const [list, counts] = await Promise.all([listMessages(db, { tab, q, page: requested }), messageCounts(db)]);
  const canDelete = hasRole(user.role, "admin");

  const href = (over: { tab?: MessageTab; page?: number }) => {
    const sp = new URLSearchParams();
    const t = over.tab ?? tab;
    if (t !== "all") sp.set("tab", t);
    if (q) sp.set("q", q);
    if ((over.page ?? 1) > 1) sp.set("page", String(over.page));
    const s = sp.toString();
    return s ? `/admin/messages?${s}` : "/admin/messages";
  };
  const here = href({ page: list.page });

  return (
    <>
      <PageHeader title="Messages" description="Messages sent from the contact form on the website." />
      <Notice notices={NOTICES} code={raw.notice} />

      <LinkTabs
        label="Filter messages"
        items={MESSAGE_TABS.map((t) => ({ href: href({ tab: t }), label: TAB_LABEL[t], count: counts[t], active: tab === t }))}
      />

      <div className="mb-4">
        <SearchBox action="/admin/messages" defaultValue={q} placeholder="Name, email, phone or words in the message" hidden={tab !== "all" ? { tab } : {}} />
      </div>

      {list.total === 0 ? (
        counts.all === 0 ? (
          <EmptyState title="No messages yet">When someone writes to you through the website, it will appear here.</EmptyState>
        ) : (
          <EmptyState title="Nothing matches">
            Try a different word or <Link href="/admin/messages">clear the filters</Link>.
          </EmptyState>
        )
      ) : (
        <>
          <form id="bulk" action={markMessagesAction} className="space-y-3">
            <input type="hidden" name="back" value={here} />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" name="op" value="read" variant="secondary" size="sm">
                Mark as read
              </Button>
              <Button type="submit" name="op" value="unread" variant="secondary" size="sm">
                Mark as unread
              </Button>
              {canDelete ? (
                <ConfirmAction
                  action={deleteMessagesAction}
                  targetForm="bulk"
                  triggerLabel="Delete ticked"
                  title="Delete the ticked messages?"
                  description="They will be removed permanently. This cannot be undone."
                  confirmLabel="Delete messages"
                  fields={{ back: here }}
                />
              ) : null}
            </div>

            <DataTable label="Messages">
              <THead>
                <Th className="w-12">
                  <SelectAll name="ids" />
                </Th>
                <Th>From</Th>
                <Th>About</Th>
                <Th>Message</Th>
                <Th>Received</Th>
                <Th>Status</Th>
              </THead>
              <TBody>
                {list.rows.map((m) => {
                  const status = statusOf(m);
                  return (
                    <Tr key={m.id} unread={status === "unread"}>
                      <Td label="Select" className="md:w-12">
                        <input type="checkbox" name="ids" value={m.id} aria-label={`Select message from ${m.fullName}`} className="size-5 accent-[#2d7a3e]" />
                      </Td>
                      <Td label="From">
                        <Link href={`/admin/messages/${m.id}` as Route} className={status === "unread" ? "font-semibold" : ""}>
                          {m.fullName}
                        </Link>
                        <span className="block text-sm text-muted">{m.email}</span>
                      </Td>
                      <Td label="About">{MESSAGE_SUBJECT[m.subject]}</Td>
                      <Td label="Message" className="md:max-w-sm">
                        <span className="line-clamp-2 text-ink-soft">{m.preview}</span>
                      </Td>
                      <Td label="Received" className="md:whitespace-nowrap">
                        {formatDateTime(m.createdAt)}
                      </Td>
                      <Td label="Status">
                        {status === "unread" ? <Badge tone="warning">New</Badge> : status === "replied" ? <Badge tone="success">Replied</Badge> : <Badge>Read</Badge>}
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </DataTable>
          </form>
          <Pagination page={list.page} pages={list.pages} total={list.total} pageSize={MESSAGES_PAGE_SIZE} hrefFor={(p) => href({ page: p })} />
        </>
      )}
    </>
  );
}
