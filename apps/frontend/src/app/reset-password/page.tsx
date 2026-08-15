"use client";

import { useState, useMemo, Suspense, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";

/* ─── Password-strength helpers ──────────────────────────────── */
function getPasswordStrength(pw: string): {
  score: number;
  label: string;
  color: string;
  barColor: string;
} {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (score <= 1) return { score, label: "Weak", color: "text-red-500", barColor: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "text-orange-500", barColor: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "text-yellow-500", barColor: "bg-yellow-500" };
  return { score, label: "Strong", color: "text-green-600", barColor: "bg-green-600" };
}

/* ─── Reusable eye toggle icons ──────────────────────────────── */
function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );
}

/* ─── Inner content (reads search params) ────────────────────── */
function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [matchError, setMatchError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const isTokenValid = Boolean(token && token.length > 0);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (matchError) setMatchError(false);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (matchError) setMatchError(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMatchError(true);
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", { token, newPassword: password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. Please try again.");
      setIsSubmitting(false);
    }
  };

  /* ── Determine which body content to render ── */
  let bodyContent: React.ReactNode;

  if (!isTokenValid) {
    /* ── Invalid / missing token ── */
    bodyContent = (
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        {/* Red X circle */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-red-500 text-red-500">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h3 className="mt-6 text-xl font-bold text-red-600 sm:text-2xl">Invalid Reset Link</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
          This reset link is invalid or has expired. Please request a new one.
        </p>

        <div className="mt-8 flex w-full flex-col items-center gap-3">
          <Link
            href="/forgot-password"
            id="request-new-link-btn"
            className="flex h-14 w-full items-center justify-center rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98]"
          >
            Request New Link
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  } else if (isSuccess) {
    /* ── Success state ── */
    bodyContent = (
      <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
        {/* Green checkmark circle */}
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary text-primary">
          <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h3 className="mt-6 text-xl font-bold text-primary sm:text-2xl">Password Reset Successfully</h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
          Your password has been updated. You can now sign in with your new password.
        </p>

        <div className="mt-8 w-full">
          <Link
            href="/login"
            id="login-now-btn"
            className="flex h-14 w-full items-center justify-center rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98]"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  } else {
    /* ── Reset form ── */
    bodyContent = (
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-center text-sm leading-relaxed text-muted">
          Create a strong new password for your account.
        </p>

        {/* Error Message */}
        {error && (
          <p className="rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        {/* ── New Password Field ── */}
        <div className="group relative">
          <div className="flex items-center overflow-hidden rounded border-2 border-foreground/80 transition-colors focus-within:border-primary">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center border-r-2 border-foreground/80 bg-white transition-colors group-focus-within:border-primary">
              {/* Lock icon */}
              <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={handlePasswordChange}
              className="h-14 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex h-14 w-14 shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Password strength meter */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                      i <= strength.score ? strength.barColor : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${strength.color}`}>
                Password strength: {strength.label}
              </p>
            </div>
          )}
        </div>

        {/* ── Confirm Password Field ── */}
        <div className="group relative">
          <div
            className={`flex items-center overflow-hidden rounded border-2 transition-colors focus-within:border-primary ${
              matchError ? "border-red-500" : "border-foreground/80"
            }`}
          >
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center border-r-2 bg-white transition-colors group-focus-within:border-primary ${
                matchError ? "border-red-500" : "border-foreground/80"
              }`}
            >
              {/* Lock icon */}
              <svg className="h-6 w-6 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
            </div>
            <input
              id="confirm-password"
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className="h-14 w-full bg-white px-4 text-sm text-foreground placeholder:text-muted focus:outline-none"
              required
              minLength={8}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="flex h-14 w-14 shrink-0 items-center justify-center text-muted transition-colors hover:text-foreground focus:outline-none"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          {/* Match error */}
          {matchError && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              Passwords do not match
            </p>
          )}

          {/* Live match indicator (when both fields have content & no error) */}
          {!matchError && confirmPassword.length > 0 && password.length > 0 && (
            <p
              className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${
                password === confirmPassword ? "text-green-600" : "text-orange-500"
              }`}
            >
              {password === confirmPassword ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Passwords match
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  Passwords do not match yet
                </>
              )}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            id="reset-password-btn"
            disabled={isSubmitting}
            className="h-14 w-full rounded bg-primary text-lg font-bold tracking-wide text-white shadow-lg transition-all duration-200 hover:bg-primary-dark hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Resetting…
              </span>
            ) : (
              "Reset Password"
            )}
          </button>
        </div>

        {/* Back to Login */}
        <p className="text-center text-sm text-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-semibold text-primary transition-colors hover:text-primary-dark">
            Login here
          </Link>
        </p>
      </form>
    );
  }

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
                {!isTokenValid
                  ? "Reset Your Password"
                  : isSuccess
                    ? "Password Updated"
                    : "Create New Password"}
              </p>
            </div>

            {bodyContent}
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

/* ─── Default export with Suspense boundary ──────────────────── */
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
