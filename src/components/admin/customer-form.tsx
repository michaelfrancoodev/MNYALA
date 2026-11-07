"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { TextAreaField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveCustomerAction } from "@/server/actions/customers";
import type { ActionState } from "@/server/actions/core";

const first = (state: ActionState | null, key: string) => (state && !state.ok ? state.fieldErrors?.[key]?.[0] : undefined);
const val = (state: ActionState | null, key: string, fallback: string = "") =>
  state && !state.ok && state.values?.[key] !== undefined ? state.values[key] : fallback;

export function CustomerForm({
  customer,
}: {
  customer?: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    notes: string | null;
  } | null;
}) {
  const [state, action] = useActionState(saveCustomerAction, null);
  const message = state && !state.ok ? state.message : undefined;

  return (
    <form action={action} className="max-w-xl space-y-5" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}
      {customer?.id ? <input type="hidden" name="id" value={customer.id} /> : null}

      <TextField
        label="Customer Full Name"
        name="name"
        required
        defaultValue={val(state, "name", customer?.name ?? "")}
        error={first(state, "name")}
        placeholder="For example: Baraka Mwaipopo"
      />

      <TextField
        label="Phone Number"
        name="phone"
        type="tel"
        defaultValue={val(state, "phone", customer?.phone ?? "")}
        error={first(state, "phone")}
        placeholder="0758 730 108"
        hint="Tanzanian mobile or international format (will be normalized to +255...)."
      />

      <TextField
        label="Email Address (Optional)"
        name="email"
        type="email"
        defaultValue={val(state, "email", customer?.email ?? "")}
        error={first(state, "email")}
        placeholder="mteja@example.com"
      />

      <TextAreaField
        label="Physical Address / Delivery Location (Optional)"
        name="address"
        defaultValue={val(state, "address", customer?.address ?? "")}
        error={first(state, "address")}
        placeholder="Mwanjelwa, Mbeya Mjini"
        rows={2}
      />

      <TextAreaField
        label="Internal Notes (Optional)"
        name="notes"
        defaultValue={val(state, "notes", customer?.notes ?? "")}
        error={first(state, "notes")}
        placeholder="Customer preferences, directions, or order history notes."
        rows={3}
      />

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <SubmitButton pendingLabel={customer ? "Saving..." : "Creating..."}>
          {customer ? "Save Changes" : "Create Customer"}
        </SubmitButton>
        <Link
          href={customer ? `/admin/customers/${customer.id}` : "/admin/customers"}
          className="rounded-md border border-line-strong bg-paper px-4 py-2 text-sm font-semibold text-ink hover:bg-surface"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
