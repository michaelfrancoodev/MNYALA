import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Badge, DataTable, Notice, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatDateTime, formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import {
  deleteOrderAction,
  reopenOrderAction,
  transitionOrderStatusAction,
} from "@/server/actions/orders";
import { getDb } from "@/server/db/client";
import { getOrderAdmin } from "@/server/services/orders-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  return { title: order ? `Order ${order.code}` : "Order" };
}

const NOTICES: Record<string, string> = {
  created: "Order created successfully.",
  updated: "Order items updated successfully.",
  "status-confirmed": "Order confirmed.",
  "status-in_delivery": "Order marked as out for delivery.",
  "status-completed": "Order marked as completed and paid.",
  "status-cancelled": "Order cancelled.",
  reopened: "Order reopened successfully by super admin.",
  "rule-error": "That status transition is not allowed.",
  "cannot-delete-active": "Active orders cannot be deleted. Cancel the order first.",
};

const STATUS_TONES: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  new: "info",
  confirmed: "warning",
  in_delivery: "warning",
  completed: "success",
  cancelled: "danger",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requirePageRole("staff", "/admin/orders");
  const { id } = await params;
  const raw = await searchParams;
  const db = getDb();
  const order = await getOrderAdmin(db, id);
  if (!order) notFound();

  const canEditItems = order.status === "new" || order.status === "confirmed";
  const canDelete = hasRole(user.role, "admin") && (order.status === "new" || order.status === "cancelled");
  const isSuperAdmin = user.role === "super_admin";

  return (
    <>
      <PageHeader
        title={`Order ${order.code}`}
        description={`Placed on ${formatDateTime(order.createdAt)} via ${order.source.replace("_", " ")}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/orders/${order.id}/print`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
            >
              Print Invoice / Receipt &rarr;
            </Link>

            {canEditItems ? (
              <Link
                href={`/admin/orders/${order.id}/edit`}
                className="inline-flex min-h-11 items-center rounded-md border border-line-strong bg-paper px-4 font-semibold text-ink no-underline hover:bg-surface"
              >
                Edit Items
              </Link>
            ) : null}

            {canDelete ? (
              <ConfirmAction
                action={deleteOrderAction}
                triggerLabel="Delete Order"
                title={`Delete Order ${order.code}?`}
                description="This order record will be permanently deleted from the system."
                confirmLabel="Delete permanently"
                fields={{ id: order.id }}
              />
            ) : null}
          </div>
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />

      {/* Status banner and workflow controls */}
      <div className="mb-6 rounded-lg border border-line bg-surface p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-muted">Current Status:</span>
          <Badge tone={STATUS_TONES[order.status] ?? "neutral"}>{order.status.replace("_", " ").toUpperCase()}</Badge>
          {order.completedAt ? (
            <span className="text-xs text-muted">Completed at {formatDateTime(order.completedAt)}</span>
          ) : null}
          {order.cancelledAt ? (
            <span className="text-xs text-danger">Cancelled at {formatDateTime(order.cancelledAt)}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {order.status === "new" ? (
            <>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="confirmed" />
                <Button type="submit" variant="primary" size="sm">
                  Confirm Order
                </Button>
              </form>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="cancelled" />
                <Button type="submit" variant="danger" size="sm">
                  Cancel Order
                </Button>
              </form>
            </>
          ) : null}

          {order.status === "confirmed" ? (
            <>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="in_delivery" />
                <Button type="submit" variant="primary" size="sm">
                  Dispatch / In Delivery
                </Button>
              </form>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="cancelled" />
                <Button type="submit" variant="danger" size="sm">
                  Cancel Order
                </Button>
              </form>
            </>
          ) : null}

          {order.status === "in_delivery" ? (
            <>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="completed" />
                <Button type="submit" variant="primary" size="sm">
                  Mark as Delivered & Paid
                </Button>
              </form>
              <form action={transitionOrderStatusAction} className="inline-flex">
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="status" value="cancelled" />
                <Button type="submit" variant="danger" size="sm">
                  Cancel Order
                </Button>
              </form>
            </>
          ) : null}

          {order.status === "completed" && isSuperAdmin ? (
            <ConfirmAction
              action={reopenOrderAction}
              triggerLabel="Reopen Order"
              title={`Reopen Order ${order.code}?`}
              description="Super admin action: this will return the order to 'confirmed' status. Enter a clear reason."
              confirmLabel="Reopen Order"
              fields={{ id: order.id, reason: "Administrative adjustment requested" }}
            />
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mb-8">
        <div className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Customer Details</h2>
          <div>
            <p className="text-xs text-muted">Name</p>
            <Link href={`/admin/customers/${order.customerId}`} className="font-semibold text-ink hover:underline">
              {order.customerName}
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted">Phone</p>
            <p className="font-mono text-sm text-ink">{order.customerPhone || "None"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Email</p>
            <p className="text-sm text-ink">{order.customerEmail || "None"}</p>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-5 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Delivery & Notes</h2>
          <div>
            <p className="text-xs text-muted">Delivery Address</p>
            <p className="text-sm text-ink">{order.deliveryAddress || "Standard customer address / None"}</p>
          </div>
          <div>
            <p className="text-xs text-muted">Internal Notes</p>
            <p className="text-sm text-ink whitespace-pre-wrap">{order.notes || "None"}</p>
          </div>
          {order.messageId ? (
            <div>
              <p className="text-xs text-muted">Linked Website Message</p>
              <Link href={`/admin/messages/${order.messageId}`} className="text-xs font-semibold text-brand hover:underline">
                View original inquiry &rarr;
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">Line Items ({order.items.length})</h2>

      <DataTable label="Order line items">
        <THead>
          <Th>#</Th>
          <Th>Item Description</Th>
          <Th>Quantity</Th>
          <Th>Unit Price</Th>
          <Th className="text-right">Line Total</Th>
        </THead>
        <TBody>
          {order.items.map((it, idx) => (
            <Tr key={it.id}>
              <Td label="#">
                <span className="text-xs text-muted">{idx + 1}</span>
              </Td>
              <Td label="Item Description">
                <span className="font-semibold text-ink">{it.nameSnapshot}</span>
              </Td>
              <Td label="Quantity">
                <span className="text-sm">{it.quantity}</span>
              </Td>
              <Td label="Unit Price">
                <span className="text-sm">{formatTzs(it.unitPriceTzs)}</span>
              </Td>
              <Td label="Line Total" className="text-right">
                <span className="font-semibold text-sm">{formatTzs(it.lineTotalTzs)}</span>
              </Td>
            </Tr>
          ))}
        </TBody>
      </DataTable>

      <div className="mt-4 flex justify-end">
        <div className="rounded-lg border border-line bg-surface p-4 text-right min-w-64">
          <p className="text-xs text-muted uppercase font-semibold">Total Order Amount</p>
          <p className="text-3xl font-bold text-brand-dark mt-1">{formatTzs(order.totalTzs)}</p>
        </div>
      </div>
    </>
  );
}
