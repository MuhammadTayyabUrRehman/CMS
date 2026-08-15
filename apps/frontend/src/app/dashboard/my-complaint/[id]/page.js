"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import {
  categoryLabel,
  isComplaintOverdue,
  rankLabel,
  statusLabel,
} from "@/lib/lookups";

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

/* ────────────────── Main Component ────────────────── */

export default function ComplaintDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/complaints/mine/${id}`, { auth: true });
        if (!cancelled) setComplaint(res.data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load complaint.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      {/* Header with Back button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/my-complaint"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {complaint ? `Complaint ${complaint.complaintNumber}` : "Complaint"}
            </h1>
            {complaint && (
              <p className="text-sm text-muted">Submitted on {formatDate(complaint.submittedAt)}</p>
            )}
          </div>
        </div>

        {/* Badges Near Status Pill */}
        {complaint && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Rank Priority Badge */}
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
              <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Rank Priority: {rankLabel(complaint.rank)}
            </span>

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
        )}
      </div>

      {/* ─── Loading ─── */}
      {loading && (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* ─── Error ─── */}
      {!loading && error && (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="text-base font-semibold text-red-700">{error}</p>
          <Link
            href="/dashboard/my-complaint"
            className="mt-6 inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-dark"
          >
            Back to My Complaints
          </Link>
        </div>
      )}

      {/* ─── Detail Card ─── */}
      {!loading && !error && complaint && (
        <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-6 border-b border-gray-100 pb-6 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Complaint Number</span>
              <p className="mt-1 text-base font-bold text-foreground">{complaint.complaintNumber}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Category</span>
              <p className="mt-1 text-base font-bold text-foreground">{categoryLabel(complaint.category)}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Rank Priority</span>
              <p className="mt-1 text-base font-bold text-primary">{rankLabel(complaint.rank)}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Location</span>
              <p className="mt-1 text-base font-bold text-foreground">
                Room {complaint.roomNo} (Block {complaint.block})
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Contact</span>
              <p className="mt-1 text-base font-bold text-foreground">
                {complaint.contactMethod}: {complaint.contactNumber}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase text-muted">Technician</span>
              <p className="mt-1 text-base font-bold text-foreground">
                {complaint.technicianName || complaint.handler?.fullName || "Not assigned yet"}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted uppercase">Description</span>
            <p className="text-base text-foreground/90 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {complaint.description}
            </p>
          </div>

          {/* History timeline */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-base font-bold text-foreground mb-4">Activity Timeline</h3>
            {complaint.history && complaint.history.length > 0 ? (
              <div className="space-y-4">
                {complaint.history.map((h) => (
                  <div key={h.id} className="flex gap-4 items-start text-sm">
                    <div className="h-3 w-3 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {statusLabel(h.status)} - <span className="text-muted font-normal">{formatDate(h.updateDate)}</span>
                      </p>
                      <p className="text-muted">{h.comment}</p>
                      {h.handledBy?.fullName && (
                        <p className="text-xs text-muted">Handled by: {h.handledBy.fullName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">No activity recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
