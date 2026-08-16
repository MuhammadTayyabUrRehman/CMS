"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";
import VvipAlerts from "@/components/VvipAlerts";
import { clearToken } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";

/* ────────────────── Icon Components ────────────────── */

function QueueIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function AssignIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

/* ────────────────── Navigation Config ────────────────── */

const navItems = [
  { label: "Queue", href: "/staff/queue", icon: QueueIcon },
  { label: "Assign", href: "/staff/assign", icon: AssignIcon },
  { label: "History", href: "/staff/history", icon: HistoryIcon },
  { label: "Logout", href: "/login", icon: LogoutIcon },
];

/* ────────────────── StaffLayout Component ────────────────── */

export default function StaffLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useAuthGuard(["IT_STAFF", "ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ─── Top Header ─── */}
      <header className="relative z-30 rounded-b-2xl bg-primary text-white shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: mobile toggle + logo + text */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Toggle sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Logo */}
            <Image
              src="/pakistan-emblem.png"
              alt="Government of Pakistan Emblem"
              width={64}
              height={64}
              className="h-14 w-14 rounded-full bg-white/10 object-contain p-0.5 sm:h-16 sm:w-16"
            />

            {/* Title text */}
            <div className="leading-tight">
              <p className="text-sm font-bold sm:text-base">Government of Pakistan</p>
              <p className="text-xs font-medium text-white/90 sm:text-sm">
                Ministry of Finance - IT Department
              </p>
              <p className="text-xs font-bold text-amber-300 sm:text-sm">Staff Portal & Dispatch Queue</p>
            </div>
          </div>

          {/* Right: notifications bell + user dropdown */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationsBell />
            <VvipAlerts />

            {/* User dropdown */}
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/10"
            >
              {/* User avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-300/80 bg-amber-400/20 text-amber-200">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div className="hidden text-left sm:block">
                <span className="block text-xs font-bold text-amber-200 uppercase tracking-wide">IT Staff Officer</span>
                <span className="block text-sm font-medium text-white">IT Support Desk</span>
              </div>
              <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-1 text-foreground shadow-xl">
                  <Link href="/staff/queue" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                    Queue
                  </Link>
                  <Link href="/staff/assign" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                    Assign
                  </Link>
                  <Link href="/staff/history" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                    History
                  </Link>
                  <hr className="my-1 border-gray-100" />
                  <Link href="/login" onClick={clearToken} className="block px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    Logout
                  </Link>
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* ─── Body: Sidebar + Content ─── */}
      <div className="flex flex-1">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-0 z-20 mt-[76px] h-[calc(100vh-76px)] w-64 transform overflow-y-auto bg-white pt-6 shadow-lg transition-transform duration-300 ease-in-out
            sm:mt-[84px] sm:h-[calc(100vh-84px)]
            lg:static lg:z-0 lg:mt-0 lg:h-auto lg:w-60 lg:shrink-0 lg:translate-x-0 lg:shadow-none lg:border-r lg:border-gray-100
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/login" && pathname.startsWith(item.href));
              const isLogout = item.label === "Logout";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={item.label === "Logout" ? clearToken : () => setSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/25"
                        : isLogout
                        ? "text-gray-600 hover:bg-red-50 hover:text-red-600"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary"
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive
                        ? "text-white"
                        : isLogout
                        ? "group-hover:text-red-500"
                        : "text-gray-400 group-hover:text-primary"
                    }`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
