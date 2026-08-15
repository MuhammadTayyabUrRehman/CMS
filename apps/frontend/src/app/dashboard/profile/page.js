"use client";

import { useEffect, useState } from "react";
import { api, clearToken } from "@/lib/api";

const DEPARTMENT_LABELS = {
  BUDGET_WING: "Budget Wing",
  ACCOUNTS_WING: "Accounts Wing",
  EXPENDITURE_WING: "Expenditure Wing",
  ECONOMIC_ADVISER_WING: "Economic Adviser Wing",
  INTERNAL_FINANCE_WING: "Internal Finance Wing",
  DEBT_MANAGEMENT_WING: "Debt Management Wing",
  INVESTMENT_WING: "Investment Wing",
  IT_DEPARTMENT: "IT Department",
  ADMINISTRATION: "Administration",
  CORPORATE_FINANCE_WING: "Corporate Finance Wing",
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Editable profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Change password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/users/me", { auth: true })
      .then((res) => {
        if (cancelled) return;
        setProfile(res.data || null);
        setFullName(res.data?.fullName || "");
        setPhone(res.data?.phone || "");
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message || "Failed to load your profile.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      const res = await api.patch(
        "/users/me",
        { fullName: fullName.trim(), phone: phone.trim() },
        { auth: true }
      );
      setProfile(res.data);
      setFullName(res.data.fullName || "");
      setPhone(res.data.phone || "");
      setProfileSuccess("Profile updated successfully.");
    } catch (err) {
      setProfileError(err.message || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordSaving(true);
    try {
      await api.patch(
        "/auth/change-password",
        { currentPassword, newPassword, confirmNewPassword },
        { auth: true, redirectOn401: false }
      );
      // Show the confirmation briefly, then force a fresh sign-in with the
      // new password. The stored token is cleared so the old one is dropped.
      setPasswordSuccess("Password updated. Signing you out…");
      setPasswordSaving(false);
      clearToken();
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err) {
      setPasswordError(err.message || "Failed to change password.");
      setPasswordSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* ─── Left Card: My Profile ─── */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-8 text-2xl font-extrabold text-black sm:text-3xl">My Profile</h2>

        {loading && <p className="text-sm text-muted">Loading your profile…</p>}

        {loadError && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {loadError}
          </div>
        )}

        {!loading && !loadError && profile && (
          <>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-fullName" className="w-28 shrink-0 text-base font-bold text-black">
                  Name
                </label>
                <input
                  id="profile-fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-base text-foreground shadow-xs focus:border-primary focus:outline-none"
                  required
                />
              </div>

              {/* Email (read-only) */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-email" className="w-28 shrink-0 text-base font-bold text-black">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-400 bg-gray-50 px-4 py-2.5 text-base text-gray-400 shadow-xs"
                />
              </div>

              {/* Employee ID (read-only) */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-employeeId" className="w-28 shrink-0 text-base font-bold text-black">
                  Employee ID
                </label>
                <input
                  id="profile-employeeId"
                  type="text"
                  value={profile.employeeId}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-400 bg-gray-50 px-4 py-2.5 text-base text-gray-400 shadow-xs"
                />
              </div>

              {/* Department (read-only) */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-department" className="w-28 shrink-0 text-base font-bold text-black">
                  Department
                </label>
                <input
                  id="profile-department"
                  type="text"
                  value={DEPARTMENT_LABELS[profile.department] || profile.department}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-400 bg-gray-50 px-4 py-2.5 text-base text-gray-400 shadow-xs"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-phone" className="w-28 shrink-0 text-base font-bold text-black">
                  Phone
                </label>
                <input
                  id="profile-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0342-1234567"
                  className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-base text-foreground shadow-xs focus:border-primary focus:outline-none"
                />
              </div>

              {/* Role (read-only) */}
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                <label htmlFor="profile-role" className="w-28 shrink-0 text-base font-bold text-black">
                  Role
                </label>
                <input
                  id="profile-role"
                  type="text"
                  value={profile.role}
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-400 bg-gray-50 px-4 py-2.5 text-base text-gray-400 shadow-xs"
                />
              </div>

              {/* Inline messages */}
              {profileSuccess && (
                <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                  {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {profileError}
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-center pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-md bg-primary px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {profileSaving ? "Saving…" : "Update Profile"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      {/* ─── Right Card: Change Password ─── */}
      <div className="rounded-xl border border-gray-300 bg-white p-6 shadow-xs sm:p-8">
        <h2 className="mb-8 text-2xl font-extrabold text-black sm:text-3xl">Change Password</h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="current-pass" className="mb-2 block text-base font-bold text-black">
                Enter Current Password
              </label>
              <input
                id="current-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-base text-foreground shadow-xs focus:border-primary focus:outline-none"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-pass" className="mb-2 block text-base font-bold text-black">
                Enter New Password
              </label>
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-base text-foreground shadow-xs focus:border-primary focus:outline-none"
                required
              />
              <p className="mt-1 text-xs text-muted">
                At least 8 characters, including one uppercase letter and one number.
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-pass" className="mb-2 block text-base font-bold text-black">
                Confirm New Password
              </label>
              <input
                id="confirm-pass"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full rounded-md border border-gray-400 bg-white px-4 py-2.5 text-base text-foreground shadow-xs focus:border-primary focus:outline-none"
                required
              />
            </div>

            {/* Inline messages */}
            {passwordSuccess && (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">
                {passwordSuccess}
              </div>
            )}
            {passwordError && (
              <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-700">
                {passwordError}
              </div>
            )}

            {/* Change Password Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-md bg-primary px-8 py-3 text-base font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {passwordSaving ? "Updating…" : "Change Password"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
}
