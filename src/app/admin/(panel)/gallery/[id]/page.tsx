import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { PageHeader } from "@/components/admin/ui";
import { GalleryEditForm } from "@/components/admin/gallery-edit-form";
import { requirePageRole } from "@/server/auth/guards";
import { deleteGalleryItemAction } from "@/server/actions/gallery";
import { getDb } from "@/server/db/client";
import { getGalleryItem } from "@/server/services/gallery-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const item = await getGalleryItem(db, id);
  return { title: item ? `Edit ${item.title}` : "Gallery Item" };
}

export default async function EditGalleryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("admin", "/admin/gallery");
  const { id } = await params;
  const db = getDb();
  const item = await getGalleryItem(db, id);
  if (!item) notFound();

  return (
    <>
      <PageHeader
        title={`Edit Picture: ${item.title}`}
        description="Update title, description, category, alt text, or delete permanently."
        actions={
          <ConfirmAction
            action={deleteGalleryItemAction}
            triggerLabel="Delete picture"
            title={`Delete "${item.title}"?`}
            description="This will permanently delete this picture from the database and disk. This action cannot be undone."
            confirmLabel="Delete permanently"
            fields={{ id: item.id }}
          />
        }
      />
      <GalleryEditForm item={item} />
    </>
  );
}
