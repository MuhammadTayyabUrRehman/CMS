"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clearToken, getUser } from "@/lib/api";
import { useAuthGuard } from "@/lib/auth";
import NotificationsBell from "@/components/NotificationsBell";

/* ────────────────── Icon Components ────────────────── */

function DashboardIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  );
}

function MyComplaintIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function SubmitComplaintIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0118 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3l1.5 1.5 3-3.75" />
    </svg>
  );
}

function KnowledgeBaseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  );
}

function ProfileIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ChangePasswordIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
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
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "My Complaint", href: "/dashboard/my-complaint", icon: MyComplaintIcon },
  { label: "Submit Complaint", href: "/dashboard/submit-complaint", icon: SubmitComplaintIcon },
  { label: "Knowledge Base", href: "/dashboard/knowledge-base", icon: KnowledgeBaseIcon },
  { label: "Profile", href: "/dashboard/profile", icon: ProfileIcon },
  { label: "Change Password", href: "/dashboard/change-password", icon: ChangePasswordIcon },
  { label: "Logout", href: "/login", icon: LogoutIcon },
];

/* ────────────────── DashboardLayout ────────────────── */

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The dashboard/profile section is complainant-only. ADMIN and IT_STAFF who
  // navigate here (typing the URL, stale link) are silently bounced to their
  // own console by useAuthGuard via the shared redirectByRole() — the same
  // function the login flow uses — instead of seeing a 403 page.
  useAuthGuard(["USER"]);
  const user = getUser();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ─── Top Header ─── */}
      <header className="relative z-30 bg-primary text-white shadow-lg rounded-b-2xl">
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
              <p className="text-xs text-white/80 sm:text-sm">Complaint Portal</p>
            </div>
          </div>

          {/* Right: complainant notifications + user dropdown */}
          <div className="flex items-center gap-1">
            <NotificationsBell
              complainant
              complaintHrefPrefix="/dashboard/my-complaint/"
            />
          <div className="relative">
            <button
              id="user-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-white/10"
            >
              {/* User avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/60">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <span className="hidden text-sm font-medium sm:inline">
                {user?.fullName ? `Welcome, ${user.fullName}` : "Welcome"}
              </span>
              <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-100 bg-white py-1 text-foreground shadow-xl">
                  <Link href="/dashboard/profile" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                    Profile
                  </Link>
                  <Link href="/dashboard/change-password" className="block px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors">
                    Change Password
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
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
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
