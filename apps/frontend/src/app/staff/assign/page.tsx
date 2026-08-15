"use client";

import { useState, useEffect } from "react";
import StaffLayout from "@/components/StaffLayout";
import { api } from "@/lib/api";
import { departmentLabel } from "@/lib/lookups";

export default function StaffAssignPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load + real-time polling every 10 seconds so the IT staff
  // roster stays current without a manual page refresh.
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async (isPoll = false) => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/users/it-staff", { auth: true });
        if (!cancelled) {
          setStaff(res.data || []);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled && !isPoll) {
          setError(err.message || "Failed to load IT staff.");
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
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    api
      .get("/users/it-staff", { auth: true })
      .then((res) => {
        setStaff(res.data || []);
        setError("");
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message || "Failed to refresh IT staff."))
      .finally(() => setIsRefreshing(false));
  };

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Assign Technicians
            </h1>
            <p className="mt-1 text-sm text-muted">
              IT staff roster used when dispatching technicians from the queue.
            </p>
          </div>
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

        {error && (
          <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100/90 border-b border-gray-200">
                    <th className="px-6 py-4 font-bold text-foreground">Name</th>
                    <th className="px-6 py-4 font-bold text-foreground">Employee ID</th>
                    <th className="px-6 py-4 font-bold text-foreground">Department</th>
                    <th className="px-6 py-4 font-bold text-foreground">Email</th>
                    <th className="px-6 py-4 font-bold text-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staff.length > 0 ? (
                    staff.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-semibold text-foreground">{member.fullName}</td>
                        <td className="px-6 py-4 text-muted">{member.employeeId}</td>
                        <td className="px-6 py-4 text-muted">{departmentLabel(member.department)}</td>
                        <td className="px-6 py-4 text-muted">{member.email}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              member.isActive
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted">
                        No IT staff members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
