"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePasswordAction } from "@/server/actions/settings";

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePasswordAction, null);

  return (
    <form action={action} className="max-w-md space-y-4" noValidate>
      {state && !state.ok && state.message ? <Alert tone="error">{state.message}</Alert> : null}

      <PasswordField
        label="Current Password"
        name="currentPassword"
        autoComplete="current-password"
        required
        errors={state && !state.ok ? state.fieldErrors?.currentPassword : undefined}
      />

      <PasswordField
        label="New Password"
        name="newPassword"
        autoComplete="new-password"
        required
        errors={state && !state.ok ? state.fieldErrors?.newPassword : undefined}
      />

      <div className="pt-2">
        <SubmitButton pendingLabel="Updating password...">
          Change Password
        </SubmitButton>
      </div>
    </form>
  );
}
