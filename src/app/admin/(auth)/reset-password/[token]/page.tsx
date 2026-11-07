import type { Metadata } from "next";
import Link from "next/link";
import { SetPasswordForm } from "@/components/admin/auth-forms";
import { getDb } from "@/server/db/client";
import { findValidToken } from "@/server/services/auth-service";

export const metadata: Metadata = { title: "Choose a new password" };
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findValidToken(getDb(), token, "password_reset");

  if (!found) {
    return (
      <>
        <h1 className="text-2xl font-semibold">This link has expired</h1>
        <p className="mt-2 text-ink-soft">Reset links work once and last 30 minutes. Ask for a new one and use it straight away.</p>
        <p className="mt-6">
          <Link href="/admin/forgot-password" className="font-semibold">
            Send me a new link
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <h1 className="text-2xl font-semibold">Choose a new password</h1>
      <p className="mt-1 text-ink-soft">For {found.user.email}</p>
      <div className="mt-6">
        <SetPasswordForm mode="reset" token={token} context={{ email: found.user.email, name: found.user.name }} />
      </div>
    </>
  );
}
