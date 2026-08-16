"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { categoryLabel } from "@/lib/lookups";

/* ────────────────── Status Pill ────────────────── */

const STATUS_STYLES = {
  NEW: "border-blue-500 bg-blue-50 text-blue-700",
  ACKNOWLEDGED: "border-indigo-500 bg-indigo-50 text-indigo-700",
};

const STATUS_LABELS = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
};

function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || STATUS_STYLES.NEW
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ────────────────── Stat Card ────────────────── */

function StatCard({ label, count, color, bgColor, icon }) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{count}</p>
      </div>
    </div>
  );
}

/* ────────────────── Icons ────────────────── */

function DocumentIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function ClockIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArchiveIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

/* ────────────────── Dashboard Page ────────────────── */

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api
      .get("/complaints/mine", { auth: true })
      .then((res) => {
        if (cancelled) return;
        setComplaints(res.data || []);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.statusCode === 403) {
          setLoadError("This dashboard is for regular users. Staff and administrators use their own consoles.");
        } else {
          setLoadError(err.message || "Failed to load your complaints.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const newCount = complaints.filter((c) => c.status === "NEW").length;
  const acknowledgedCount = complaints.filter((c) => c.status === "ACKNOWLEDGED").length;
  const recentComplaints = complaints.slice(0, 5);

  const stats = [
    {
      label: "Total Complaints",
      count: complaints.length,
      color: "text-primary",
      bgColor: "bg-primary-50",
      icon: <DocumentIcon className="h-8 w-8 text-primary" />,
    },
    {
      label: "New",
      count: newCount,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      icon: <ClockIcon className="h-8 w-8 text-amber-500" />,
    },
    {
      label: "Acknowledged",
      count: acknowledgedCount,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      icon: <CheckIcon className="h-8 w-8 text-emerald-500" />,
    },
  ];

  return (
    <div>
      {/* Page Heading */}
      <h1 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>

      {/* ─── Stat Cards ─── */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {loading ? (
        <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-muted">
          Loading your complaints…
        </p>
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm font-semibold text-red-700">
          {loadError}
        </div>
      ) : (
        <>
          {/* ─── Recent Complaints ─── */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-foreground">Recent Complaints</h2>
            </div>

            {recentComplaints.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-muted">You haven&apos;t submitted any complaints yet.</p>
                <Link
                  href="/dashboard/submit-complaint"
                  className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
                >
                  Submit your first complaint
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-100/80">
                      <th className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">ID</th>
                      <th className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">Category</th>
                      <th className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">Status</th>
                      <th className="whitespace-nowrap px-6 py-4 text-sm font-bold text-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentComplaints.map((complaint) => (
                      <tr key={complaint.id} className="transition-colors hover:bg-primary-50/40">
                        <td className="whitespace-nowrap px-6 py-4 font-semibold text-primary">
                          {complaint.complaintNumber || complaint.id}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-foreground">
                          {categoryLabel(complaint.category)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <StatusPill status={complaint.status} />
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted">
                          {formatDate(complaint.submittedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* View All Button */}
            <div className="flex justify-end border-t border-gray-100 px-6 py-4">
              <Link
                href="/dashboard/my-complaint"
                id="view-all-btn"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md active:scale-[0.97]"
              >
                View All
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ─── About Us Section ─── */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">About Us</h2>

        {/* IT Department */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-bold text-primary">IT Department</h3>
          <p className="mb-3 leading-relaxed text-foreground/80">
            The IT Department of the Finance Division, Government of Pakistan, is dedicated to
            delivering secure, reliable, and innovative technology services that support the
            Ministry&apos;s operations.
          </p>
          <p className="leading-relaxed text-foreground/80">
            The Complaint Portal has been developed to provide employees and authorized
            users with a transparent, efficient, and user-friendly platform for reporting
            IT-related issues, tracking complaint status, and receiving timely resolutions.
          </p>
        </div>

        {/* Our Mission */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-bold text-primary">Our Mission</h3>
          <p className="leading-relaxed text-foreground/80">
            To provide efficient, secure, and high-quality IT support services by ensuring
            timely resolution of technical issues, maintaining reliable digital infrastructure,
            and enhancing user satisfaction through continuous innovation and professional
            excellence.
          </p>
        </div>

        {/* Our Vision */}
        <div className="mb-6">
          <h3 className="mb-3 text-lg font-bold text-primary">Our Vision</h3>
          <p className="leading-relaxed text-foreground/80">
            To become a leading public sector IT service provider that enables digital
            transformation, promotes operational excellence, and delivers reliable technology
            solutions for the Finance Division.
          </p>
        </div>

        {/* Our Core Values + Building Photo */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Values list */}
          <div className="flex-1">
            <h3 className="mb-4 text-lg font-bold text-primary">Our Core Values</h3>
            <ul className="space-y-2.5">
              {[
                "Integrity",
                "Transparency",
                "Accountability",
                "Innovation",
                "Professionalism",
                "Customer Satisfaction",
                "Continuous Improvement",
              ].map((value) => (
                <li key={value} className="flex items-center gap-3 text-foreground/80">
                  <span className="flex h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {value}
                </li>
              ))}
            </ul>
          </div>

          {/* Building photo */}
          <div className="relative h-64 w-full overflow-hidden rounded-xl shadow-lg sm:h-72 lg:h-80 lg:w-[45%]">
            <Image
              src="/gov-building.png"
              alt="Government building of Finance Division"
              fill
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
            {/* Bottom green wave overlay */}
            <div className="absolute bottom-0 left-0 right-0 z-10 h-16 bg-gradient-to-t from-primary-dark/80 via-primary/40 to-transparent" />
            <svg
              className="absolute bottom-0 left-0 right-0 z-10 w-full text-primary"
              viewBox="0 0 400 40"
              preserveAspectRatio="none"
              fill="currentColor"
            >
              <path d="M0,20 Q50,0 100,15 Q150,30 200,18 Q250,6 300,20 Q350,34 400,15 L400,40 L0,40 Z" opacity="0.7" />
              <path d="M0,25 Q60,10 120,22 Q180,34 240,20 Q300,8 360,25 Q380,30 400,22 L400,40 L0,40 Z" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
