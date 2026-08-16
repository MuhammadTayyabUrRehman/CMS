"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

export default function VvipAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const refresh = () => api.get("/notifications/vvip-alerts", { auth: true })
      .then((res) => active && setAlerts(res.data || []))
      .catch(() => active && setAlerts([]));
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  const markRead = async (id) => {
    await api.patch(`/notifications/vvip-alerts/${id}/read`, {}, { auth: true });
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  if (!alerts.length) return null;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} aria-label="VVIP alerts" className="relative flex h-10 items-center gap-1 rounded-lg px-2 text-amber-300 hover:bg-white/10">
        <span className="text-xl">⚠</span>
        <span className="text-sm font-bold">{alerts.length}</span>
      </button>
      {open && <>
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-amber-200 bg-white text-foreground shadow-xl">
          <div className="border-b border-amber-100 px-4 py-3 text-sm font-bold">Unread VVIP Alerts</div>
          <div className="max-h-80 overflow-y-auto">
            {alerts.map((alert) => <div key={alert.id} className="flex items-start gap-2 border-b border-gray-100 px-4 py-3">
              <Link href={`/staff/history?complaintId=${alert.complaintId}`} className="flex-1 text-sm font-semibold hover:text-primary">{alert.message}</Link>
              <button type="button" aria-label="Mark VVIP alert as read" title="Mark as read" onClick={() => markRead(alert.id)} className="font-bold text-primary">✓</button>
            </div>)}
          </div>
        </div>
      </>}
    </div>
  );
}
