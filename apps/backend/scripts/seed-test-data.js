// =============================================
// Test Data Generator — registers 9 complainant accounts and submits
// one complaint per user with varied rank/category/department/contactMethod
// so the staff queue shows a realistic priority spread.
//
// Usage: node scripts/seed-test-data.js
// Env:   BASE_URL (default http://localhost:3001/api)
//
// Only adds NEW test users + complaints. Does not touch seeded admin/staff.
// =============================================

const BASE_URL = process.env.BASE_URL || "http://localhost:3001/api";

// --- Real enum values from prisma/schema.prisma ---
const DEPARTMENTS = [
  "BUDGET_WING",
  "ACCOUNTS_WING",
  "EXPENDITURE_WING",
  "ECONOMIC_ADVISER_WING",
  "INTERNAL_FINANCE_WING",
  "DEBT_MANAGEMENT_WING",
  "INVESTMENT_WING",
  "IT_DEPARTMENT",
  "ADMINISTRATION",
  "CORPORATE_FINANCE_WING",
];

const CATEGORIES = ["SOFTWARE_HARDWARE", "INTERNET", "E_OFFICE", "OTHER"];
const CONTACT_METHODS = ["PTCL", "INTERCOMM"];
const BLOCKS = ["Q", "S"];

// --- 9 test users, rank spread across the valid business ranks (18–22) ---
// Ranks from src/lookup/constants.ts:
//   22 = Finance Secretary / HOD
//   21 = Additional Secretary
//   20 = Joint Senior Secretary
//   19 = Joint Secretary
//   18 = Deputy Secretary
// priorityLevel is set to rank on creation, so queue orders rank DESC, submittedAt ASC.
const TEST_USERS = [
  { email: "test.user1@finance.gov.pk", rank: 22, category: "SOFTWARE_HARDWARE", contactMethod: "PTCL", department: "IT_DEPARTMENT", roomNo: "101", block: "Q", contactNumber: "051-9201234", description: "Workstation will not boot after power outage this morning." },
  { email: "test.user2@finance.gov.pk", rank: 21, category: "INTERNET", contactMethod: "INTERCOMM", department: "BUDGET_WING", roomNo: "204", block: "S", contactNumber: "051-9205678", description: "Network connectivity keeps dropping every few minutes in this office." },
  { email: "test.user3@finance.gov.pk", rank: 20, category: "E_OFFICE", contactMethod: "PTCL", department: "ACCOUNTS_WING", roomNo: "315", block: "Q", contactNumber: "051-9209012", description: "E-office portal is showing an error when trying to open files." },
  { email: "test.user4@finance.gov.pk", rank: 19, category: "SOFTWARE_HARDWARE", contactMethod: "INTERCOMM", department: "EXPENDITURE_WING", roomNo: "408", block: "S", contactNumber: "051-9203456", description: "Printer is jammed and showing a paper feed error repeatedly." },
  { email: "test.user5@finance.gov.pk", rank: 18, category: "OTHER", contactMethod: "PTCL", department: "ECONOMIC_ADVISER_WING", roomNo: "512", block: "Q", contactNumber: "051-9207890", description: "Scanner is not detecting documents placed on the glass." },
  { email: "test.user6@finance.gov.pk", rank: 22, category: "INTERNET", contactMethod: "INTERCOMM", department: "INTERNAL_FINANCE_WING", roomNo: "603", block: "S", contactNumber: "051-9202345", description: "Wi-Fi signal is very weak in the corner of the room." },
  { email: "test.user7@finance.gov.pk", rank: 20, category: "E_OFFICE", contactMethod: "PTCL", department: "DEBT_MANAGEMENT_WING", roomNo: "707", block: "Q", contactNumber: "051-9206789", description: "Cannot attach PDF files to the e-office workflow." },
  { email: "test.user8@finance.gov.pk", rank: 19, category: "SOFTWARE_HARDWARE", contactMethod: "INTERCOMM", department: "INVESTMENT_WING", roomNo: "812", block: "S", contactNumber: "051-9201122", description: "Mouse and keyboard are not responding on the desktop." },
  { email: "test.user9@finance.gov.pk", rank: 18, category: "OTHER", contactMethod: "PTCL", department: "ADMINISTRATION", roomNo: "905", block: "Q", contactNumber: "051-9203344", description: "UPS battery needs replacement, keeps beeping constantly." },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function registerUser(user) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: `Test User ${user.email.split("@")[0].split(".")[1]}`,
      employeeId: `TEST-${user.email.split("@")[0].split(".")[1].padStart(3, "0")}`,
      department: user.department,
      email: user.email,
      password: "Test@12345",
      confirmPassword: "Test@12345",
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    // If the account already exists (400), that's fine — we'll just log in.
    if (res.status === 400 && body.message?.includes("already exists")) {
      return { ok: true, existed: true };
    }
    throw new Error(`Register ${user.email} failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return { ok: true, existed: false };
}

async function loginUser(email) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "Test@12345" }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Login ${email} failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body.data.token;
}

async function submitComplaint(user, token) {
  const res = await fetch(`${BASE_URL}/complaints`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      category: user.category,
      roomNo: user.roomNo,
      block: user.block,
      rank: user.rank,
      contactMethod: user.contactMethod,
      contactNumber: user.contactNumber,
      description: user.description,
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(`Submit complaint for ${user.email} failed: ${res.status} ${JSON.stringify(body)}`);
  }
  return body.data;
}

async function main() {
  console.log("=== Seeding test data ===");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Users to create: ${TEST_USERS.length}`);
  console.log("");

  const results = [];

  for (let i = 0; i < TEST_USERS.length; i++) {
    const user = TEST_USERS[i];

    // 1. Register (or detect existing)
    const reg = await registerUser(user);
    const status = reg.existed ? "existing" : "created";
    console.log(`[${i + 1}/${TEST_USERS.length}] ${user.email} — account ${status}`);

    // 2. Login
    const token = await loginUser(user.email);

    // 3. Submit complaint
    const complaint = await submitComplaint(user, token);
    results.push({
      email: user.email,
      complaintNumber: complaint.complaintNumber,
      rank: user.rank,
      priorityLevel: complaint.priorityLevel,
      status: complaint.status,
    });
    console.log(
      `    → ${complaint.complaintNumber} | rank=${user.rank} | priority=${complaint.priorityLevel} | status=${complaint.status}`
    );

    // Space submissions ~400ms apart so submittedAt ordering is distinct.
    if (i < TEST_USERS.length - 1) {
      await sleep(400);
    }
  }

  console.log("");
  console.log("=== Summary ===");
  console.log("Complaint Number | Rank | Priority | Submitting User");
  console.log("----------------|------|----------|-----------------");
  for (const r of results) {
    console.log(
      `${r.complaintNumber.padEnd(15)} | ${String(r.rank).padEnd(4)} | ${String(r.priorityLevel).padEnd(8)} | ${r.email}`
    );
  }
  console.log("");
  console.log(`Done. ${results.length} complaints submitted.`);
}

main().catch((e) => {
  console.error("Script failed:", e);
  process.exit(1);
});