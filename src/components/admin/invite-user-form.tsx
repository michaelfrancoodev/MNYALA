"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { SelectField, TextField } from "@/components/ui/fields";
import { SubmitButton } from "@/components/ui/submit-button";
import { inviteUserAction } from "@/server/actions/users";

export function InviteUserForm() {
  const [state, action] = useActionState(inviteUserAction, null);

  return (
    <form action={action} className="rounded-lg border border-line bg-surface p-5 space-y-4 max-w-xl" noValidate>
      <h2 className="text-lg font-semibold">Invite New Team Member</h2>
      {state && !state.ok && state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Full Name"
          name="name"
          required
          placeholder="For example: Neema Mwambungu"
          error={state && !state.ok ? state.fieldErrors?.name?.[0] : undefined}
          defaultValue={state && !state.ok ? state.values?.name : undefined}
        />

        <TextField
          label="Email Address"
          name="email"
          type="email"
          required
          placeholder="neema@mnyala.co.tz"
          error={state && !state.ok ? state.fieldErrors?.email?.[0] : undefined}
          defaultValue={state && !state.ok ? state.values?.email : undefined}
        />
      </div>

      <SelectField
        label="Role & Access Level"
        name="role"
        required
        defaultValue="staff"
        error={state && !state.ok ? state.fieldErrors?.role?.[0] : undefined}
      >
        <option value="staff">Staff (Orders, Customers, Messages & View Products)</option>
        <option value="admin">Admin (Staff + Edit Products/Gallery, Reports, Settings)</option>
        <option value="super_admin">Super Admin (Full Access: User Management & Activity)</option>
      </SelectField>

      <div className="pt-2">
        <SubmitButton pendingLabel="Sending invitation...">
          Send Invitation Link
        </SubmitButton>
      </div>
    </form>
  );
}
