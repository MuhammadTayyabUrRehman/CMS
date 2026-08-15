"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { departmentLabel } from "@/lib/lookups";

/* ────────────────── Administrators (Disabled Placeholder) ──────────────────
   Backlog item E — "Assign additional admins" is not implemented on the backend
   (POST /api/admin/users/assign-admin returns success:false). This page is a
   read-only placeholder that surfaces the intended future UI. The assign
   control is deliberately disabled. */

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await api.get("/admin/users?role=ADMIN", { auth: true });
        if (cancelled) return;
        setAdmins(res.data || []);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setAdmins([]);
        setError(err.message || "Failed to load administrators.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Administrators</h1>
          <p className="mt-1 text-sm text-muted">
            Manage who has administrative access to this console.
          </p>
        </div>
      </div>

      {/* Feature notice */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
        <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <div>
          <p className="text-sm font-bold text-amber-800">
            Assigning additional administrators is not yet available.
          </p>
          <p className="text-sm text-amber-800/80">
            This feature is on the roadmap. The current admin account can continue to
            manage users and IT staff from this console.
          </p>
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
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Email</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {admins.length > 0 ? (
                  admins.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-primary-50/40">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">{a.fullName}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{a.employeeId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{departmentLabel(a.department)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{a.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled
                          title="Not yet available"
                          className="cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-gray-400"
                        >
                          Assign Admin
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted">
                      No administrators found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
