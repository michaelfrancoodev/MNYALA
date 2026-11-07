"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  orderInputSchema,
  type OrderInput,
  type OrderItemInput,
} from "@/lib/validators/order";
import { audit } from "@/server/services/audit";
import {
  createOrder,
  deleteOrder,
  OrderRuleError,
  reopenOrder,
  transitionOrderStatus,
  updateOrderItems,
  type OrderStatus,
} from "@/server/services/orders-admin";
import { authorize, fieldErrorsFrom, formValue, runAdminAction, type ActionState } from "./core";

function refreshCounts() {
  revalidatePath("/admin", "layout");
}

export async function createOrderAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("staff", async (ctx): Promise<ActionState> => {
    // Parse JSON items payload from form
    let rawItems: OrderItemInput[] = [];
    try {
      const itemsJson = formValue(fd, "itemsJson");
      rawItems = JSON.parse(itemsJson || "[]");
    } catch {
      return { ok: false, message: "Invalid items format." };
    }

    const payload = {
      customerId: formValue(fd, "customerId"),
      source: formValue(fd, "source") as OrderInput["source"],
      messageId: formValue(fd, "messageId") || null,
      deliveryAddress: formValue(fd, "deliveryAddress") || null,
      notes: formValue(fd, "notes") || null,
      items: rawItems,
    };

    const parsed = orderInputSchema.safeParse(payload);
    if (!parsed.success) {
      return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues) };
    }

    let order;
    try {
      order = await createOrder(ctx.db, { input: parsed.data, userId: ctx.user.id });
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "order.created",
        entityType: "order",
        entityId: order.id,
        details: { code: order.code, totalTzs: order.totalTzs, customerId: order.customerId },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
      refreshCounts();
    } catch (error) {
      if (error instanceof OrderRuleError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }

    redirect(`/admin/orders/${order.id}?notice=created` as Route);
  });
}

export async function updateOrderItemsAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("staff", async (ctx): Promise<ActionState> => {
    const id = formValue(fd, "id");
    let rawItems: OrderItemInput[] = [];
    try {
      const itemsJson = formValue(fd, "itemsJson");
      rawItems = JSON.parse(itemsJson || "[]");
    } catch {
      return { ok: false, message: "Invalid items format." };
    }

    try {
      const updated = await updateOrderItems(ctx.db, {
        id,
        items: rawItems,
        deliveryAddress: formValue(fd, "deliveryAddress") || null,
        notes: formValue(fd, "notes") || null,
      });

      if (!updated) return { ok: false, message: "Order not found." };

      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "order.items_updated",
        entityType: "order",
        entityId: id,
        details: { code: updated.code, newTotalTzs: updated.totalTzs },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
      refreshCounts();
    } catch (error) {
      if (error instanceof OrderRuleError) {
        return { ok: false, message: error.message };
      }
      throw error;
    }

    redirect(`/admin/orders/${id}?notice=updated` as Route);
  });
}

export async function transitionOrderStatusAction(fd: FormData): Promise<void> {
  const ctx = await authorize("staff");
  const id = formValue(fd, "id");
  const targetStatus = formValue(fd, "status") as OrderStatus;

  try {
    const updated = await transitionOrderStatus(ctx.db, { id, targetStatus });
    if (updated) {
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: `order.status_${targetStatus}`,
        entityType: "order",
        entityId: id,
        details: { code: updated.code, status: targetStatus },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
      refreshCounts();
    }
  } catch (error) {
    if (error instanceof OrderRuleError) {
      redirect(`/admin/orders/${id}?notice=rule-error` as Route);
    }
    throw error;
  }

  redirect(`/admin/orders/${id}?notice=status-${targetStatus}` as Route);
}

export async function reopenOrderAction(fd: FormData): Promise<void> {
  const ctx = await authorize("super_admin");
  const id = formValue(fd, "id");
  const reason = formValue(fd, "reason");

  try {
    const updated = await reopenOrder(ctx.db, { id, reason });
    if (updated) {
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "order.reopened",
        entityType: "order",
        entityId: id,
        details: { code: updated.code, reason },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
      refreshCounts();
    }
  } catch (error) {
    if (error instanceof OrderRuleError) {
      redirect(`/admin/orders/${id}?notice=reopen-failed` as Route);
    }
    throw error;
  }

  redirect(`/admin/orders/${id}?notice=reopened` as Route);
}

export async function deleteOrderAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  const id = formValue(fd, "id");
  const result = await deleteOrder(ctx.db, id);

  if (result === "invalid_status") {
    redirect(`/admin/orders/${id}?notice=cannot-delete-active` as Route);
  }
  if (result === "deleted") {
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "order.deleted",
      entityType: "order",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    refreshCounts();
  }
  redirect("/admin/orders?notice=deleted" as Route);
}
