"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api, getToken } from "@/lib/api";
import { categoryLabel, getRanks, rankLabel } from "@/lib/lookups";

const GUEST_TRACKING_KEY = "complaint_portal_guest_tracking";

/* ==================== Countdown Timer Component ==================== */

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isExceeded = timeLeft === 0;

  return (
    <div
      className={`mt-6 w-full max-w-md rounded-xl border p-5 text-center transition-all duration-300 ${
        isExceeded
          ? "border-red-400 bg-red-50 text-red-700 shadow-sm"
          : "border-emerald-300 bg-emerald-50 text-emerald-900 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <svg
          className={`h-5 w-5 ${isExceeded ? "animate-pulse text-red-600" : "text-emerald-600"}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`font-mono text-2xl font-extrabold tracking-wider ${isExceeded ? "text-red-600" : "text-emerald-800"}`}>
          {formattedTime}
        </span>
      </div>

      <p className="mt-2 text-xs font-semibold leading-relaxed sm:text-sm">
        {isExceeded
          ? "Response time exceeded — our team has been alerted."
          : "IT Department has been notified. If not acknowledged within this time, you'll receive a follow-up call."}
      </p>
    </div>
  );
}

/* ==================== Step Config ==================== */

const STEPS = [
  { id: 1, label: "Category" },
  { id: 2, label: "Detail" },
  { id: 3, label: "Review" },
  { id: 4, label: "Submit" },
];

/* ==================== Category Icons ==================== */

function SoftwareIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path d="M16 18l-8 6 8 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 18l8 6-8 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 12l-8 24" strokeLinecap="round" />
    </svg>
  );
}

function NetworkIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="24" cy="24" r="14" />
      <circle cx="24" cy="16" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="18" cy="30" r="3" fill="currentColor" opacity="0.3" />
      <circle cx="30" cy="30" r="3" fill="currentColor" opacity="0.3" />
      <path d="M24 19v5M21 28l-1.5 0M27 28l1.5 0" strokeLinecap="round" />
      <path d="M22 23h4l3 5H19l3-5z" />
    </svg>
  );
}

function EOfficeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <path d="M14 14h20M14 22h20M14 30h14" strokeLinecap="round" />
      <rect x="8" y="6" width="32" height="36" rx="4" />
      <path d="M30 28l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OtherIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}>
      <rect x="12" y="12" width="24" height="24" rx="2" transform="rotate(45 24 24)" />
      <path d="M24 18v8M24 30v1" strokeLinecap="round" />
    </svg>
  );
}

/* ==================== Categories ==================== */

const categories = [
  {
    id: "SOFTWARE_HARDWARE",
    description: "Windows, drivers, printer, installs, desktops, laptops",
    icon: SoftwareIcon,
  },
  {
    id: "INTERNET",
    description: "LAN, router, connectivity issues",
    icon: NetworkIcon,
  },
  {
    id: "E_OFFICE",
    description: "E-Office not opening / can't connect",
    icon: EOfficeIcon,
  },
  {
    id: "OTHER",
    description: "Any other IT issue",
    icon: OtherIcon,
  },
];

/* ==================== Progress Bar ==================== */

