"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
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
          <div className="mx-auto mt-10 flex w-full max-w-md flex-1 flex-col sm:mt-14 lg:mt-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-primary sm:text-4xl">
                Complaint Portal
              </h2>
              <p className="mt-2 text-base font-semibold text-foreground sm:text-lg">
                Reset Your Password
              </p>
            </div>

            {/* Success State */}
            {isSubmitted ? (
              <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
                {/* Green checkmark circle */}
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary text-primary">
                  <svg
                    className="h-10 w-10"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                </div>

                <h3 className="mt-6 text-xl font-bold text-primary sm:text-2xl">
                  Reset Link Sent!
                </h3>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
                  A password reset link has been sent to{" "}
                  <span className="font-semibold text-foreground">{email}</span>.
                  Please check your inbox.
                </p>

                {/* Actions */}
                <div className="mt-8 flex w-full flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail("");
                    }}
                    className="h-14 w-full rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98]"
                  >
                    Send Again
                  </button>
                  <Link
                    href="/login"
                    className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              /* Reset Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Instruction text */}
                <p className="text-center text-sm leading-relaxed text-muted">
                  Enter your registered email address and we&apos;ll send you a
                  link to reset your password.
                </p>

                {/* Email Field */}
                <div className="group relative">
                  <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
                      {/* Mail icon */}
                      <svg
                        className="h-6 w-6 text-muted"
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
                      id="reset-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-14 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                    {error}
                  </p>
                )}

                {/* Send Reset Link Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    id="reset-btn"
                    disabled={isSubmitting}
                    className="h-14 w-full rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending…" : "Send Reset Link"}
                  </button>
                </div>

                {/* Back to Login */}
                <p className="text-center text-sm text-foreground">
                  Remember your password?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    Login here
                  </Link>
                </p>
              </form>
            )}
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
