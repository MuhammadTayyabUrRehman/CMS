"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import StaffLayout from "@/components/StaffLayout";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { categoryLabel, isComplaintOverdue, rankLabel } from "@/lib/lookups";

function formatDateTime(iso) {
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

/* ────────────────── Rank Badge ────────────────── */

function RankBadge({ rank }: { rank: number }) {
  const badgeStyles: Record<number, string> = {
    22: "border-purple-300 bg-purple-100 text-purple-900",
    21: "border-indigo-300 bg-indigo-100 text-indigo-900",
    20: "border-blue-300 bg-blue-100 text-blue-900",
    19: "border-emerald-300 bg-emerald-100 text-emerald-900",
    18: "border-gray-300 bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
        badgeStyles[rank] || "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {rankLabel(rank)}
    </span>
  );
}

/* ────────────────── Main Staff Queue Page ────────────────── */

export default function StaffQueuePage() {
  const [queue, setQueue] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [techList, setTechList] = useState([]);
  const [technicianName, setTechnicianName] = useState("");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchError, setDispatchError] = useState("");

  const fetchQueue = useCallback(async (page) => {
    const res = await api.get(`/employee/queue?page=${page}`, { auth: true });
    return {
      data: res.data || [],
      pagination: res.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
    };
  }, []);

  // Initial load + real-time polling every 10 seconds so new complaints
  // appear in the queue without a manual page refresh.
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async (isPoll = false) => {
      try {
        const { data, pagination } = await fetchQueue(currentPage);
        if (cancelled) return;
        setQueue(data);
        setPagination(pagination);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        // Only surface the error on the initial load; transient poll
        // failures should not blank the queue.
        if (!isPoll) {
          setQueue([]);
          setError(err.message || "Failed to load queue.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    load();
    intervalId = setInterval(() => load(true), 10000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [currentPage, fetchQueue]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchQueue(currentPage)
      .then(({ data, pagination }) => {
        setQueue(data);
        setPagination(pagination);
        setError("");
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message || "Failed to refresh queue."))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    api
      .get("/users/it-staff", { auth: true })
      .then((res) => setTechList(res.data || []))
      .catch(() => setTechList([]));
  }, []);

  const handleOpenDispatchModal = (complaint) => {
    setSelectedComplaint(complaint);
    setTechnicianName(techList[0]?.fullName || "");
    setDispatchError("");
  };

  const handleConfirmDispatch = async (e) => {
    e.preventDefault();
    if (!selectedComplaint || !technicianName.trim()) return;

    setIsDispatching(true);
    setDispatchError("");
    try {
      await api.patch(
        `/assignments/${selectedComplaint.id}`,
        { technicianName: technicianName.trim() },
        { auth: true }
      );
      setSelectedComplaint(null);
      setTechnicianName("");
      const { data, pagination } = await fetchQueue(currentPage);
      setQueue(data);
      setPagination(pagination);
    } catch (err) {
      setDispatchError(err.message || "Dispatch failed. Please try again.");
    } finally {
      setIsDispatching(false);
    }
  };

  const pendingCount = queue.filter((c) => c.status === "NEW").length;
  const dispatchedCount = queue.filter((c) => c.status === "ACKNOWLEDGED").length;

  return (
    <StaffLayout>
      <div className="space-y-6">
        {/* Page Heading & Stats Summary */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              IT Dispatch Queue
            </h1>
            <p className="mt-1 text-sm text-muted">
              Incoming complaints ordered by Officer Rank Priority and submission time.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-center shadow-xs">
                <span className="block text-xs font-semibold text-amber-800 uppercase">Pending Dispatch</span>
                <span className="text-xl font-extrabold text-amber-900">{pendingCount}</span>
              </div>
              <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-center shadow-xs">
                <span className="block text-xs font-semibold text-emerald-800 uppercase">Dispatched</span>
                <span className="text-xl font-extrabold text-emerald-900">{dispatchedCount}</span>
              </div>
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
            {/* ─── Complaints Queue Table Card ─── */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100/90 border-b border-gray-200">
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                        ID
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                        Rank Priority
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                        Room / Block
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                        Problem Details
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm">
                        Submitted Time
                      </th>
                      <th className="whitespace-nowrap px-6 py-4 font-bold text-foreground text-sm text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {queue.length > 0 ? (
                      queue.map((item) => {
                        const isDispatched = item.status === "ACKNOWLEDGED";
                        const isVVIP = item.rank >= 20;
                        const isOverdue = isComplaintOverdue(item);

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors hover:bg-primary-50/30 ${
                              isVVIP ? "bg-alert-50/50" : ""
                            }`}
                          >
                            {/* ID */}
                            <td
                              className={`whitespace-nowrap px-6 py-4 font-extrabold text-primary text-base ${
                                isVVIP ? "border-l-4 border-alert" : ""
                              }`}
                            >
                              {item.complaintNumber}
                            </td>

                            {/* Rank */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <div className="flex flex-col items-start gap-1.5">
                                <RankBadge rank={item.rank} />
                                {isVVIP && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-alert/40 bg-alert-50 px-2.5 py-0.5 text-[11px] font-bold text-alert-dark">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18h-9m4.5-4.5V3m-3.75 4.5L12 3l4.25 4.5" />
                                    </svg>
                                    VVIP
                                  </span>
                                )}
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-400 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Overdue
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Room/Block */}
                            <td className="whitespace-nowrap px-6 py-4 font-semibold text-foreground">
                              Room {item.roomNo}, Block {item.block}
                            </td>

                            {/* Problem */}
                            <td className="px-6 py-4 max-w-xs sm:max-w-sm">
                              <span className="block text-xs font-bold text-primary uppercase tracking-wide">
                                {categoryLabel(item.category)}
                              </span>
                              <span className="block text-sm text-foreground/90 font-medium line-clamp-2">
                                {item.description}
                              </span>
                            </td>

                            {/* Submitted Time */}
                            <td className="whitespace-nowrap px-6 py-4">
                              <span className="text-sm font-semibold text-foreground">
                                {formatDateTime(item.submittedAt)}
                              </span>
                            </td>

                            {/* Action */}
                            <td className="whitespace-nowrap px-6 py-4 text-right">
                              <div className="inline-flex flex-col items-end gap-1.5">
                                {isDispatched && item.technicianName ? (
                                  <div className="inline-flex flex-col items-end text-xs">
                                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                      <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                      Dispatched
                                    </span>
                                    <span className="text-gray-500 font-medium">
                                      Tech: {item.technicianName} ({formatDateTime(item.dispatchTime)})
                                    </span>
                                  </div>
                                ) : item.status === "NEW" ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDispatchModal(item)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md active:scale-[0.97]"
                                  >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                    Acknowledge &amp; Dispatch
                                  </button>
                                ) : (
                                  <StatusBadge status={item.status} />
                                )}
                                <Link
                                  href={`/staff/history?complaintId=${item.id}`}
                                  className="text-xs font-semibold text-primary hover:underline"
                                >
                                  View History
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted">
                          No complaints in the queue.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ─── Pagination Footer ─── */}
            {pagination.pages > 0 && (
              <div className="flex items-center justify-between pt-2 text-sm">
                <p className="font-semibold text-foreground">
                  Page {pagination.page} of {pagination.pages} ({pagination.total} entries)
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
                  <span>{currentPage}</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={currentPage >= pagination.pages}
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

      {/* ─── Acknowledge & Dispatch Modal ─── */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Acknowledge &amp; Dispatch Technician
                </h3>
                <p className="text-xs text-primary font-semibold">
                  Complaint ID: {selectedComplaint.complaintNumber} ({rankLabel(selectedComplaint.rank)})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-foreground"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="mt-4 space-y-4">
              {/* Location & Problem Summary */}
              <div className="rounded-lg bg-gray-50 p-3 border border-gray-200 text-xs space-y-1">
                <p><span className="font-bold text-gray-700">Location:</span> Room {selectedComplaint.roomNo}, Block {selectedComplaint.block}</p>
                <p><span className="font-bold text-gray-700">Issue:</span> {selectedComplaint.description}</p>
              </div>

              {/* Technician Name */}
              <div>
                <label htmlFor="tech-name" className="block text-xs font-bold text-foreground mb-1">
                  Technician *
                </label>
                {techList.length > 0 ? (
                  <select
                    id="tech-name"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                    required
                    autoFocus
                  >
                    {techList.map((tech) => (
                      <option key={tech.id} value={tech.fullName}>
                        {tech.fullName} ({tech.employeeId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="tech-name"
                    type="text"
                    placeholder="e.g. Engr. Tariq Mahmood"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                    required
                    autoFocus
                  />
                )}
              </div>

              {/* Dispatch error */}
              {dispatchError && (
                <p className="rounded bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-700">
                  {dispatchError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-foreground hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDispatching}
                  className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDispatching ? "Dispatching…" : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </StaffLayout>
  );
}
