"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/lib/types";
import { usersApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { canManageUsers } from "@/utils/permissions";
import RoleChip from "@/components/RoleChip";
import RoleLegend from "@/components/RoleLegend";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import Pagination from "@/components/Pagination";
import { AlertCircle, Users, Trash2 } from "lucide-react";

const PAGE_SIZE = 5;

const ALL_ROLES: UserRole[] = ["super_admin", "moderator", "regular_user", "guest"];
const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  moderator: "Moderator",
  regular_user: "Regular User",
  guest: "Guest",
};

const AVATAR_PALETTE = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || !canManageUsers(user.role))) router.push("/");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!token || !user || !canManageUsers(user.role)) return;
    setLoading(true);
    usersApi.list(token, page, PAGE_SIZE)
      .then((data) => {
        if (data.total_pages > 0 && page > data.total_pages) {
          setPage(data.total_pages);
          return;
        }
        setUsers(data.items);
        setTotalItems(data.total);
        setTotalPages(data.total_pages);
        setPage(data.page);
      })
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, [token, user, page]);

  const handleRoleChange = async (target: User, newRole: UserRole) => {
    if (!token) return;
    try {
      const updated = await usersApi.update(target.id, { role: newRole }, token);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    }
  };

  const handleToggleActive = async (target: User) => {
    if (!token) return;
    try {
      const updated = await usersApi.update(target.id, { is_active: !target.is_active }, token);
      setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await usersApi.delete(deleteTarget.id, token);
      setDeleteTarget(null);
      await usersApi.list(token, page, PAGE_SIZE).then((data) => {
        if (data.total_pages > 0 && page > data.total_pages) {
          setPage(data.total_pages);
          return;
        }
        setUsers(data.items);
        setTotalItems(data.total);
        setTotalPages(data.total_pages);
        setPage(data.page);
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading || !user || !canManageUsers(user.role)) return null;

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-foreground leading-none">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${totalItems} user${totalItems !== 1 ? "s" : ""} registered`}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader className="py-3 px-5">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex-1">
              All Users
            </p>
            <RoleLegend />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => {
                const avatarColor = AVATAR_PALETTE[u.username.charCodeAt(0) % AVATAR_PALETTE.length];
                const isSelf = u.id === user.id;

                return (
                  <div key={u.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors">
                    {/* Avatar */}
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className={`text-white text-sm font-semibold ${avatarColor}`}>
                        {u.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{u.username}</span>
                        {isSelf && (
                          <span className="text-[11px] text-muted-foreground font-normal">(you)</span>
                        )}
                        <RoleChip role={u.role} />
                        {/* Active/Inactive dot */}
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${u.is_active ? "bg-emerald-500" : "bg-slate-400"}`} />
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{u.email}</p>
                    </div>

                    {/* Controls — hidden for self */}
                    {!isSelf && (
                      <div className="flex items-center gap-2 shrink-0">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u, e.target.value as UserRole)}
                          className="border border-border rounded-md px-2 py-1 text-xs bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors min-w-27.5"
                        >
                          {ALL_ROLES.map((r) => (
                            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                          ))}
                        </select>

                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs px-2.5"
                          onClick={() => handleToggleActive(u)}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(u)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        itemLabel="users"
        onPageChange={setPage}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        title={deleteTarget ? `Delete ${deleteTarget.username}?` : "Delete user?"}
        description="This will permanently remove the user and all associated content. This action cannot be undone."
        confirmLabel="Delete user"
        loading={deleting}
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      />
    </div>
  );
}
