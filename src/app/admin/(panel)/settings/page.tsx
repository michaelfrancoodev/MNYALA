import type { Metadata } from "next";
import { Badge, Notice, PageHeader } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { ChangePasswordForm } from "@/components/admin/change-password-form";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { requirePageRole } from "@/server/auth/guards";
import { hasRole } from "@/server/auth/roles";
import { revokeOtherSessionsAction } from "@/server/actions/settings";
import { getDb } from "@/server/db/client";
import { sessions } from "@/server/db/schema";
import { getSiteSettings } from "@/server/services/site";
import { desc, eq } from "drizzle-orm";
import { getLocale } from "@/messages/i18n";

export const metadata: Metadata = { title: "Mipangilio | Settings" };

const NOTICES_SW: Record<string, string> = {
  "password-changed": "Nywila yako imebadilishwa kikamilifu. Vifaa vingine vyote vimeondolewa kwenye mfumo.",
  "settings-saved": "Taarifa za tovuti na mawasiliano zimehifadhiwa vizuri.",
  "other-sessions-revoked": "Vifaa vingine vyote vimeondolewa kikamilifu.",
};

const NOTICES_EN: Record<string, string> = {
  "password-changed": "Your password has been changed. All other devices have been signed out.",
  "settings-saved": "Website contact information and settings updated successfully.",
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
  const locale = await getLocale();
  const isSw = locale === "sw";

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
        title={isSw ? "Mipangilio & Wasifu" : "Settings & Profile"}
        description={
          isSw
            ? "Dhibiti nywila ya akaunti yako, lugha ya mfumo, vifaa vilivyoingia, na taarifa za tovuti ya umma."
            : "Manage your account password, system language, active sessions, and public website information."
        }
      />
      <Notice notices={isSw ? NOTICES_SW : NOTICES_EN} code={raw.notice} />

      <div className="space-y-8">
        {/* Language Selection Section */}
        <section aria-label="Language selection" className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {isSw ? "Lugha ya Mfumo (Language)" : "System Language"}
              </h2>
              <p className="mt-1 text-xs text-ink-soft">
                {isSw
                  ? "Chagua lugha unayotaka kutumia kwenye paneli ya utawala na tovuti (Kiswahili au Kiingereza)."
                  : "Choose your preferred language for the admin portal and public site (Swahili or English)."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted">
                {isSw ? "Lugha ya Sasa:" : "Current:"} {locale.toUpperCase()}
              </span>
              <LanguageSwitcher current={locale} />
            </div>
          </div>
        </section>

        {/* Profile Details */}
        <section aria-label="Profile info" className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="border-b border-line/80 pb-3 mb-5">
            <h2 className="text-lg font-bold text-ink">
              {isSw ? "Wasifu Wako wa Mtendaji" : "Your Account Profile"}
            </h2>
            <p className="text-xs text-muted">
              {isSw ? "Taarifa zako rasmi zilizosajiliwa katika mfumo." : "Your registered administrator identity."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 max-w-2xl">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {isSw ? "Jina Kamili" : "Full Name"}
              </p>
              <p className="font-bold text-ink text-base mt-1">{user.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {isSw ? "Barua Pepe" : "Email Address"}
              </p>
              <p className="font-mono text-ink text-sm mt-1">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muted">
                {isSw ? "Nafasi / Wajibu" : "Assigned Role"}
              </p>
              <div className="mt-1">
                <Badge tone="success">{user.role.replace("_", " ").toUpperCase()}</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section aria-label="Change password" className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="border-b border-line/80 pb-3 mb-5">
            <h2 className="text-lg font-bold text-ink">
              {isSw ? "Badilisha Nywila" : "Change Password"}
            </h2>
            <p className="text-xs text-ink-soft">
              {isSw
                ? "Weka nywila imara yenye angalau herufi 10, ikijumuisha herufi kubwa, ndogo na namba kwa usalama wa juu."
                : "Choose a strong password with at least 10 characters, including letters and numbers for maximum security."}
            </p>
          </div>
          <div className="max-w-xl">
            <ChangePasswordForm />
          </div>
        </section>

        {/* Active Sessions */}
        <section aria-label="Active sessions" className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line/80 pb-3 mb-5">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {isSw ? "Vifaa Vilivyoingia (Vipindi Hai)" : "Signed In Devices"}
              </h2>
              <p className="text-xs text-ink-soft">
                {isSw
                  ? `Vifaa (${userSessions.length}) vinavyotumia akaunti yako kwa sasa.`
                  : `Devices (${userSessions.length}) currently authenticated with your credentials.`}
              </p>
            </div>
            {userSessions.length > 1 ? (
              <form action={revokeOtherSessionsAction}>
                <input type="hidden" name="currentSessionId" value={sessionId} />
                <Button type="submit" variant="secondary" size="sm">
                  {isSw ? "Ondoka kwenye vifaa vingine vyote" : "Sign out of all other devices"}
                </Button>
              </form>
            ) : null}
          </div>

          <div className="space-y-3">
            {userSessions.map((s) => {
              const isCurrent = s.id === sessionId;
              return (
                <div
                  key={s.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 text-xs ${
                    isCurrent ? "border-emerald-300 bg-emerald-50/50" : "border-line bg-paper"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{s.userAgent || "Kivinjari kisichojulikana"}</span>
                      {isCurrent ? (
                        <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          {isSw ? "Kifaa Hiki cha Sasa" : "Current Device"}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-muted font-mono">IP: {s.ip || "127.0.0.1"}</p>
                  </div>
                  <div className="text-muted">
                    {isSw ? "Ilitumika mara ya mwisho:" : "Last active:"}{" "}
                    <span className="font-semibold text-ink">{s.lastUsedAt.toLocaleString(locale === "sw" ? "sw-TZ" : "en-US")}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Public Site Settings Form (Admin Only) */}
        {canEditSite && siteSettingsData ? (
          <section aria-label="Site settings" className="rounded-2xl border border-line bg-surface p-6 shadow-2xs">
            <div className="border-b border-line/80 pb-3 mb-5">
              <h2 className="text-lg font-bold text-ink">
                {isSw ? "Mawasiliano & Mipangilio ya Tovuti ya Umma" : "Public Website Information & Contacts"}
              </h2>
              <p className="text-xs text-ink-soft">
                {isSw
                  ? "Badilisha namba ya simu, WhatsApp, anwani ya kiwanda Mbeya, na masaa ya kazi yanayoonekana kwenye tovuti ya wateja."
                  : "Update company phone, WhatsApp hotline, Mbeya factory address, and business hours shown on the customer site."}
              </p>
            </div>
            <SiteSettingsForm settings={siteSettingsData} />
          </section>
        ) : null}
      </div>
    </>
  );
}
