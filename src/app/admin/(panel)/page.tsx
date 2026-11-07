import type { Metadata } from "next";
import { requirePageRole } from "@/server/auth/guards";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requirePageRole("staff", "/admin");
  return (
    <>
      <h1 className="text-3xl font-semibold">Hello, {user.name.split(" ")[0]}</h1>
      <p className="mt-2 text-ink-soft">You are signed in. The sections of the admin appear in the menu as they are completed.</p>
    </>
  );
}
