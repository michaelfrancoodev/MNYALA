import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { TypeToConfirmDelete } from "@/components/admin/type-to-confirm";
import { getEnv } from "@/lib/env";
import { requirePageRole } from "@/server/auth/guards";
import { deleteProductAction } from "@/server/actions/products";
import { getDb } from "@/server/db/client";
import { getProductAdmin } from "@/server/services/products-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const product = await getProductAdmin(db, id);
  return { title: product ? `Edit ${product.name}` : "Product" };
}

const NOTICES: Record<string, string> = {
  "name-mismatch": "The name you typed did not match. The product was not deleted.",
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("admin", "/admin/products");
  const { id } = await params;
  const raw = await searchParams;
  const db = getDb();
  const product = await getProductAdmin(db, id);
  if (!product) notFound();

  const maxMb = getEnv().MAX_UPLOAD_MB;

  return (
    <>
      <PageHeader
        title={`Edit ${product.name}`}
        description="Update product details, pricing, picture, or delete permanently."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {product.isPublished ? (
              <Link
                href={`/bidhaa#${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-line-strong bg-paper px-3 py-1.5 text-sm font-semibold text-ink no-underline hover:bg-surface"
              >
                View on website &rarr;
              </Link>
            ) : null}
            <TypeToConfirmDelete
              action={deleteProductAction}
              id={product.id}
              name={product.name}
              triggerLabel="Delete product"
              title={`Delete ${product.name}?`}
              description="This will permanently delete this product and its associated picture if unused elsewhere. This action cannot be undone."
            />
          </div>
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />
      <ProductForm product={product} maxUploadMb={maxMb} />
    </>
  );
}
