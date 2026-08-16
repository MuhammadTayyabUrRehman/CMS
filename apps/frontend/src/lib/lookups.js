"use client";

import { api } from "@/lib/api";

// Single source of truth for complaint lookups.
//
// Value sets are hydrated from the public backend lookup endpoints:
//   GET /api/lookup/ranks, /blocks, /categories, /contact-methods, /statuses
// Display labels below preserve current UI behavior; fetched values that
// already exist locally keep the local (friendly) label, and values the
// backend adds later are adopted automatically.

const RANKS = [
  { value: 22, label: "Finance Secretary / HOD" },
  { value: 21, label: "Additional Secretary" },
  { value: 20, label: "Joint Senior Secretary" },
  { value: 19, label: "Joint Secretary" },
  { value: 18, label: "Deputy Secretary" },
];

const BLOCKS = [
  { value: "Q", label: "Q Block" },
  { value: "S", label: "S Block" },
];

const CATEGORY_LABELS = {
  SOFTWARE_HARDWARE: "Software & Hardware",
  INTERNET: "Internet / Network",
  E_OFFICE: "E-Office",
  OTHER: "Other",
};

const CONTACT_METHOD_LABELS = {
  PTCL: "PTCL",
  INTERCOMM: "Intercom",
};

const STATUS_LABELS = {
  NEW: "New",
  ACKNOWLEDGED: "Acknowledged",
};

// backend gap: no public /api/lookup/departments endpoint — using local constant.
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

// Status -> badge styles. Single source consumed by StatusBadge; colors come
// from the alert token and existing Tailwind/primary palette only (no hexes).
const STATUS_STYLES = {
  NEW: "border-gray-300 bg-gray-100 text-gray-700",
  ACKNOWLEDGED: "border-amber-300 bg-amber-50 text-amber-800",
};

let ranksCache = RANKS;
let blocksCache = BLOCKS;
let categoriesCache = { ...CATEGORY_LABELS };
let contactMethodsCache = { ...CONTACT_METHOD_LABELS };
let statusesCache = { ...STATUS_LABELS };
let lookupLoadPromise = null;

function mergeLabels(cache, fetched) {
  if (!Array.isArray(fetched)) return;
  for (const item of fetched) {
    if (item && item.value !== undefined && !(item.value in cache)) {
      cache[item.value] = item.label;
    }
  }
}

export function loadLookups() {
  if (!lookupLoadPromise) {
    lookupLoadPromise = Promise.all([
      api.get("/lookup/ranks"),
      api.get("/lookup/blocks"),
      api.get("/lookup/categories"),
      api.get("/lookup/contact-methods"),
      api.get("/lookup/statuses"),
    ])
      .then(([ranks, blocks, categories, contactMethods, statuses]) => {
        if (Array.isArray(ranks) && ranks.length) ranksCache = ranks;
        if (Array.isArray(blocks) && blocks.length) blocksCache = blocks;
        mergeLabels(categoriesCache, categories);
        mergeLabels(contactMethodsCache, contactMethods);
        mergeLabels(statusesCache, statuses);
      })
      .catch(() => {
        // Keep local mirrors on network failure; UI remains fully functional.
      });
  }
  return lookupLoadPromise;
}

export function getRanks() {
  return ranksCache;
}

export function getBlocks() {
  return blocksCache;
}

export function getDepartments() {
  return Object.entries(DEPARTMENT_LABELS).map(([value, label]) => ({ value, label }));
}

export function rankLabel(value) {
  const found = ranksCache.find((r) => String(r.value) === String(value));
  return found ? found.label : String(value);
}

export function blockLabel(value) {
  const found = blocksCache.find((b) => String(b.value) === String(value));
  return found ? found.label : String(value);
}

export function categoryLabel(value) {
  return categoriesCache[value] || value;
}

export function contactMethodLabel(value) {
  return contactMethodsCache[value] || value;
}

export function statusLabel(value) {
  return statusesCache[value] || value;
}

export function departmentLabel(value) {
  return DEPARTMENT_LABELS[value] || value;
}

// A complaint is overdue when its acknowledgement window (timerExpiresAt) has
// passed. Field is present on /complaints/mine* and /employee/queue responses.
export function isComplaintOverdue(complaint) {
  if (!complaint || !complaint.timerExpiresAt) return false;
  if (complaint.status === "ACKNOWLEDGED") return false;
  return new Date(complaint.timerExpiresAt) < new Date();
}

export { STATUS_STYLES };
