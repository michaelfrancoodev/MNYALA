import type { Metadata } from "next";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Badge, DataTable, EmptyState, Notice, PageHeader, TBody, Td, THead, Th, Tr } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { InviteUserForm } from "@/components/admin/invite-user-form";
import { formatDateTime } from "@/lib/format";
import { requirePageRole } from "@/server/auth/guards";
import {
  deleteUserAction,
  resendInviteAction,
  revokeUserSessionsAction,
  toggleUserActiveAction,
} from "@/server/actions/users";
import { getDb } from "@/server/db/client";
import { listUsersAdmin } from "@/server/services/users-admin";

export const metadata: Metadata = { title: "Team & Users" };

const NOTICES: Record<string, string> = {
  invited: "Invitation sent successfully via email.",
  "invite-sent": "New invitation email sent.",
  saved: "User updated successfully.",
  activated: "User account activated.",
  deactivated: "User account deactivated and active sessions revoked.",
  "sessions-cleared": "All active sessions revoked for this user.",
  deleted: "User account deleted permanently.",
  "cannot-delete": "Cannot delete the last active super admin or your own account.",
  error: "An error occurred while updating the user.",
};

const ROLE_TONES: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  staff: "neutral",
  admin: "info",
  super_admin: "success",
};

export default async function UsersAdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { user } = await requirePageRole("super_admin", "/admin/users");
  const raw = await searchParams;
  const db = getDb();
  const allUsers = await listUsersAdmin(db);

  return (
    <>
      <PageHeader
        title="Users & Permissions"
        description="Manage staff members, administrative privileges, and team invitations."
      />
      <Notice notices={NOTICES} code={raw.notice} />

      <div className="mb-8">
        <InviteUserForm />
      </div>

      <h2 className="text-xl font-semibold mb-4">Team Members ({allUsers.length})</h2>

      {allUsers.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <DataTable label="Users list">
          <THead>
            <Th>Name & Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Last Sign In</Th>
            <Th className="text-right">Actions</Th>
          </THead>
          <TBody>
            {allUsers.map((u) => {
              const isSelf = u.id === user.id;

              return (
                <Tr key={u.id}>
                  <Td label="Name & Email">
                    <div>
                      <p className="font-semibold text-ink">
                        {u.name} {isSelf ? <span className="text-xs text-brand font-normal">(You)</span> : null}
                      </p>
                      <p className="text-xs text-muted font-mono">{u.email}</p>
                    </div>
                  </Td>
                  <Td label="Role">
                    <Badge tone={ROLE_TONES[u.role] ?? "neutral"}>{u.role.replace("_", " ")}</Badge>
                  </Td>
                  <Td label="Status">
                    {u.isActive ? (
                      u.hasPassword ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="warning">Invite Pending</Badge>
                      )
                    ) : (
                      <Badge tone="danger">Deactivated</Badge>
                    )}
                  </Td>
                  <Td label="Last Sign In">
                    <span className="text-xs text-muted">
                      {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}
                    </span>
                  </Td>
                  <Td label="Actions" className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {!u.hasPassword ? (
                        <form action={resendInviteAction} className="inline-flex">
                          <input type="hidden" name="userId" value={u.id} />
                          <Button type="submit" variant="ghost" size="sm">
                            Resend Invite
                          </Button>
                        </form>
                      ) : null}

                      {!isSelf ? (
                        <form action={toggleUserActiveAction} className="inline-flex">
                          <input type="hidden" name="id" value={u.id} />
                          <input type="hidden" name="active" value={u.isActive ? "0" : "1"} />
                          <Button type="submit" variant="ghost" size="sm">
                            {u.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </form>
                      ) : null}

                      <form action={revokeUserSessionsAction} className="inline-flex">
                        <input type="hidden" name="id" value={u.id} />
                        <Button type="submit" variant="ghost" size="sm">
                          Sign out all
                        </Button>
                      </form>

                      {!isSelf ? (
                        <ConfirmAction
                          action={deleteUserAction}
                          triggerLabel="Delete"
                          title={`Delete account for ${u.name}?`}
                          description="This user will be permanently deleted and immediately signed out of all devices."
                          confirmLabel="Delete User"
                          fields={{ id: u.id }}
                        />
                      ) : null}
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </DataTable>
      )}
    </>
  );
}
