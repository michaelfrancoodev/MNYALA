"use server";

import type { Route } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { audit } from "@/server/services/audit";
import { cleanIds, deleteMessages, setRead, setReplied } from "@/server/services/messages-admin";
import { authorize, formValue } from "./core";

/** Where to go back to: only a list address inside /admin/messages, with its filters. */
function backTo(fd: FormData): string {
  const back = formValue(fd, "back");
  const ok = back === "/admin/messages" || back.startsWith("/admin/messages?");
  return ok && !back.includes("..") && !/[\\\u0000-\u001f]/.test(back) ? back.split("#")[0]! : "/admin/messages";
}

function withNotice(path: string, code: string): Route {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}notice=${code}` as Route;
}

function refreshCounts() {
  revalidatePath("/admin", "layout");
}

/** Mark the ticked messages as read or unread. */
export async function markMessagesAction(fd: FormData): Promise<void> {
  const ctx = await authorize("staff");
  const ids = cleanIds(fd.getAll("ids"));
  const back = backTo(fd);
  if (ids.length === 0) redirect(withNotice(back, "none-selected"));
  const read = formValue(fd, "op") === "read";
  await setRead(ctx.db, ids, read);
  refreshCounts();
  redirect(withNotice(back, read ? "marked-read" : "marked-unread"));
}

/** Called by the message page itself when it opens, so unread counts stay honest. */
export async function markMessageReadOnOpenAction(id: string): Promise<void> {
  const ctx = await authorize("staff");
  await setRead(ctx.db, [id], true);
  refreshCounts();
}

export async function setMessageRepliedAction(fd: FormData): Promise<void> {
  const ctx = await authorize("staff");
  const id = formValue(fd, "id");
  const replied = formValue(fd, "replied") === "1";
  await setReplied(ctx.db, id, replied);
  refreshCounts();
  redirect(`/admin/messages/${id}?notice=${replied ? "replied" : "unreplied"}` as Route);
}

/** Admins and super admins only. Deleting is permanent, so it is always recorded. */
export async function deleteMessagesAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  const ids = cleanIds(fd.getAll("ids"));
  const back = backTo(fd);
  if (ids.length === 0) redirect(withNotice(back, "none-selected"));
  const deleted = await deleteMessages(ctx.db, ids);
  await audit(ctx.db, { userId: ctx.user.id, action: "message.deleted", entityType: "message", details: { count: deleted }, ip: ctx.ip, userAgent: ctx.userAgent });
  refreshCounts();
  redirect(withNotice(back, "deleted"));
}
