import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Badge, DataTable, EmptyState, Notice, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { GalleryUploadForm } from "@/components/admin/gallery-upload-form";
import { getEnv } from "@/lib/env";
import { requirePageRole } from "@/server/auth/guards";
import {
  deleteGalleryItemAction,
  moveGalleryItemAction,
  setGalleryPublishedAction,
} from "@/server/actions/gallery";
import { getDb } from "@/server/db/client";
import { listGalleryAdmin } from "@/server/services/gallery-admin";

export const metadata: Metadata = { title: "Gallery" };

const NOTICES: Record<string, string> = {
  uploaded: "Pictures uploaded and optimized successfully.",
  saved: "Picture details updated.",
  deleted: "Picture removed permanently.",
  published: "Picture is now visible in the public gallery.",
  unpublished: "Picture is now hidden from the public gallery.",
};

const CATEGORY_NAMES: Record<string, string> = {
  production: "Production",
  product: "Products",
  delivery: "Delivery",
  community: "Community",
};

export default async function GalleryAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("admin", "/admin/gallery");
  const raw = await searchParams;
  const db = getDb();
  const items = await listGalleryAdmin(db);
  const maxMb = getEnv().MAX_UPLOAD_MB;

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Photos showing production, eco-friendly charcoal, cookstoves, tree seedlings, and community work."
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <div className="mb-8">
        <GalleryUploadForm maxUploadMb={maxMb} />
      </div>

      <h2 className="mb-4 text-xl font-semibold">Existing Pictures ({items.length})</h2>

      {items.length === 0 ? (
        <EmptyState title="No pictures in the gallery yet">
          Upload pictures above to show them in the public gallery.
        </EmptyState>
      ) : (
        <DataTable label="Gallery items">
          <THead>
            <Th>Preview</Th>
            <Th>Title</Th>
            <Th>Category</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </THead>
          <TBody>
            {items.map((item, index) => (
              <Tr key={item.id}>
                <Td label="Preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/uploads/${item.file}-480.webp`}
                    alt={item.alt}
                    className="h-14 w-20 rounded object-cover border border-line"
                  />
                </Td>
                <Td label="Title">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{item.title}</p>
                    {item.description ? <p className="truncate text-xs text-muted">{item.description}</p> : null}
                  </div>
                </Td>
                <Td label="Category">
                  <span className="text-sm">{CATEGORY_NAMES[item.category] ?? item.category}</span>
                </Td>
                <Td label="Status">
                  {item.isPublished ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Draft</Badge>}
                </Td>
                <Td label="Actions" className="text-right">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <form action={moveGalleryItemAction} className="inline-flex">
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        name="direction"
                        value="up"
                        disabled={index === 0}
                        title="Move up"
                        aria-label={`Move ${item.title} up`}
                        className="rounded border border-line px-2 py-1 text-xs font-semibold hover:bg-brand-tint disabled:opacity-30"
                      >
                        &uarr;
                      </button>
                      <button
                        type="submit"
                        name="direction"
                        value="down"
                        disabled={index === items.length - 1}
                        title="Move down"
                        aria-label={`Move ${item.title} down`}
                        className="ml-1 rounded border border-line px-2 py-1 text-xs font-semibold hover:bg-brand-tint disabled:opacity-30"
                      >
                        &darr;
                      </button>
                    </form>

                    <form action={setGalleryPublishedAction} className="inline-flex">
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="publish" value={item.isPublished ? "0" : "1"} />
                      <Button type="submit" variant="ghost" size="sm">
                        {item.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                    </form>

                    <Link
                      href={`/admin/gallery/${item.id}`}
                      className="rounded border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-surface"
                    >
                      Edit
                    </Link>

                    <ConfirmAction
                      action={deleteGalleryItemAction}
                      triggerLabel="Delete"
                      title={`Delete "${item.title}"?`}
                      description="This photo will be permanently deleted from the gallery and disk. This cannot be undone."
                      confirmLabel="Delete picture"
                      fields={{ id: item.id }}
                    />
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </DataTable>
      )}
    </>
  );
}
