import type { Metadata } from "next";
import Link from "next/link";
import { requirePageRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "No access" };

export default async function ForbiddenPage() {
  await requirePageRole("staff", "/admin");
  return (
    <>
      <h1 className="text-3xl font-semibold">You do not have access to that page</h1>
      <p className="mt-2 max-w-prose text-ink-soft">
        Your role does not include this section. If you think it should, ask a super admin to change your role.
      </p>
      <p className="mt-6">
        <Link href="/admin" className="font-semibold">
          Back to the dashboard
        </Link>
      </p>
    </>
  );
}
