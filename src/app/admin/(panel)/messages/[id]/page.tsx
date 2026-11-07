import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { MarkReadOnOpen } from "@/components/admin/mark-read-on-open";
import { Badge, Notice, PageHeader } from "@/components/admin/ui";
import { SubmitButton } from "@/components/ui/submit-button";
import { buttonClasses } from "@/components/ui/button";
import { mailtoLink, telLink, whatsappLink } from "@/lib/contact-links";
import { formatDateTime } from "@/lib/format";
import { MESSAGE_SUBJECT } from "@/messages/sw";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { deleteMessagesAction, setMessageRepliedAction } from "@/server/actions/messages";
import { getDb } from "@/server/db/client";
import { getMessage, statusOf } from "@/server/services/messages-admin";

export const metadata: Metadata = { title: "Message" };

const NOTICES: Record<string, string> = { replied: "Marked as replied.", unreplied: "Marked as not replied." };

export default async function MessagePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ notice?: string }> }) {
  const { id } = await params;
  const { user } = await requirePageRole("staff", `/admin/messages/${id}`);
  const m = await getMessage(getDb(), id);
  if (!m) notFound();
  const { notice } = await searchParams;
  const status = statusOf(m);
  const waDigits = m.phone?.replace(/\D/g, "");

  return (
    <>
      <MarkReadOnOpen id={m.id} unread={!m.isRead} />
      <p className="mb-3 text-sm">
        <Link href="/admin/messages">&larr; All messages</Link>
      </p>
      <PageHeader
        title={MESSAGE_SUBJECT[m.subject]}
        description={`From ${m.fullName}, ${formatDateTime(m.createdAt)}`}
        actions={status === "replied" ? <Badge tone="success">Replied</Badge> : status === "unread" ? <Badge tone="warning">New</Badge> : <Badge>Read</Badge>}
      />
      <Notice notices={NOTICES} code={notice} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-label="Message" className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">{m.body}</p>
        </section>

        <aside className="space-y-6">
          <section aria-label="Sender">
            <h2 className="text-lg font-semibold">Sender</h2>
            <dl className="mt-3 space-y-3">
              <div>
                <dt className="text-sm text-muted">Name</dt>
                <dd className="font-semibold">{m.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Email</dt>
                <dd className="break-all">
                  <a href={mailtoLink(m.email)} className="font-semibold">
                    {m.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Phone</dt>
                <dd>
                  {m.phone ? (
                    <a href={telLink(m.phone)} className="font-semibold">
                      {m.phone}
                    </a>
                  ) : (
                    <span className="text-muted">Not given</span>
                  )}
                </dd>
              </div>
              {m.productName ? (
                <div>
                  <dt className="text-sm text-muted">Asked about</dt>
                  <dd className="font-semibold">{m.productName}</dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section aria-label="Reply" className="space-y-3">
            <h2 className="text-lg font-semibold">Reply</h2>
            <a href={mailtoLink(m.email, `Re: ${MESSAGE_SUBJECT[m.subject]}`)} className={`${buttonClasses("primary")} w-full`}>
              Reply by email
            </a>
            {waDigits ? (
              <a
                href={whatsappLink(waDigits, `Habari ${m.fullName}, asante kwa kuwasiliana na Mnyala.`)}
                className={`${buttonClasses("secondary")} w-full`}
              >
                Reply on WhatsApp
              </a>
            ) : null}
            <form action={setMessageRepliedAction}>
              <input type="hidden" name="id" value={m.id} />
              <input type="hidden" name="replied" value={m.repliedAt ? "0" : "1"} />
              <SubmitButton variant="secondary" className="w-full">
                {m.repliedAt ? "Mark as not replied" : "Mark as replied"}
              </SubmitButton>
            </form>
            {m.repliedAt ? <p className="text-sm text-muted">Replied on {formatDateTime(m.repliedAt)}.</p> : null}
          </section>

          {hasRole(user.role, "admin") ? (
            <section aria-label="Delete">
              <ConfirmAction
                action={deleteMessagesAction}
                triggerLabel="Delete this message"
                title={`Delete the message from ${m.fullName}?`}
                description="It will be removed permanently. This cannot be undone."
                confirmLabel="Delete message"
                fields={{ ids: m.id, back: "/admin/messages" }}
                size="md"
                triggerClassName="w-full"
              />
            </section>
          ) : null}
        </aside>
      </div>
    </>
  );
}
