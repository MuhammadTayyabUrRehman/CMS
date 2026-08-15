"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

function BellIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

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

export default function NotificationsBell({
  complaintHrefPrefix = "/staff/history?complaintId=",
  complainant = false,
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      api
        .get(complainant ? "/notifications/mine" : "/notifications", { auth: true })
        .then((res) => {
          if (active) setNotifications(res.data || []);
        })
        .catch(() => {
          if (active) setNotifications([]);
        });
    };
    refresh();
    const interval = complainant ? setInterval(refresh, 10_000) : null;
    return () => {
      active = false;
      if (interval) clearInterval(interval);
    };
  }, [complainant]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(
        complainant ? `/notifications/mine/${id}/read` : `/notifications/${id}/read`,
        {},
        { auth: true }
      );
      setNotifications((prev) =>
        complainant
          ? prev.filter((n) => n.id !== id)
          : prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Keep unread state if the API call fails.
    }
  };

  return (
    <div className="relative">
      <button
        id="notifications-btn"
        onClick={() => setNotificationsOpen(!notificationsOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
        aria-label="Notifications"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-alert px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-gray-100 bg-white text-foreground shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
              <span className="text-sm font-bold">Notifications</span>
              <span className="text-xs text-muted">{notifications.length} total</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex flex-col gap-1 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-primary-50 ${
                      n.isRead ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`${complaintHrefPrefix}${n.complaintId}`}
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-sm font-semibold text-foreground hover:text-primary"
                      >
                        {n.message}
                      </Link>
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(n.id)}
                          className="shrink-0 text-xs font-bold text-primary hover:underline"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-muted">{formatDateTime(n.sentAt)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
