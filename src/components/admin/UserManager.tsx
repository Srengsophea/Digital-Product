"use client";

import { useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  ShieldAlert,
  Loader2,
  Trash2,
  Edit2,
  Ban,
  CheckCircle2,
  X,
  AlertTriangle,
} from "lucide-react";
import { formatMoney } from "@/lib/utils";

export interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  status?: "active" | "banned";
  created_at: string;
  order_count?: number;
  total_spent_cents?: number;
}

export function UserManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("all");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"admin" | "customer">("customer");
  const [editStatus, setEditStatus] = useState<"active" | "banned">("active");
  const [saveLoading, setSaveLoading] = useState(false);
  const [modalError, setModalError] = useState("");

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditStatus(u.status || "active");
    setModalError("");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setModalError("");
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaveLoading(true);
    setModalError("");

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          role: editRole,
          status: editStatus,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setModalError(data.error ?? "Failed to update user.");
        setSaveLoading(false);
        return;
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                name: editName,
                email: editEmail,
                role: editRole,
                status: editStatus,
              }
            : u
        )
      );
      closeEditModal();
    } catch {
      setModalError("Network error — please try again.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleBan = async (user: UserItem) => {
    const newStatus = user.status === "banned" ? "active" : "banned";
    const confirmText =
      newStatus === "banned"
        ? `Are you sure you want to BAN ${user.name} (${user.email})? They will not be able to log in.`
        : `Unban ${user.name}? They will regain access to their account.`;

    if (!confirm(confirmText)) return;

    setActionId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Failed to update user status");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
    } catch {
      alert("Network error.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (
      !confirm(
        `⚠️ DANGER: Are you sure you want to permanently DELETE user "${user.name}" (${user.email})?\n\nThis will remove their profile and licenses. This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Failed to delete user");
        return;
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      alert("Network error.");
    } finally {
      setActionId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesQuery =
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true : (u.status || "active") === statusFilter;
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    return matchesQuery && matchesStatus && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            User Management & Moderation
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Manage user accounts, ban abusive members, edit information, or assign admin permissions.
          </p>
        </div>
        <button
          onClick={refreshUsers}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 px-3 py-1.5 text-xs text-text-muted transition-colors hover:border-slate-300 hover:text-text-primary dark:border-white/[0.08]"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* Controls: Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[260px] flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email…"
            className="input-field pl-10"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as any)}
          className="input-field w-auto py-2 text-xs"
        >
          <option value="all">All Roles</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="input-field w-auto py-2 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="banned">Banned Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[11px] uppercase tracking-wider text-text-muted dark:border-white/[0.06] dark:bg-white/[0.03]">
              <th className="px-5 py-3.5 font-semibold">User Profile</th>
              <th className="px-5 py-3.5 font-semibold">Role</th>
              <th className="px-5 py-3.5 font-semibold">Account Status</th>
              <th className="px-5 py-3.5 font-semibold">Orders</th>
              <th className="px-5 py-3.5 font-semibold">Total Spent</th>
              <th className="px-5 py-3.5 font-semibold">Joined Date</th>
              <th className="px-5 py-3.5 font-semibold text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-text-muted">
                  No users found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const isBanned = u.status === "banned";
                const isWorking = actionId === u.id;

                return (
                  <tr
                    key={u.id}
                    className={`border-b border-slate-200/60 transition-colors hover:bg-slate-100/40 dark:border-white/5 dark:hover:bg-white/[0.03] ${
                      isBanned ? "bg-red-500/[0.03]" : ""
                    }`}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                            isBanned
                              ? "bg-red-500/20 text-red-600 dark:text-red-400"
                              : "bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-violet-700 dark:text-violet-300"
                          }`}
                        >
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-text-primary flex items-center gap-1.5">
                            {u.name}
                            {isBanned && (
                              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:text-red-400">
                                BANNED
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          u.role === "admin"
                            ? "bg-violet-500/10 text-violet-700 dark:text-violet-300"
                            : "bg-slate-200/70 text-slate-700 dark:bg-white/10 dark:text-text-muted"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield size={11} className="text-violet-600 dark:text-violet-400" />
                        ) : (
                          <Users size={11} />
                        )}
                        {u.role}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          isBanned
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {isBanned ? (
                          <>
                            <Ban size={10} /> Banned
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={10} /> Active
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-text-muted">
                      {u.order_count ?? 0}
                    </td>

                    <td className="px-5 py-4 font-medium text-text-primary">
                      {formatMoney(u.total_spent_cents ?? 0)}
                    </td>

                    <td className="px-5 py-4 text-xs text-text-muted">
                      {new Date(u.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Edit Info Button */}
                        <button
                          onClick={() => openEditModal(u)}
                          disabled={isWorking}
                          title="Edit user details"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/15"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Ban / Unban Toggle */}
                        <button
                          onClick={() => handleToggleBan(u)}
                          disabled={isWorking}
                          title={isBanned ? "Unban user" : "Ban user"}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            isBanned
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                              : "border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
                          }`}
                        >
                          {isWorking ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : isBanned ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <Ban size={13} />
                          )}
                        </button>

                        {/* Delete User Button */}
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={isWorking}
                          title="Delete user"
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 bg-red-400/10 text-red-600 transition-colors hover:bg-red-500 hover:text-white dark:text-red-400"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={closeEditModal}
          />
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Edit User Account
              </h3>
              <button
                onClick={closeEditModal}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Role
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="active">Active</option>
                    <option value="banned">Banned (Suspended)</option>
                  </select>
                </div>
              </div>

              {modalError && (
                <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2.5 text-xs text-red-300">
                  {modalError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="btn-ghost py-2 px-4 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="btn-primary py-2 px-5 text-xs font-semibold"
                >
                  {saveLoading ? <Loader2 size={14} className="animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
