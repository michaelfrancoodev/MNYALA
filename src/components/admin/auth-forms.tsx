"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { TextField } from "@/components/ui/fields";
import { PasswordField } from "@/components/ui/password-field";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  acceptInviteAction, forgotPasswordAction, loginAction, resetPasswordAction,
} from "@/server/actions/auth";
import type { ActionState } from "@/server/actions/core";

const first = (state: ActionState | null, key: string) => (state && !state.ok ? state.fieldErrors?.[key] : undefined);

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState(loginAction, null);
  const message = state && !state.ok ? state.message : undefined;
  return (
    <form action={action} className="space-y-5" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state && !state.ok ? state.values?.email : undefined}
        error={first(state, "email")?.[0]}
      />
      <PasswordField label="Password" name="password" autoComplete="current-password" errors={first(state, "password")} />
      <SubmitButton pendingLabel="Signing in..." className="w-full">
        Sign in
      </SubmitButton>
      <p className="text-sm">
        <Link href="/admin/forgot-password">Forgot your password?</Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(forgotPasswordAction, null);
  if (state?.ok) {
    return (
      <div className="space-y-4">
        <Alert tone="success">{state.message}</Alert>
        <p className="text-sm">
          <Link href="/admin/login">Back to sign in</Link>
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-5" noValidate>
      <TextField
        label="Email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        required
        defaultValue={state && !state.ok ? state.values?.email : undefined}
        error={first(state, "email")?.[0]}
      />
      <SubmitButton pendingLabel="Sending..." className="w-full">
        Send reset link
      </SubmitButton>
      <p className="text-sm">
        <Link href="/admin/login">Back to sign in</Link>
      </p>
    </form>
  );
}

export function SetPasswordForm({
  mode,
  token,
  context,
}: {
  mode: "reset" | "invite";
  token: string;
  context: { email: string; name: string };
}) {
  const [state, action] = useActionState(mode === "reset" ? resetPasswordAction : acceptInviteAction, null);
  const message = state && !state.ok ? state.message : undefined;
  return (
    <form action={action} className="space-y-5" noValidate>
      {message ? <Alert tone="error">{message}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <PasswordField
        label="New password"
        name="password"
        autoComplete="new-password"
        checklist
        context={context}
        errors={first(state, "password")}
      />
      <PasswordField label="Type it again" name="confirm" autoComplete="new-password" errors={first(state, "confirm")} />
      <SubmitButton pendingLabel="Saving..." className="w-full">
        {mode === "reset" ? "Save new password" : "Set password and sign in"}
      </SubmitButton>
    </form>
  );
}