function ProgressBar({ currentStep }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {STEPS.map((step, idx) => {
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isLast = idx === STEPS.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all duration-300
                  ${
                    isCompleted
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                      : isCurrent
                      ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                      : "border-gray-300 bg-white text-gray-400"
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`mt-2 text-xs font-semibold sm:text-sm ${
                  isCompleted || isCurrent ? "text-primary" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`mx-2 h-0.5 w-12 sm:mx-3 sm:w-20 md:w-24 transition-colors duration-300 ${
                  isCompleted ? "bg-primary" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ==================== Step 1: Category Selection ==================== */

function StepCategory({ selectedCategory, onSelectCategory }) {
  return (
    <div>
      <h2 className="mb-2 text-xl font-bold text-foreground sm:text-2xl">
        Select Complaint Category
      </h2>
      <p className="mb-6 text-sm text-muted">
        Select the category that best describes your issue.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`
                group relative flex cursor-pointer flex-col items-center justify-between rounded-xl border-2 p-6 text-center transition-all duration-200
                ${
                  isSelected
                    ? "border-primary bg-primary-50 shadow-md shadow-primary/15"
                    : "border-gray-200 bg-white hover:border-primary/40 hover:shadow-md"
                }
              `}
            >
              {/* Checkmark Badge for Selected Cards */}
              {isSelected && (
                <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-xs">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}

              <div className="flex flex-col items-center">
                <div
                  className={`mb-1 flex h-16 w-16 items-center justify-center rounded-xl transition-colors ${
                    isSelected ? "text-primary" : "text-gray-500 group-hover:text-primary"
                  }`}
                >
                  <Icon className="h-12 w-12" />
                </div>
                <h3
                  className={`text-sm font-bold sm:text-base ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}
                >
                  {categoryLabel(cat.id)}
                </h3>
                <p className="mt-1 text-xs text-muted">{cat.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==================== Step 2: Complaint Details ==================== */

function StepDetail({ formData, onChange }) {
  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
        Complaint Details
      </h2>

      <div className="max-w-2xl space-y-5">
        {/* Location & Rank Fields */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Room Number */}
          <div>
            <label htmlFor="room-number" className="mb-2 block text-base font-bold text-foreground">
              Room Number
            </label>
            <input
              id="room-number"
              type="text"
              placeholder="e.g. 204 or 204-A"
              value={formData.roomNumber}
              onChange={(e) => onChange("roomNumber", e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>

          {/* Block */}
          <div>
            <label className="mb-2 block text-base font-bold text-foreground">
              Block
            </label>
            <div className="inline-flex h-[46px] w-full rounded-lg border-2 border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => onChange("block", "Q")}
                className={`flex-1 rounded-md text-sm font-bold transition-all ${
                  formData.block === "Q"
                    ? "bg-primary text-white shadow-xs"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                Q
              </button>
              <button
                type="button"
                onClick={() => onChange("block", "S")}
                className={`flex-1 rounded-md text-sm font-bold transition-all ${
                  formData.block === "S"
                    ? "bg-primary text-white shadow-xs"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                S
              </button>
            </div>
          </div>
        </div>

        {/* Rank */}
        <div>
          <label htmlFor="complaint-rank" className="mb-2 block text-base font-bold text-foreground">
            Rank
          </label>
          <div className="relative w-full sm:w-72">
            <select
              id="complaint-rank"
              value={formData.rank}
              onChange={(e) => onChange("rank", e.target.value)}
              className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-10 text-sm font-semibold text-foreground transition-colors focus:border-primary focus:bg-white focus:outline-none"
            >
              <option value="">Select Rank</option>
              {getRanks().map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="complaint-desc" className="mb-2 block text-base font-bold text-foreground">
            Description
          </label>
          <textarea
            id="complaint-desc"
            rows={6}
            placeholder="Enter a full description (at least 10 characters)"
            value={formData.description}
            onChange={(e) => onChange("description", e.target.value)}
            className="w-full resize-none rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>

        {/* Contact Section */}
        <div className="pt-2">
          <label className="mb-2 block text-base font-bold text-foreground">
            Contact Info
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Toggle: PTCL vs Intercom */}
            <div className="inline-flex h-[46px] w-full shrink-0 rounded-lg border-2 border-gray-200 bg-gray-50 p-1 sm:w-48">
              <button
                type="button"
                onClick={() => onChange("contactType", "PTCL")}
                className={`flex-1 rounded-md text-sm font-bold transition-all ${
                  formData.contactType === "PTCL"
                    ? "bg-primary text-white shadow-xs"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                PTCL
              </button>
              <button
                type="button"
                onClick={() => onChange("contactType", "INTERCOMM")}
                className={`flex-1 rounded-md text-sm font-bold transition-all ${
                  formData.contactType === "INTERCOMM"
                    ? "bg-primary text-white shadow-xs"
                    : "text-gray-700 hover:text-primary"
                }`}
              >
                Intercom
              </button>
            </div>

            {/* Number Input */}
            <input
              id="contact-number"
              type="text"
              placeholder={formData.contactType === "PTCL" ? "e.g. 051-9200000" : "e.g. 1234"}
              value={formData.contactNumber}
              onChange={(e) => onChange("contactNumber", e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-foreground placeholder:text-muted transition-colors focus:border-primary focus:bg-white focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== Step 3: Review ==================== */

function StepReview({ formData, selectedCategory }) {
  const rows = [
    { label: "Category", value: selectedCategory ? categoryLabel(selectedCategory) : "—" },
    { label: "Room Number", value: formData.roomNumber ? `Room ${formData.roomNumber} (Block ${formData.block})` : "—" },
    { label: "Rank", value: formData.rank ? rankLabel(formData.rank) : "—" },
    { label: "Description", value: formData.description || "—" },
    { label: "Contact", value: formData.contactNumber ? `${formData.contactType}: ${formData.contactNumber}` : "—" },
  ];

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-foreground sm:text-2xl">
        Review your Complaints
      </h2>

      <div className="max-w-2xl overflow-hidden rounded-xl border-2 border-gray-200">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={`flex flex-col gap-1 px-6 py-5 sm:flex-row sm:items-start sm:gap-8 ${
              idx !== rows.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <span className="w-36 shrink-0 text-sm font-bold text-foreground sm:text-base">
              {row.label}
            </span>
            <span className="text-sm text-foreground/80 sm:text-base">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==================== Main Form ==================== */

export default function SubmitComplaintForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [formData, setFormData] = useState({
    roomNumber: "",
    block: "Q",
    rank: "",
    description: "",
    contactType: "INTERCOMM",
    contactNumber: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [complaintNumber, setComplaintNumber] = useState("");
  const [trackingToken, setTrackingToken] = useState("");
  const [guestTracking, setGuestTracking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (getToken()) return;
    try {
      const saved = JSON.parse(localStorage.getItem(GUEST_TRACKING_KEY) || "null");
      if (saved?.trackingToken) {
        // Restore after hydration; the promise callback models the external
        // localStorage subscription without a synchronous effect cascade.
        Promise.resolve().then(() => {
          setTrackingToken(saved.trackingToken);
          setComplaintNumber(saved.complaintNumber || "");
          setSubmitted(true);
          setCurrentStep(4);
        });
      }
    } catch {
      localStorage.removeItem(GUEST_TRACKING_KEY);
    }
  }, []);

  useEffect(() => {
    if (!submitted || !trackingToken || getToken()) return;

    let active = true;
    const refreshTracking = async () => {
      try {
        const res = await api.get(`/complaints/guest-tracking/${trackingToken}`);
        if (active) setGuestTracking(res.data);
      } catch {
        // Preserve the last successful update during a temporary network failure.
      }
    };

    refreshTracking();
    const interval = setInterval(refreshTracking, 10_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [submitted, trackingToken]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await api.post(
        "/complaints",
        {
          category: selectedCategory,
          roomNo: formData.roomNumber,
          block: formData.block,
          rank: Number(formData.rank),
          contactMethod: formData.contactType,
          contactNumber: formData.contactNumber,
          description: formData.description,
        },
        { auth: Boolean(getToken()) }
      );
      setComplaintNumber(res.data.complaintNumber);
      if (res.data.trackingToken) {
        setTrackingToken(res.data.trackingToken);
        localStorage.setItem(
          GUEST_TRACKING_KEY,
          JSON.stringify({
            complaintNumber: res.data.complaintNumber,
            trackingToken: res.data.trackingToken,
          })
        );
      }
      setCurrentStep(4);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Failed to submit complaint. Please try again.");
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return !!selectedCategory;
    }
    if (currentStep === 2) {
      return (
        !!formData.roomNumber &&
        !!formData.rank &&
        !!formData.contactNumber &&
        formData.description.trim().length >= 10
      );
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-10 text-center">
        {/* Green checkmark circle icon */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary text-primary">
          <svg
            className="h-12 w-12"
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

        {/* Heading */}
        <h1 className="mt-8 text-3xl font-extrabold text-primary sm:text-4xl">
          Complaint Submitted Successfully
        </h1>

        {/* Confirmation Message */}
        <p className="mt-4 max-w-md text-center text-base text-gray-700 sm:text-lg">
          Your Complaint has been submitted and is being reviewed by
          <br className="hidden sm:inline" />
          {" "}our team
        </p>

        {/* Highlighted Box showing Complaint ID */}
        <div className="mt-8 w-full max-w-md border border-gray-400 bg-gray-100 px-8 py-6 text-center">
          <p className="text-lg font-bold text-gray-900">Complaint ID</p>
          <p className="mt-2 text-3xl font-extrabold text-black sm:text-4xl">
            {complaintNumber || "—"}
          </p>
        </div>

        {/* Live Countdown Timer */}
        <CountdownTimer />

        {!getToken() && trackingToken && (
          <div className="mt-6 w-full max-w-md rounded-xl border border-primary/20 bg-white p-5 text-left shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.142-4.03 7.5-9 7.5a10.1 10.1 0 01-3.504-.617L3 20.25l1.572-3.668A6.82 6.82 0 013 12c0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-foreground">Stay on this page or bookmark it for updates.</p>
                <p className="mt-1 text-sm text-muted">This private tracking page checks for a response every 10 seconds.</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-primary-50 px-4 py-3 text-sm font-semibold text-foreground" aria-live="polite">
              {guestTracking?.technicianName
                ? `${guestTracking.technicianName} has been assigned to resolve your issue.`
                : "Your complaint has been received."}
            </div>
          </div>
        )}

          {/* Action Buttons */}
          <div className="mt-8 flex w-full flex-col items-center gap-4">
            {getToken() ? (
              <Link
                href="/dashboard/my-complaint"
                className="inline-flex h-14 w-full max-w-xs items-center justify-center rounded-lg bg-primary text-lg font-bold text-white shadow-md transition-all hover:bg-primary-dark active:scale-[0.98]"
              >
                Go to my Complaints
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span className="text-lg font-bold text-foreground">
                  Complaint ID: <span className="text-black font-extrabold">{complaintNumber || "—"}</span>
                </span>
              </div>
            )}

          <button
            type="button"
            onClick={() => {
              setCurrentStep(1);
              setSelectedCategory("");
              setFormData({
                roomNumber: "",
                block: "Q",
                rank: "",
                description: "",
                contactType: "INTERCOMM",
                contactNumber: "",
              });
              setSubmitted(false);
              setTrackingToken("");
              setGuestTracking(null);
              localStorage.removeItem(GUEST_TRACKING_KEY);
            }}
            className="text-lg font-bold text-primary transition-colors hover:text-primary-dark hover:underline"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} />

      {/* Step Content */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {currentStep === 1 && (
          <StepCategory
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        {currentStep === 2 && (
          <StepDetail formData={formData} onChange={handleFormChange} />
        )}

        {currentStep === 3 && (
          <StepReview formData={formData} selectedCategory={selectedCategory} />
        )}

        {/* Submit error */}
        {submitError && (
          <p className="mt-4 rounded bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
            {submitError}
          </p>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-end gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-lg border-2 border-gray-300 bg-gray-100 px-8 py-3 text-sm font-bold text-foreground transition-all hover:bg-gray-200 active:scale-[0.97]"
            >
              Back
            </button>
          )}

          {currentStep < 3 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed()}
              className="rounded-lg bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-lg bg-primary px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-dark hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Submitting…" : "Submit"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
