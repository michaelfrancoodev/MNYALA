import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { ProductForm } from "@/components/admin/product-form";
import { getEnv } from "@/lib/env";
import { requirePageRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "New Product" };

export default async function NewProductPage() {
  await requirePageRole("admin", "/admin/products/new");
  const maxMb = getEnv().MAX_UPLOAD_MB;

  return (
    <>
      <PageHeader
        title="Add Product"
        description="Create a new catalog item. You can choose whether to publish it immediately or keep it as a draft."
      />
      <ProductForm maxUploadMb={maxMb} />
    </>
  );
}
