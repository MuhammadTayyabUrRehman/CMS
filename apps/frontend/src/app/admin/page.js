"use client";

import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import StatusBadge from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { categoryLabel } from "@/lib/lookups";

// Hex values mirror the design tokens in globals.css (@theme).
const CHART_COLORS = {
  primary: "#0B7A3E",
  primaryDark: "#065A2D",
  alert: "#DC2626",
  emerald: "#10B981",
  emeraldDark: "#065F46",
  gray: "#D1D5DB",
  muted: "#6B7280",
};

const PERIODS = [
  { value: "daily", label: "Daily" },
  { value: "last7days", label: "7 Days" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const STATUS_ORDER = ["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "ESCALATED", "RESOLVED", "CLOSED"];

const CATEGORY_ORDER = ["SOFTWARE_HARDWARE", "INTERNET", "E_OFFICE", "OTHER"];

function formatSeconds(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(seconds)) return "—";
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem ? `${hours}h ${rem}m` : `${hours}h`;
}

const PERIOD_UNITS = {
  daily: "hour",
  last7days: "day",
  weekly: "week",
  monthly: "month",
  yearly: "year",
};

function periodUnitLabel(period) {
  return PERIOD_UNITS[period] || "day";
}

function StatCard({ label, value, sub, color, bgColor, icon }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md sm:gap-4 sm:p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${bgColor} sm:h-14 sm:w-14`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted sm:text-xs sm:tracking-wider">
          {label}
        </p>
        <p className={`truncate text-xl font-bold ${color} sm:text-2xl`}>{value}</p>
        {sub ? <p className="truncate text-[11px] text-muted sm:text-xs">{sub}</p> : null}
      </div>
    </div>
  );
}

/* ────────────────── Stat Card Icons ────────────────── */

const IconTotal = (
  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconToday = (
  <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconVvip = (
  <svg className="h-8 w-8 text-alert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18h-9m4.5-4.5V3m-3.75 4.5L12 3l4.25 4.5" />
  </svg>
);

const IconResponse = (
  <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconResolution = (
  <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ────────────────── Admin Dashboard Page ────────────────── */

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [period, setPeriod] = useState("last7days");
  const [trends, setTrends] = useState({ buckets: [] });
  const [resolvedEscalated, setResolvedEscalated] = useState({ buckets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial load + real-time polling every 10 seconds so the dashboard
  // stays live without a manual page refresh.
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async (isPoll = false) => {
      try {
        const res = await api.get("/admin/dashboard", { auth: true });
        if (cancelled) return;
        setSummary(res.data);
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        if (!isPoll) {
          setError(err.message || "Failed to load dashboard summary.");
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

  // Charts load on period change + poll every 10 seconds.
  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async (isPoll = false) => {
      try {
        const [trendRes, reRes] = await Promise.all([
          api.get(`/admin/dashboard/trends?period=${period}`, { auth: true }),
          api.get(`/admin/dashboard/resolved-escalated?period=${period}`, { auth: true }),
        ]);
        if (cancelled) return;
        setTrends(trendRes.data || { buckets: [] });
        setResolvedEscalated(reRes.data || { buckets: [] });
        setError("");
        setLastUpdated(new Date());
      } catch (err) {
        if (cancelled) return;
        if (!isPoll) {
          setError(err.message || "Failed to load dashboard charts.");
        }
      }
    };

    load();
    intervalId = setInterval(() => load(true), 10000);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [period]);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    Promise.all([
      api.get("/admin/dashboard", { auth: true }),
      api.get(`/admin/dashboard/trends?period=${period}`, { auth: true }),
      api.get(`/admin/dashboard/resolved-escalated?period=${period}`, { auth: true }),
    ])
      .then(([summaryRes, trendRes, reRes]) => {
        setSummary(summaryRes.data);
        setTrends(trendRes.data || { buckets: [] });
        setResolvedEscalated(reRes.data || { buckets: [] });
        setError("");
        setLastUpdated(new Date());
      })
      .catch((err) => setError(err.message || "Failed to refresh dashboard."))
      .finally(() => setIsRefreshing(false));
  };

  const summaryData = summary || {
    totalComplaints: 0,
    todaysComplaints: 0,
    vipComplaints: 0,
    averageResponseTimeSeconds: null,
    averageResolutionTimeSeconds: null,
    countsByStatus: {},
    complaintsByCategory: {},
  };

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: summaryData.countsByStatus?.[s] ?? 0,
  }));
  const totalStatusCount = statusCounts.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Live overview of complaints, staff performance and system activity.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Period filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Range</span>
            <div className="flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                    period === p.value
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-600 hover:bg-primary-50 hover:text-primary"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
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
        <>
          {/* ─── Stat Cards ─── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
            <StatCard
              label="Total Complaints"
              value={summaryData.totalComplaints}
              bgColor="bg-primary-50"
              color="text-primary"
              icon={IconTotal}
            />
            <StatCard
              label="Today's Complaints"
              value={summaryData.todaysComplaints}
              bgColor="bg-amber-50"
              color="text-amber-600"
              icon={IconToday}
            />
            <StatCard
              label="VVIP Complaints"
              value={summaryData.vipComplaints}
              bgColor="bg-alert-50"
              color="text-alert-dark"
              icon={IconVvip}
            />
            <StatCard
              label="Avg Response"
              value={formatSeconds(summaryData.averageResponseTimeSeconds)}
              bgColor="bg-blue-50"
              color="text-blue-600"
              icon={IconResponse}
            />
            <StatCard
              label="Avg Resolution"
              value={formatSeconds(summaryData.averageResolutionTimeSeconds)}
              bgColor="bg-emerald-50"
              color="text-emerald-600"
              icon={IconResolution}
            />
          </div>

          {/* ─── Charts Row ─── */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Total Complaints Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">Complaint Trend</h2>
                <p className="text-xs text-muted">
                  Total complaints per {periodUnitLabel(trends.period)}.
                </p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends.buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gray} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.gray }} />
                    <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(11, 122, 62, 0.08)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #D1D5DB", fontSize: 12 }}
                    />
                    <Bar dataKey="count" name="Complaints" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resolved vs Escalated Chart */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-foreground">Resolved vs Escalated</h2>
                <p className="text-xs text-muted">
                  Complaint outcomes per {periodUnitLabel(resolvedEscalated.period)}.
                </p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resolvedEscalated.buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gray} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_COLORS.gray }} />
                    <YAxis allowDecimals={false} tick={{ fill: CHART_COLORS.muted, fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "rgba(0,0,0,0.05)" }}
                      contentStyle={{ borderRadius: 12, border: "1px solid #D1D5DB", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="resolved" name="Resolved" fill={CHART_COLORS.emerald} radius={[4, 4, 0, 0]} maxBarSize={30} />
                    <Bar dataKey="escalated" name="Escalated" fill={CHART_COLORS.alert} radius={[4, 4, 0, 0]} maxBarSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ─── Status & Category Breakdown ─── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Status breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-foreground">Status Breakdown</h2>
              <div className="space-y-3">
                {statusCounts.map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between gap-3">
                    <StatusBadge status={status} />
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: totalStatusCount ? `${(count / totalStatusCount) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-8 text-right text-sm font-bold text-foreground">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-foreground">Complaints by Category</h2>
              <div className="space-y-3">
                {CATEGORY_ORDER.map((cat) => {
                  const count = summaryData.complaintsByCategory?.[cat] ?? 0;
                  return (
                    <div key={cat} className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">{categoryLabel(cat)}</span>
                      <div className="flex flex-1 items-center gap-3">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-alert"
                            style={{ width: totalStatusCount ? `${(count / totalStatusCount) * 100}%` : "0%" }}
                          />
                        </div>
                        <span className="w-8 text-right text-sm font-bold text-foreground">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
