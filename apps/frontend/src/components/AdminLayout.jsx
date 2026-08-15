"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NotificationsBell from "@/components/NotificationsBell";
import { clearToken } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";

/* ────────────────── Icon Components ────────────────── */

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function UsersIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function StaffIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  );
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function LogoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  );
}

/* ────────────────── Navigation Config ────────────────── */

const navItems = [
  { label: "Dashboard", href: "/admin", icon: DashboardIcon },
  { label: "User Management", href: "/admin/users", icon: UsersIcon },
  { label: "IT Staff Management", href: "/admin/staff", icon: StaffIcon },
  { label: "Administrators", href: "/admin/admins", icon: ShieldIcon },
  { label: "Logout", href: "/login", icon: LogoutIcon },
];

/* ────────────────── AdminLayout Component ────────────────── */

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useAuthGuard(["ADMIN"]);

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
              <p className="text-xs font-bold text-amber-300 sm:text-sm">Administrator Console</p>
            </div>
          </div>

          {/* Right: notifications bell + user dropdown */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <NotificationsBell complaintHrefPrefix="/admin/history?complaintId=" />

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
                  <span className="block text-xs font-bold text-amber-200 uppercase tracking-wide">Administrator</span>
                  <span className="block text-sm font-medium text-white">System Administration</span>
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
                    <Link href="/admin" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/admin/users" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                      User Management
                    </Link>
                    <Link href="/admin/staff" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                      IT Staff Management
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
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href) && item.href !== "/login";
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
