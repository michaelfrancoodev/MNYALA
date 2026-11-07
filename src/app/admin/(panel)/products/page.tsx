import type { Metadata } from "next";
import Link from "next/link";
import { Badge, DataTable, EmptyState, Notice, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { moveProductAction, setProductPublishedAction } from "@/server/actions/products";
import { getDb } from "@/server/db/client";
import { listProductsAdmin } from "@/server/services/products-admin";

export const metadata: Metadata = { title: "Products" };

const NOTICES: Record<string, string> = {
  created: "Product created successfully.",
  saved: "Product updated successfully.",
  deleted: "Product deleted permanently.",
  published: "Product is now visible on the website.",
  unpublished: "Product is now hidden from the website.",
};

const CATEGORY_NAMES: Record<string, string> = {
  charcoal: "Charcoal",
  stove: "Cookstove",
  seeds: "Tree Seeds",
  manure: "Organic Manure",
};

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requirePageRole("staff", "/admin/products");
  const raw = await searchParams;
  const db = getDb();
  const products = await listProductsAdmin(db);
  const canEdit = hasRole(user.role, "admin");

  return (
    <>
      <PageHeader
        title="Products"
        description="Catalog items shown on the public website and available for customer orders."
        actions={
          canEdit ? (
            <Link
              href="/admin/products/new"
              className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white no-underline hover:bg-brand-dark"
            >
              Add Product
            </Link>
          ) : null
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />

      {products.length === 0 ? (
        <EmptyState title="No products yet">
          {canEdit ? (
            <p className="mt-2">
              <Link href="/admin/products/new">Add the first product</Link> to show it on the website.
            </p>
          ) : (
            "No products have been added to the catalog yet."
          )}
        </EmptyState>
      ) : (
        <DataTable label="Products list">
          <THead>
            <Th>Picture</Th>
            <Th>Product</Th>
            <Th>Category</Th>
            <Th>Price</Th>
            <Th>Status</Th>
            {canEdit ? <Th className="text-right">Actions</Th> : null}
          </THead>
          <TBody>
            {products.map((p, index) => (
              <Tr key={p.id}>
                <Td label="Picture">
                  {p.file ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/uploads/${p.file}-480.webp`}
                      alt={p.alt || p.name}
                      className="h-12 w-12 rounded object-cover border border-line"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded border border-dashed border-line bg-paper text-xs text-muted">
                      None
                    </div>
                  )}
                </Td>
                <Td label="Product">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{p.name}</p>
                    <p className="truncate text-xs text-muted font-mono">/bidhaa#{p.slug}</p>
                  </div>
                </Td>
                <Td label="Category">
                  <span className="text-sm">{CATEGORY_NAMES[p.category] ?? p.category}</span>
                </Td>
                <Td label="Price">
                  <span className="text-sm font-semibold">
                    {p.priceTzs != null ? `${formatTzs(p.priceTzs)}${p.priceUnit ? ` / ${p.priceUnit}` : ""}` : "Wasiliana kwa bei"}
                  </span>
                </Td>
                <Td label="Status">
                  {p.isPublished ? <Badge tone="success">Published</Badge> : <Badge tone="neutral">Draft</Badge>}
                </Td>
                {canEdit ? (
                  <Td label="Actions" className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <form action={moveProductAction} className="inline-flex">
                        <input type="hidden" name="id" value={p.id} />
                        <button
                          type="submit"
                          name="direction"
                          value="up"
                          disabled={index === 0}
                          title="Move up"
                          aria-label={`Move ${p.name} up`}
                          className="rounded border border-line px-2 py-1 text-xs font-semibold hover:bg-brand-tint disabled:opacity-30"
                        >
                          &uarr;
                        </button>
                        <button
                          type="submit"
                          name="direction"
                          value="down"
                          disabled={index === products.length - 1}
                          title="Move down"
                          aria-label={`Move ${p.name} down`}
                          className="ml-1 rounded border border-line px-2 py-1 text-xs font-semibold hover:bg-brand-tint disabled:opacity-30"
                        >
                          &darr;
                        </button>
                      </form>

                      <form action={setProductPublishedAction} className="inline-flex">
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="publish" value={p.isPublished ? "0" : "1"} />
                        <Button type="submit" variant="ghost" size="sm">
                          {p.isPublished ? "Unpublish" : "Publish"}
                        </Button>
                      </form>

                      <Link
                        href={`/admin/products/${p.id}`}
                        className="rounded border border-line-strong bg-paper px-3 py-1.5 text-xs font-semibold text-ink no-underline hover:bg-surface"
                      >
                        Edit
                      </Link>
                    </div>
                  </Td>
                ) : null}
              </Tr>
            ))}
          </TBody>
        </DataTable>
      )}
    </>
  );
}
