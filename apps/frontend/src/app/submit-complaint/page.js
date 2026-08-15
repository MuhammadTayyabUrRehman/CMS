"use client";

import SubmitComplaintForm from "@/components/SubmitComplaintForm";

export default function PublicSubmitComplaintPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Submit a Complaint
          </h1>
          <p className="mt-1 text-sm text-muted">
            No account needed — your complaint will be registered directly.
          </p>
        </div>
        <SubmitComplaintForm />
      </div>
    </div>
  );
}
