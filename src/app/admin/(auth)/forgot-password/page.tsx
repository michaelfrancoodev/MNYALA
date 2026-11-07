import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/admin/auth-forms";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Forgot your password?</h1>
      <p className="mt-1 text-ink-soft">Enter your email and we will send you a link to choose a new one.</p>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
