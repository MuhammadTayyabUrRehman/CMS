"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";

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

function AdminHistoryContent() {
  const searchParams = useSearchParams();
  const complaintId = searchParams.get("complaintId");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [manualId, setManualId] = useState(complaintId || "");

  const fetchHistory = useCallback(async (id) => {
    const res = await api.get(`/history/assignments/${id}`, { auth: true });
    return res.data || [];
  }, []);

  useEffect(() => {
    if (!complaintId) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchHistory(complaintId);
        if (cancelled) return;
        setHistory(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setHistory([]);
        setError(err.message || "Failed to load history.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [complaintId, fetchHistory]);

  const handleLoad = async (e) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchHistory(id);
      setHistory(data);
      setError("");
    } catch (err) {
      setHistory([]);
      setError(err.message || "Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Complaint History
          </h1>
          <p className="mt-1 text-sm text-muted">
            Assignment &amp; status timeline for a single complaint.
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-foreground hover:bg-gray-50"
        >
          Back to Console
        </Link>
      </div>

      {/* Complaint ID selector */}
      <form
        onSubmit={handleLoad}
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
      >
        <label htmlFor="history-complaint-id" className="text-sm font-bold text-foreground shrink-0">
          Complaint ID
        </label>
        <input
          id="history-complaint-id"
          type="text"
          placeholder="Paste a complaint ID (e.g. a UUID from the dashboard or notifications)"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3.5 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !manualId.trim()}
          className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Loading…" : "Load"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Empty state (no complaint selected) */}
      {!loading && !complaintId && !history.length && !error && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-base font-semibold text-foreground">
            Select a complaint to view its history.
          </p>
          <p className="mt-2 text-sm text-muted">
            Use the input above with a complaint ID from the dispatch queue, or open
            a notification to jump straight here.
          </p>
        </div>
      )}

      {/* History table */}
      {!loading && (complaintId || history.length > 0) && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-100/90 border-b border-gray-200">
                <th className="px-6 py-4 font-bold text-foreground">Status</th>
                <th className="px-6 py-4 font-bold text-foreground">Comment</th>
                <th className="px-6 py-4 font-bold text-foreground">Handled By</th>
                <th className="px-6 py-4 font-bold text-foreground">Updated At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {history.length > 0 ? (
                history.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <StatusBadge status={entry.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground/90">{entry.comment || "—"}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {entry.handledBy?.fullName || "System"}
                    </td>
                    <td className="px-6 py-4 text-xs text-muted">{formatDateTime(entry.updateDate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    No history recorded for this complaint.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AdminHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <AdminHistoryContent />
    </Suspense>
  );
}
