import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { CustomerForm } from "@/components/admin/customer-form";
import { requirePageRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "New Customer" };

export default async function NewCustomerPage() {
  await requirePageRole("staff", "/admin/customers/new");

  return (
    <>
      <PageHeader
        title="Add Customer"
        description="Record a new customer with contact information and delivery address."
      />
      <CustomerForm />
    </>
  );
}
