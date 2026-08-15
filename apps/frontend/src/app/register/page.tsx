"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getDepartments } from "@/lib/lookups";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        fullName,
        employeeId,
        department,
        email,
        password,
        confirmPassword,
      });
      router.push("/login");
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ───────── Left Panel ───────── */}
      <div className="relative flex w-full flex-col lg:w-[58%]">
        {/* Main content area */}
        <div className="flex flex-1 flex-col px-8 pt-8 sm:px-12 md:px-16 lg:px-14 xl:px-20">
          {/* Header - Logo + Department info */}
          <div className="flex items-center gap-4">
            <Image
              src="/pakistan-emblem.png"
              alt="Government of Pakistan Emblem"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
            <div>
              <h1 className="text-lg font-bold text-foreground sm:text-xl">
                Government of Pakistan
              </h1>
              <p className="text-base font-semibold text-primary sm:text-lg">
                Finance Division
              </p>
              <p className="text-sm font-medium text-foreground">
                IT Department
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="mx-auto mt-8 flex w-full max-w-md flex-1 flex-col sm:mt-10 lg:mt-12">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Complaint Portal
              </h2>
              <p className="mt-2 text-base font-semibold text-foreground sm:text-lg">
                Create your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Field */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* User icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                      />
                    </svg>
                  </div>
                  <input
                    id="full-name"
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Employee ID Field */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* ID card icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
                      />
                    </svg>
                  </div>
                  <input
                    id="employee-id"
                    type="text"
                    placeholder="Employee ID"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-12 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Department Dropdown */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* Building/office icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                      />
                    </svg>
                  </div>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="h-12 w-full appearance-none bg-white px-4 text-sm text-foreground focus:outline-none"
                    required
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {getDepartments().map((dept) => (
                      <option key={dept.value} value={dept.value}>
                        {dept.label}
                      </option>
                    ))}
                  </select>
                  {/* Chevron for dropdown */}
                  <div className="pointer-events-none flex h-12 w-10 shrink-0 items-center justify-center">
                    <svg
                      className="h-4 w-4 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* Mail icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* Lock icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="group relative">
                <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                    {/* Shield/check lock icon */}
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                      />
                    </svg>
                  </div>
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="flex h-12 w-12 shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground focus:outline-none"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}

              {/* Register Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="register-btn"
                  disabled={isSubmitting}
                  className="h-14 w-full rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account…" : "Register"}
                </button>
              </div>

              {/* Login Link */}
              <p className="pb-4 text-center text-sm text-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary transition-colors hover:text-primary-dark"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-gray-50 px-8 py-4 text-center text-xs text-muted sm:px-12">
          @2026 Finance Division, Government of Pakistan,
          <br />
          All rights reserved
        </footer>
      </div>

      {/* ───────── Right Panel ───────── */}
      <div className="relative hidden overflow-hidden lg:block lg:w-[42%]">
        {/* Green gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary/30 via-transparent to-primary/60" />

        {/* Background image */}
        <Image
          src="/gov-building.png"
          alt="Government building with Pakistani flag"
          fill
          sizes="42vw"
          className="object-cover"
          priority
        />

        {/* Bottom green gradient bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 h-32 bg-gradient-to-t from-primary-dark via-primary/90 to-transparent" />
      </div>
    </div>
  );
}
