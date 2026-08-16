"use client";

import { useState, useEffect, useCallback } from "react";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { categoryLabel, departmentLabel } from "@/lib/lookups";

const ROLE_FILTERS = [
  { value: "", label: "All Roles" },
  { value: "USER", label: "Users" },
  { value: "IT_STAFF", label: "IT Staff" },
  { value: "ADMIN", label: "Admins" },
];

const ROLE_STYLES = {
  ADMIN: "border-purple-300 bg-purple-100 text-purple-900",
  IT_STAFF: "border-blue-300 bg-blue-100 text-blue-900",
  USER: "border-gray-300 bg-gray-100 text-gray-700",
};

function RoleBadge({ role }) {
  const labelMap = { ADMIN: "Admin", IT_STAFF: "IT Staff", USER: "User" };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        ROLE_STYLES[role] || ROLE_STYLES.USER
      }`}
    >
      {labelMap[role] || role}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_ORDER = ["NEW", "ACKNOWLEDGED"];

/* ────────────────── Activity Modal ────────────────── */

function ActivityModal({ user, onClose }) {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api
      .get(`/admin/users/${user.id}/activity`, { auth: true })
      .then((res) => {
        if (cancelled) return;
        setActivity(res.data);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Failed to load user activity.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">User Activity</h3>
            <p className="text-xs text-muted">
              {activity ? `${activity.fullName} (${activity.employeeId})` : user.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-foreground"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">{error}</p>
          ) : activity ? (
            <div className="space-y-6">
              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Assigned</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{activity.assignedComplaints}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Submitted</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{activity.submittedComplaints}</p>
                </div>
              </div>

              {/* Status breakdown */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                  Complaints by Status
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {STATUS_ORDER.map((s) => (
                    <div
                      key={s}
                      className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5"
                    >
                      <StatusBadge status={s} />
                      <span className="text-sm font-bold text-foreground">{activity.countsByStatus?.[s] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent complaints */}
              <div>
                <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">
                  Recent Complaints
                </h4>
                {activity.recentComplaints && activity.recentComplaints.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50">
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">No.</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Category</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Status</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Role</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted">Submitted</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {activity.recentComplaints.map((c) => (
                          <tr key={c.id} className="hover:bg-primary-50/40">
                            <td className="whitespace-nowrap px-4 py-3 font-bold text-primary">{c.complaintNumber}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-foreground">{categoryLabel(c.category)}</td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <StatusBadge status={c.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                                  c.role === "ASSIGNED"
                                    ? "border-blue-300 bg-blue-50 text-blue-800"
                                    : "border-gray-300 bg-gray-100 text-gray-700"
                                }`}
                              >
                                {c.role === "ASSIGNED" ? "Assigned" : "Submitted"}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(c.submittedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-lg bg-gray-50 px-4 py-6 text-center text-sm text-muted">
                    No complaint activity for this user.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ────────────────── User Management Page ────────────────── */

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const effectivePage = Math.min(currentPage, totalPages);
  const pagedUsers = users.slice((effectivePage - 1) * pageSize, effectivePage * pageSize);

  const loadUsers = useCallback(async (role) => {
    const qs = role ? `?role=${role}` : "";
    const res = await api.get(`/admin/users${qs}`, { auth: true });
    return res.data || [];
  }, []);

  // Initial load + real-time polling every 10 seconds so new users
  // appear without a manual page refresh.
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async (isPoll = false) => {
      try {
        const data = await loadUsers(roleFilter);
        if (cancelled) return;
        setUsers(data);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        if (!isPoll) {
          setUsers([]);
          setError(err.message || "Failed to load users.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    intervalId = setInterval(() => load(true), 10000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [roleFilter, loadUsers]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    loadUsers(roleFilter)
      .then((data) => {
        setUsers(data);
        setError("");
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message || "Failed to refresh users."))
      .finally(() => setIsRefreshing(false));
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">User Management</h1>
          <p className="mt-1 text-sm text-muted">
            All registered portal accounts. Click a user to view their complaint activity.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Role filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Filter</span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            >
              {ROLE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          {/* Live indicator + manual refresh */}
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Live · auto-refreshes every 10s
            </span>
            {lastUpdated && (
              <span className="font-medium">
                Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 font-semibold text-primary transition hover:bg-primary-50 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Error Message ─── */}
      {error && (
        <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {/* ─── Loading ─── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100/90">
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Name</th>
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Employee ID</th>
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Department</th>
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Role</th>
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Status</th>
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Joined</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (
                  pagedUsers.map((user) => (
                    <tr key={user.id} className="transition-colors hover:bg-primary-50/40">
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="block font-bold text-foreground">{user.fullName}</span>
                        <span className="block text-xs text-muted">{user.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{user.employeeId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{departmentLabel(user.department)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{formatDate(user.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-xs font-bold text-foreground transition-colors hover:border-primary hover:text-primary"
                        >
                          View Activity
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {users.length > pageSize && (
            <div className="flex items-center justify-center gap-2 border-t border-gray-200 px-4 py-4">
              <button type="button" disabled={effectivePage === 1} onClick={() => setCurrentPage(effectivePage - 1)} className="rounded border px-3 py-1.5 text-sm font-semibold disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button key={page} type="button" onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded text-sm font-bold ${page === effectivePage ? "bg-primary text-white" : "border hover:border-primary"}`}>{page}</button>
              ))}
              <button type="button" disabled={effectivePage === totalPages} onClick={() => setCurrentPage(effectivePage + 1)} className="rounded border px-3 py-1.5 text-sm font-semibold disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      )}

      {/* ─── Activity Modal ─── */}
      {selectedUser && (
        <ActivityModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}
