"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { getEnv } from "@/lib/env";
import { MAX_FILES_PER_UPLOAD } from "@/lib/limits";
import { GALLERY_CATEGORIES, galleryItemSchema } from "@/lib/validators/gallery";
import { audit } from "@/server/services/audit";
import {
  addGalleryImages,
  deleteGalleryItem,
  moveGalleryItem,
  setGalleryPublished,
  updateGalleryItem,
} from "@/server/services/gallery-admin";
import { createLocalStorage } from "@/server/services/storage";
import { authorize, fieldErrorsFrom, formValue, runAdminAction, type ActionState } from "./core";

const storage = () => createLocalStorage(getEnv().STORAGE_DIR);

export async function uploadGalleryAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("admin", async (ctx): Promise<ActionState> => {
    const category = formValue(fd, "category");
    if (!(GALLERY_CATEGORIES as readonly string[]).includes(category)) {
      return { ok: false, fieldErrors: { category: ["Choose a category."] } };
    }

    const picked = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (picked.length === 0) return { ok: false, fieldErrors: { images: ["Choose at least one picture."] } };
    if (picked.length > MAX_FILES_PER_UPLOAD) {
      return { ok: false, fieldErrors: { images: [`Upload at most ${MAX_FILES_PER_UPLOAD} pictures at a time.`] } };
    }

    const files = await Promise.all(picked.map(async (f) => ({ name: f.name, bytes: Buffer.from(await f.arrayBuffer()) })));
    const results = await addGalleryImages(ctx.db, storage(), {
      files,
      category: category as (typeof GALLERY_CATEGORIES)[number],
      published: formValue(fd, "published") === "on",
      userId: ctx.user.id,
      maxBytes: getEnv().MAX_UPLOAD_MB * 1024 * 1024,
    });
    const added = results.filter((r) => r.ok).length;
    const failed = results.filter((r): r is Extract<(typeof results)[number], { ok: false }> => !r.ok);
    if (added > 0) {
      await audit(ctx.db, {
        userId: ctx.user.id,
        action: "gallery.uploaded",
        entityType: "gallery",
        details: { added, failed: failed.length },
        ip: ctx.ip,
        userAgent: ctx.userAgent,
      });
    }
    if (failed.length === 0) redirect(`/admin/gallery?notice=uploaded` as Route);

    const lines = failed.map((f) => `${f.name}: ${f.error}`).join(" ");
    return added > 0
      ? { ok: true, message: `${added} ${added === 1 ? "picture was" : "pictures were"} added. ${failed.length} could not be added. ${lines}` }
      : { ok: false, message: `Nothing was added. ${lines}` };
  });
}

export async function updateGalleryItemAction(_prev: ActionState | null, fd: FormData): Promise<ActionState> {
  return runAdminAction("admin", async (ctx): Promise<ActionState> => {
    const values = Object.fromEntries(["title", "description", "category", "alt", "published"].map((k) => [k, formValue(fd, k)]));
    const parsed = galleryItemSchema.safeParse(values);
    if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error.issues), values };
    const id = formValue(fd, "id");
    if (!(await updateGalleryItem(ctx.db, id, parsed.data))) {
      return { ok: false, message: "That picture no longer exists.", values };
    }
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "gallery.updated",
      entityType: "gallery",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
    redirect("/admin/gallery?notice=saved" as Route);
  });
}

export async function setGalleryPublishedAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  const publish = formValue(fd, "publish") === "1";
  await setGalleryPublished(ctx.db, formValue(fd, "id"), publish);
  redirect(`/admin/gallery?notice=${publish ? "published" : "unpublished"}` as Route);
}

export async function moveGalleryItemAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  await moveGalleryItem(ctx.db, formValue(fd, "id"), formValue(fd, "direction") === "up" ? "up" : "down");
  redirect("/admin/gallery");
}

export async function deleteGalleryItemAction(fd: FormData): Promise<void> {
  const ctx = await authorize("admin");
  const id = formValue(fd, "id");
  if (await deleteGalleryItem(ctx.db, storage(), id)) {
    await audit(ctx.db, {
      userId: ctx.user.id,
      action: "gallery.deleted",
      entityType: "gallery",
      entityId: id,
      ip: ctx.ip,
      userAgent: ctx.userAgent,
    });
  }
  redirect("/admin/gallery?notice=deleted" as Route);
}
