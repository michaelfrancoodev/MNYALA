import type { Metadata } from "next";
import Link from "next/link";
import { DataTable, EmptyState, Notice, PageHeader, Pagination, SearchBox, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { formatTzs } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { getDb } from "@/server/db/client";
import { CUSTOMERS_PAGE_SIZE, listCustomersAdmin } from "@/server/services/customers-admin";

export const metadata: Metadata = { title: "Customers" };

const NOTICES: Record<string, string> = {
  created: "Customer created successfully.",
  saved: "Customer updated successfully.",
  deleted: "Customer deleted permanently.",
};

export default async function CustomersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePageRole("staff", "/admin/customers");
  const raw = await searchParams;
  const page = Number(raw.page) || 1;
  const q = raw.q || "";

  const db = getDb();
  const list = await listCustomersAdmin(db, { q, page });

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/admin/customers?${s}` : "/admin/customers";
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Customer directory with contact information and order history."
        actions={
          <Link
            href="/admin/customers/new"
            className="inline-flex min-h-11 items-center rounded-md bg-brand px-4 font-semibold text-white no-underline hover:bg-brand-dark"
          >
            Add Customer
          </Link>
        }
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <div className="mb-4">
        <SearchBox action="/admin/customers" defaultValue={q} placeholder="Search name, phone, email, address..." />
      </div>

      {list.total === 0 ? (
        <EmptyState title="No customers found">
          {q ? (
            <p>
              No customer matches &ldquo;{q}&rdquo;. <Link href="/admin/customers">Clear search</Link>.
            </p>
          ) : (
            <p>
              No customers have been added yet. <Link href="/admin/customers/new">Add the first customer</Link>.
            </p>
          )}
        </EmptyState>
      ) : (
        <>
          <DataTable label="Customer list">
            <THead>
              <Th className="whitespace-nowrap">Customer Name</Th>
              <Th className="whitespace-nowrap">Phone</Th>
              <Th className="whitespace-nowrap">Email</Th>
              <Th className="whitespace-nowrap">Address</Th>
              <Th className="whitespace-nowrap text-center">Orders</Th>
              <Th className="whitespace-nowrap">Completed Spend</Th>
              <Th className="whitespace-nowrap text-right">Actions</Th>
            </THead>
            <TBody>
              {list.items.map((c) => (
                <Tr key={c.id}>
                  <Td label="Customer Name" className="whitespace-nowrap">
                    <Link href={`/admin/customers/${c.id}`} className="font-semibold text-ink hover:underline">
                      {c.name}
                    </Link>
                  </Td>
                  <Td label="Phone" className="whitespace-nowrap">
                    <span className="font-mono text-sm">{c.phone || "—"}</span>
                  </Td>
                  <Td label="Email">
                    <span className="text-sm max-w-[160px] truncate block" title={c.email || undefined}>{c.email || "—"}</span>
                  </Td>
                  <Td label="Address">
                    <span className="text-sm max-w-[140px] truncate block" title={c.address || undefined}>{c.address || "—"}</span>
                  </Td>
                  <Td label="Orders" className="whitespace-nowrap md:text-center">
                    <span className="text-sm font-semibold">{c.orderCount}</span>
                  </Td>
                  <Td label="Completed Spend" className="whitespace-nowrap">
                    <span className="text-sm font-semibold">{formatTzs(c.totalSpentTzs)}</span>
                  </Td>
                  <Td label="Actions" className="whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 shrink-0">
                      <Link
                        href={`/admin/orders/new?customerId=${c.id}`}
                        className="inline-flex items-center rounded-lg border border-brand bg-brand-tint px-2.5 py-1 text-xs font-semibold text-brand-dark no-underline hover:bg-brand hover:text-white transition-colors shrink-0"
                      >
                        + Order
                      </Link>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center rounded-lg border border-line-strong bg-paper px-2.5 py-1 text-xs font-semibold text-ink no-underline hover:bg-surface transition-colors shrink-0"
                      >
                        View
                      </Link>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </DataTable>

          <Pagination page={list.page} pages={list.pages} total={list.total} pageSize={CUSTOMERS_PAGE_SIZE} hrefFor={hrefFor} />
        </>
      )}
    </>
  );
}
