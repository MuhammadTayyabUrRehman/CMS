"use client";

import { useState } from "react";

/* ────────────────── Static Knowledge Base Articles ────────────────── */

const popularArticles = [
  {
    id: "password-reset",
    title: "How to reset your Password",
    steps: [
      "Open the Complaint Portal login page.",
      "Click on the 'Forgot Password?' link located below the password input field.",
      "Enter your registered official email address or username.",
      "Check your inbox for a password reset email and follow the provided link to set your new password.",
    ],
  },
  {
    id: "configure-outlook",
    title: "How to configure Outlook",
    steps: [
      "Open Microsoft Outlook on your desktop or laptop.",
      "Select 'File' > 'Add Account' from the top menu.",
      "Enter your official email address (e.g., user@finance.gov.pk) and click Connect.",
      "Enter your domain password when prompted and complete the wizard.",
    ],
  },
  {
    id: "connect-wifi",
    title: "How to connect to Wifi",
    steps: [
      "Click the Network/Wi-Fi icon on the bottom right of your Windows taskbar.",
      "Select 'GovPK-Finance-Secure' from the list of available wireless networks.",
      "Check 'Connect Automatically' and click Connect.",
      "Enter your domain credentials (Username and Password) to authenticate.",
    ],
  },
  {
    id: "vpn-access",
    title: "How to request VPN Access for Remote Work",
    steps: [
      "Submit a complaint under the 'Network/Internet' category.",
      "Attach an approved Remote Access Request form signed by your department head.",
      "Once approved by IT, you will receive VPN credentials and client download instructions.",
    ],
  },
  {
    id: "printer-installation",
    title: "How to install network printers",
    steps: [
      "Open Run dialog (Press Windows Key + R).",
      "Type \\\\printserver-it and press Enter.",
      "Double click on your department printer to automatically install the required drivers.",
    ],
  },
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredArticles = popularArticles.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const visibleArticles = showAll ? filteredArticles : filteredArticles.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* ─── Top Header: Title + Search Bar ─── */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Knowledge Base
        </h1>

        {/* Search Bar */}
        <div className="relative flex w-full items-center rounded-xl border border-emerald-400 bg-primary-100 px-4 py-2.5 shadow-xs sm:w-80">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-foreground placeholder:text-foreground/70 focus:outline-none"
          />
          <svg className="h-6 w-6 shrink-0 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <hr className="border-gray-200" />

      {/* ─── Popular Articles Section ─── */}
      <div className="pt-2">
        <h2 className="mb-6 text-2xl font-bold text-black sm:text-3xl">
          Popular Articles
        </h2>

        {/* Articles List */}
        <div className="space-y-6">
          {visibleArticles.length > 0 ? (
            visibleArticles.map((article) => {
              const isExpanded = expandedId === article.id;

              return (
                <div key={article.id} className="group">
                  <button
                    type="button"
                    onClick={() => toggleExpand(article.id)}
                    className="flex items-center gap-3 text-left focus:outline-none"
                  >
                    {/* Downward triangle arrow */}
                    <span
                      className={`text-black text-sm sm:text-base transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    >
                      ▼
                    </span>

                    {/* Cyan / Blue Linked Title */}
                    <span className="text-xl sm:text-2xl font-semibold text-[#38B6FF] transition-colors hover:text-[#28A6EF] hover:underline">
                      {article.title}
                    </span>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="ml-7 mt-3 max-w-2xl rounded-xl border border-blue-100 bg-blue-50/60 p-5 shadow-xs transition-all">
                      <ol className="list-decimal space-y-2.5 pl-5 text-sm sm:text-base text-gray-800">
                        {article.steps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-muted">No articles found matching your search.</p>
          )}
        </div>

        {/* ─── View All Articles Button ─── */}
        <div className="mt-12">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="rounded-md bg-[#42C0EB] px-8 py-3.5 text-lg font-bold text-white shadow-md transition-all hover:bg-[#32B0DB] active:scale-[0.98]"
          >
            {showAll ? "Show Less" : "View All Articles"}
          </button>
        </div>
      </div>
    </div>
  );
}
