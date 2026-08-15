"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { getDepartments, departmentLabel } from "@/lib/lookups";

const DEPARTMENTS = getDepartments();

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

/* ────────────────── Add IT Staff Modal ────────────────── */

function AddStaffModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    fullName: "",
    employeeId: "",
    department: "IT_DEPARTMENT",
    email: "",
    phone: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setFieldErrors({});
    try {
      await api.post("/admin/users/it-staff", { ...form, phone: form.phone || undefined }, { auth: true });
      onCreated();
    } catch (err) {
      setError(err.message || "Failed to create IT staff member.");
      const errors = {};
      (err.errors || []).forEach((item) => {
        errors[item.field] = item.message;
      });
      if (Object.keys(errors).length) setFieldErrors(errors);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">Add IT Staff Member</h3>
            <p className="text-xs text-muted">
              Create a new staff account with login credentials.
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

        <form onSubmit={handleSubmit} className="max-h-[calc(90vh-80px)] space-y-4 overflow-y-auto p-6">
          <div>
            <label htmlFor="staff-full-name" className="mb-1 block text-xs font-bold text-foreground">
              Full Name *
            </label>
            <input
              id="staff-full-name"
              name="fullName"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.fullName}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="staff-employee-id" className="mb-1 block text-xs font-bold text-foreground">
                Employee ID *
              </label>
              <input
                id="staff-employee-id"
                name="employeeId"
                type="text"
                value={form.employeeId}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
              {fieldErrors.employeeId && (
                <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.employeeId}</p>
              )}
            </div>

            <div>
              <label htmlFor="staff-department" className="mb-1 block text-xs font-bold text-foreground">
                Department *
              </label>
              <select
                id="staff-department"
                name="department"
                value={form.department}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              {fieldErrors.department && (
                <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.department}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="staff-email" className="mb-1 block text-xs font-bold text-foreground">
              Email *
            </label>
            <input
              id="staff-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="staff-phone" className="mb-1 block text-xs font-bold text-foreground">
              Phone (optional)
            </label>
            <input
              id="staff-phone"
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="staff-password" className="mb-1 block text-xs font-bold text-foreground">
              Password *
            </label>
            <div className="relative">
              <input
                id="staff-password"
                name="password"
                type={showStaffPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                required
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                id="toggle-staff-password"
                onClick={() => setShowStaffPassword(!showStaffPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-muted hover:text-foreground transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.878 5.523a.75.75 0 011.137 0l.66 1.452a.75.75 0 01.109.538l-.324.78a.75.75 0 01-.526
43.878 5.523a.75.75 0 01-1.137 0l-.66-1.452a.75.75 0 01-.109-.538l.324-.78a.75.75 0 01.526zM12 7a5 5 0 110 10 5 5 0 010-10z"
                  />
                </svg>
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 text-xs font-semibold text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {error && (
            <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">{error}</p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-foreground hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Creating…" : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ────────────────── Delete Confirmation Modal ────────────────── */

function DeleteStaffModal({ staff, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setDeleting(true);
    setError("");
    try {
      await api.del(`/admin/users/${staff.id}`, { auth: true });
      onDeleted();
    } catch (err) {
      setError(err.message || "Failed to delete IT staff member.");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-lg font-bold text-foreground">Delete IT Staff Member</h3>
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

        <p className="mt-4 text-sm text-foreground/80">
          Are you sure you want to permanently delete{" "}
          <span className="font-bold text-foreground">{staff.fullName}</span> (
          {staff.employeeId})? This action cannot be undone.
        </p>
        <p className="mt-2 text-xs text-muted">
          Staff members with complaint records linked to them cannot be deleted.
        </p>

        {error && (
          <p className="mt-4 rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">{error}</p>
        )}

        <div className="mt-5 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-foreground hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="rounded-lg bg-alert px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-alert-dark active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Deleting…" : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── IT Staff Management Page ────────────────── */

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadStaff = useCallback(async () => {
    const res = await api.get("/users/it-staff", { auth: true });
    return res.data || [];
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await loadStaff();
        if (cancelled) return;
        setStaff(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setStaff([]);
        setError(err.message || "Failed to load IT staff.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [loadStaff]);

  const handleCreated = async () => {
    setAddOpen(false);
    const data = await loadStaff();
    setStaff(data);
  };

  const handleDeleted = async () => {
    setDeleteTarget(null);
    const data = await loadStaff();
    setStaff(data);
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">IT Staff Management</h1>
          <p className="mt-1 text-sm text-muted">
            Manage the IT staff accounts that work the dispatch queue.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md active:scale-[0.97]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add IT Staff
        </button>
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
                  <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground">Joined</th>
                  <th className="whitespace-nowrap px-6 py-4 text-right font-bold text-foreground">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.length > 0 ? (
                  staff.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-primary-50/40">
                      <td className="whitespace-nowrap px-6 py-4 font-bold text-foreground">{s.fullName}</td>
                      <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">{s.employeeId}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{departmentLabel(s.department)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{s.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-muted">{formatDate(s.createdAt)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(s)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-alert/40 bg-white px-3.5 py-1.5 text-xs font-bold text-alert-dark transition-colors hover:bg-alert-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted">
                      No IT staff members found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add Modal ─── */}
      {addOpen && (
        <AddStaffModal onClose={() => setAddOpen(false)} onCreated={handleCreated} />
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteTarget && (
        <DeleteStaffModal staff={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} />
      )}
    </div>
  );
}