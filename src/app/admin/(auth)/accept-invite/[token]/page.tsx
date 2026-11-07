import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/admin/auth-forms";
import { getDb } from "@/server/db/client";
import { findValidToken } from "@/server/services/auth-service";

export const metadata: Metadata = { title: "Accept invitation" };
export const dynamic = "force-dynamic";

export default async function AcceptInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findValidToken(getDb(), token, "invite");

  if (!found) {
    return (
      <>
        <h1 className="text-2xl font-semibold">This invitation is no longer valid</h1>
        <p className="mt-2 text-ink-soft">Invitations work once and last 72 hours. Ask a super admin to send you a new one.</p>
      </>
    );
  }
  return (
    <>
      <h1 className="text-2xl font-semibold">Welcome, {found.user.name}</h1>
      <p className="mt-1 text-ink-soft">Choose a password to finish setting up your account.</p>
      <div className="mt-6">
        <SetPasswordForm mode="invite" token={token} context={{ email: found.user.email, name: found.user.name }} />
      </div>
    </>
  );
}
