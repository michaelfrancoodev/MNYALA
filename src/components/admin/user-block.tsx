import { ROLE_LABEL } from "@/server/auth/roles";
import type { SessionUser } from "@/server/auth/session";
import { logoutAction } from "@/server/actions/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export function UserBlock({ user }: { user: SessionUser }) {
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("") || "M";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-brand font-bold text-white shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink">{user.name}</p>
          <div className="flex items-center gap-1.5">
            <span className="inline-block rounded-md bg-brand-tint px-1.5 py-0.5 text-[10px] font-bold text-brand-dark">
              {ROLE_LABEL[user.role]}
            </span>
          </div>
        </div>
      </div>
      <form action={logoutAction}>
        <SubmitButton variant="secondary" size="sm" pendingLabel="Inatoka..." className="w-full text-xs">
          Ondoka (Sign out)
        </SubmitButton>
      </form>
    </div>
  );
}
