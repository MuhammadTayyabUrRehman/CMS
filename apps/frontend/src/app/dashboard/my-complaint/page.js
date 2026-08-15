"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { isComplaintOverdue, statusLabel } from "@/lib/lookups";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/* ────────────────── Eye Icons ────────────────── */

function EyeIcon({ isFilled }) {
  if (isFilled) {
    return (
      <svg className="h-7 w-7 text-black transition-transform hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    );
  }
  return (
    <svg className="h-7 w-7 text-black transition-transform hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <circle cx="12" cy="12" r="3" strokeWidth={1.8} />
    </svg>
  );
}

/* ────────────────── Main Component ────────────────── */

export default function MyComplaintsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, totalRecords: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/complaints/mine?page=${currentPage}`, { auth: true });
        if (cancelled) return;
        setComplaints(res.data || []);
        setPagination(res.pagination || { page: 1, limit: 20, totalRecords: 0, totalPages: 0 });
      } catch (err) {
        if (cancelled) return;
        setError(err.message || "Failed to load complaints.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const filteredComplaints = complaints.filter((item) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      item.complaintNumber.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      statusLabel(item.status).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ─── Top Header: Title + Search Bar ─── */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          My Complaints
        </h1>

        {/* Search Bar */}
        <div className="relative flex w-full items-center rounded-xl border border-primary-300 bg-primary-100 px-4 py-2.5 shadow-xs sm:w-80">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-foreground/70 focus:outline-none"
          />
          <svg className="h-6 w-6 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
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
        <>
          {/* ─── Complaints Table Card ─── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-100/90">
                    <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                      ID
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                      Description
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                      Status
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                      Date
                    </th>
                    <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((complaint) => (
                      <tr
                        key={complaint.id}
                        className="transition-colors hover:bg-primary-50/30"
                      >
                        <td className="whitespace-nowrap px-6 py-5 font-bold text-black text-base">
                          {complaint.complaintNumber}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-base text-foreground">
                          {complaint.description.length > 60
                            ? `${complaint.description.slice(0, 60)}…`
                            : complaint.description}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <div className="flex flex-col items-start gap-1.5">
                            <StatusBadge status={complaint.status} />
                            {isComplaintOverdue(complaint) && (
                              <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-5 text-base text-foreground">
                          {formatDate(complaint.submittedAt)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-5">
                          <Link
                            href={`/dashboard/my-complaint/${complaint.id}`}
                            aria-label={`View details for ${complaint.complaintNumber}`}
                            className="inline-flex items-center justify-center p-1 text-black hover:text-primary transition-colors"
                          >
                            <EyeIcon isFilled={false} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted">
                        {searchQuery
                          ? "No complaints found matching your search."
                          : "No complaints submitted yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Pagination Footer ─── */}
          {pagination.totalPages > 0 && (
            <div className="flex flex-col items-center justify-between gap-4 pt-2 sm:flex-row text-sm">
              <p className="font-semibold text-foreground">
                Showing {filteredComplaints.length} of {pagination.totalRecords} entries
              </p>

              <div className="flex items-center gap-3 font-semibold text-foreground">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="hover:text-primary disabled:opacity-40"
                >
                  &lt;
                </button>
                <span>
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage >= pagination.totalPages}
                  className="hover:text-primary disabled:opacity-40"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
