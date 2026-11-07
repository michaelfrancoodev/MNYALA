import { ROLE_LABEL } from "@/server/auth/roles";
import type { SessionUser } from "@/server/auth/session";
import { logoutAction } from "@/server/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export function UserBlock({ user }: { user: SessionUser }) {
  return (
    <div className="border-t border-line pt-4">
      <p className="truncate font-semibold text-ink">{user.name}</p>
      <p className="truncate text-sm text-muted">{user.email}</p>
      <p className="mt-0.5 text-sm text-muted">{ROLE_LABEL[user.role]}</p>
      <form action={logoutAction} className="mt-3">
        <SubmitButton variant="secondary" size="sm" pendingLabel="Signing out..." className="w-full">
          Sign out
        </SubmitButton>
      </form>
    </div>
  );
}
