"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { customerSchema } from "@/lib/validators/customer";
import { audit } from "@/server/services/audit";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/server/services/customers-admin";
import { authorize, fieldErrorsFrom, formValue, runAdminAction, type ActionState } from "./core";

const FIELDS = ["name", "phone", "email", "address", "notes"];

export async function saveCustomerAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("staff", async (ctx): Promise<ActionState> => {
    const values = Object.fromEntries(FIELDS.map((k) => [k, formValue(fd, k)]));
    const parsed = customerSchema.safeParse(values);
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values };

    const id = formValue(fd, "id");
    let resultId = id;
    if (id) {
      const updated = await updateCustomer(ctx.db, id, parsed.data);
      if (!updated) return { ok: false, message: "That customer no longer exists.", values };
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "customer.updated",
        entityType: "customer",
        entityId: id,
        details: { name: updated.name },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
    } else {
      const created = await createCustomer(ctx.db, { input: parsed.data, userId: ctx.user.id });
      resultId = created.id;
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "customer.created",
        entityType: "customer",
        entityId: created.id,
        details: { name: created.name },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
    }

    redirect(`/admin/customers/${resultId}?notice=${id ? "saved" : "created"}` as Route);
  });
}

export async function deleteCustomerAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  const id = formValue(fd, "id");
  const result = await deleteCustomer(ctx.db, id);

  if (result === "has_orders") {
    redirect(`/admin/customers/${id}?notice=has-orders` as Route);
  }
  if (result === "deleted") {
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "customer.deleted",
      entityType: "customer",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }
  redirect("/admin/customers?notice=deleted" as Route);
}
