import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { CustomerForm } from "@/components/admin/customer-form";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { getCustomerAdmin } from "@/server/services/customers-admin";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = getDb();
  const customer = await getCustomerAdmin(db, id);
  return { title: customer ? `Edit ${customer.name}` : "Edit Customer" };
}

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageRole("staff", "/admin/customers");
  const { id } = await params;
  const db = getDb();
  const customer = await getCustomerAdmin(db, id);
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={`Edit ${customer.name}`}
        description="Update customer details, contact info, and delivery address."
      />
      <CustomerForm customer={customer} />
    </>
  );
}
