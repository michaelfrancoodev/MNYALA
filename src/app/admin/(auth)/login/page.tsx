import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { LoginForm } from "@/components/admin/auth-forms";
import { safeNextPath } from "@/lib/validators/auth";
import { getSession } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  "password-reset": "Your password has been changed. Sign in with the new one.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const { next, notice } = await searchParams;
  const target = safeNextPath(next);
  if (await getSession()) redirect((target ?? "/admin") as "/admin");
  const noticeText = notice ? NOTICES[notice] : undefined;

  return (
    <>
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-ink-soft">Use the account the owner set up for you.</p>
      {noticeText ? <Alert tone="success" className="mt-5">{noticeText}</Alert> : null}
      <div className="mt-6">
        <LoginForm next={target ?? undefined} />
      </div>
    </>
  );
}
