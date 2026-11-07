import type { Metadata } from "next";
import { Badge, Notice, PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { formatDateTime } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { revokeOtherSessionsAction } from "@/server/actions/settings";
import { getDb } from "@/server/db/client";
import { sessions } from "@/server/db/schema";
import { getSiteSettings } from "@/server/services/site";
import { desc, eq } from "drizzle-orm";

export const metadata: Metadata = { title: "Settings" };

const NOTICES: Record<string, string> = {
  "password-changed": "Your password has been changed. All other devices have been signed out.",
  "settings-saved": "Website contact information and settings updated.",
  "other-sessions-revoked": "Signed out of all other devices successfully.",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user, sessionId } = await requirePageRole("staff", "/admin/settings");
  const raw = await searchParams;
  const db = getDb();
  const canEditSite = hasRole(user.role, "admin");

  const [siteSettingsData, userSessions] = await Promise.all([
    canEditSite ? getSiteSettings() : Promise.resolve(null),
    db
      .select({
        id: sessions.id,
        ip: sessions.ip,
        userAgent: sessions.userAgent,
        lastUsedAt: sessions.lastUsedAt,
      })
      .from(sessions)
      .where(eq(sessions.userId, user.id))
      .orderBy(desc(sessions.lastUsedAt)),
  ]);

  return (
    <>
      <PageHeader
        title="Settings & Profile"
        description="Manage your account password, active sessions, and public website information."
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <div className="space-y-12">
        {/* Profile Details */}
        <section aria-label="Profile info" className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-xl">
            <div>
              <p className="text-xs text-muted uppercase font-semibold">Name</p>
              <p className="font-semibold text-ink text-base mt-0.5">{user.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-semibold">Email</p>
              <p className="font-mono text-ink text-sm mt-0.5">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase font-semibold">Role</p>
              <div className="mt-0.5">
                <Badge tone="success">{user.role.replace("_", " ")}</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section aria-label="Change password" className="rounded-lg border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold mb-2">Change Password</h2>
          <p className="text-sm text-ink-soft mb-5">
            Choose a strong password with at least 10 characters, including letters and numbers.
          </p>
          <ChangePasswordForm />
        </section>

        {/* Active Sessions */}
        <section aria-label="Active sessions" className="rounded-lg border border-line bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-semibold">Signed In Devices</h2>
              <p className="text-sm text-ink-soft">Devices currently signed in with your account ({userSessions.length}).</p>
            </div>
            {userSessions.length > 1 ? (
              <form action={revokeOtherSessionsAction}>
                <input type="hidden" name="currentSessionId" value={sessionId} />
                <Button type="submit" variant="secondary" size="sm">
                  Sign out of other devices
                </Button>
              </form>
            ) : null}
          </div>

          <div className="divide-y divide-line">
            {userSessions.map((s) => {
              const isCurrent = s.id === sessionId;
              return (
                <div key={s.id} className="py-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-ink">
                        {s.userAgent ? s.userAgent.slice(0, 60) : "Web Browser"}
                      </p>
                      {isCurrent ? <Badge tone="info">Current Device</Badge> : null}
                    </div>
                    <p className="text-xs text-muted font-mono mt-0.5">
                      IP: {s.ip || "Unknown"} &bull; Last active: {formatDateTime(s.lastUsedAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Site Settings (Admin+) */}
        {canEditSite && siteSettingsData ? (
          <section aria-label="Website settings" className="rounded-lg border border-line bg-surface p-6">
            <h2 className="text-xl font-semibold mb-2">Public Website Settings</h2>
            <p className="text-sm text-ink-soft mb-6">
              Contact numbers, WhatsApp links, office hours, and environmental impact stats displayed on the public website.
            </p>
            <SiteSettingsForm settings={siteSettingsData} />
          </section>
        ) : null}
      </div>
    </>
  );
}
