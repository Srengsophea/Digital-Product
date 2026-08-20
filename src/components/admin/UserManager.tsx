"use client";

import { useState } from "react";
import { Users, Search, RefreshCw, Shield, ShieldAlert, Check, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/utils";

export interface UserItem {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  created_at: string;
  order_count?: number;
  total_spent_cents?: number;
}

export function UserManager({ initialUsers }: { initialUsers: UserItem[] }) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const handleRoleToggle = async (user: UserItem) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    if (
      !confirm(
        `Are you sure you want to change ${user.name}'s role to ${newRole.toUpperCase()}?`
      )
    )
      return;

    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error ?? "Failed to update user role");
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch {
      alert("Network error.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            User Management
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            View registered customers, purchase totals, and manage admin permissions.
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

      {/* Search */}
      <div className="relative max-w-md">
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

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/[0.07]">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-100/50 text-[11px] uppercase tracking-wider text-text-muted dark:border-white/[0.06] dark:bg-white/[0.03]">
              <th className="px-5 py-3.5 font-semibold">User</th>
              <th className="px-5 py-3.5 font-semibold">Role</th>
              <th className="px-5 py-3.5 font-semibold">Orders</th>
              <th className="px-5 py-3.5 font-semibold">Total Spent</th>
              <th className="px-5 py-3.5 font-semibold">Joined</th>
              <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b border-slate-200/60 transition-colors hover:bg-slate-100/40 dark:border-white/5 dark:hover:bg-white/[0.03]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-xs font-bold text-violet-700 dark:text-violet-300">
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">{u.name}</p>
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
                  <button
                    onClick={() => handleRoleToggle(u)}
                    disabled={updatingId === u.id}
                    className="btn-secondary py-1 px-3 text-xs"
                    title={
                      u.role === "admin"
                        ? "Demote to customer"
                        : "Promote to admin"
                    }
                  >
                    {updatingId === u.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : u.role === "admin" ? (
                      <ShieldAlert size={13} className="text-amber-600" />
                    ) : (
                      <Shield size={13} className="text-violet-600" />
                    )}
                    {u.role === "admin" ? "Demote" : "Make Admin"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
