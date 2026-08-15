#!/usr/bin/env bash
# End-to-end smoke test for the Finance Complaint Portal backend.
#
# Usage:
#   BASE_URL=http://localhost:3001/api ADMIN_EMAIL=... ADMIN_PASSWORD=... bash scripts/smoke-test.sh
#
# Environment variables:
#   BASE_URL         API base URL (default http://localhost:3001/api)
#   ADMIN_EMAIL      admin login (default admin@finance.gov.pk)
#   ADMIN_PASSWORD   admin password (default NewAdmin@1)
#   STAFF_EMAIL      IT_STAFF login (default staff@finance.gov.pk)
#   STAFF_PASSWORD   IT_STAFF password (default Staff@12345)
#
# Exits non-zero if any check fails.

set -u

BASE_URL="${BASE_URL:-http://localhost:3001/api}"
ADMIN_EMAIL="${ADMIN_EMAIL:-admin@finance.gov.pk}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-NewAdmin@1}"
STAFF_EMAIL="${STAFF_EMAIL:-staff@finance.gov.pk}"
STAFF_PASSWORD="${STAFF_PASSWORD:-Staff@12345}"

PASS=0
FAIL=0
declare -a FAILURES

ok() { PASS=$((PASS + 1)); echo "  PASS  $1"; }
bad() { FAIL=$((FAIL + 1)); FAILURES+=("$1"); echo "  FAIL  $1"; }

expect_success() { # name json
  local name="$1" data="$2"
  if [ "$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('success', False))")" = "True" ]; then
    ok "$name"
  else
    bad "$name: $(echo "$data" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('statusCode'), d.get('message'))")"
  fi
}

expect_failure() { # name json status
  local name="$1" data="$2" want="$3"
  local got
  got=$(echo "$data" | python3 -c "import json,sys; print(json.load(sys.stdin).get('statusCode'))")
  if [ "$got" = "$want" ]; then ok "$name"
  else bad "$name: expected $want got $got"; fi
}

json_field() { echo "$1" | python3 -c "import json,sys; print(json.load(sys.stdin)$2)"; }

echo "== Health =="
expect_success "health" "$(curl -s "$BASE_URL/health")"

echo "== Lookup =="
expect_success "lookup categories" "$(curl -s "$BASE_URL/lookup/categories")"

echo "== Auth =="
ADMIN_TOKEN=$(json_field "$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")" "['data']['token']")
if [ -n "$ADMIN_TOKEN" ]; then ok "admin login"; else bad "admin login"; fi
STAFF_TOKEN=$(json_field "$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$STAFF_EMAIL\",\"password\":\"$STAFF_PASSWORD\"}")" "['data']['token']")
if [ -n "$STAFF_TOKEN" ]; then ok "staff login"; else bad "staff login"; fi

expect_success "auth/me" "$(curl -s "$BASE_URL/auth/me" -H "Authorization: Bearer $ADMIN_TOKEN")"

# Register a throwaway user
RAND=$RANDOM
USER_EMAIL="smoke-$RAND@test.local"
REG=$(curl -s -X POST "$BASE_URL/auth/register" -H 'Content-Type: application/json' -d "{\"email\":\"$USER_EMAIL\",\"password\":\"Password1\",\"confirmPassword\":\"Password1\",\"fullName\":\"Smoke Test\",\"employeeId\":\"EMP$RAND\",\"department\":\"ADMINISTRATION\"}")
expect_success "register user" "$REG"
USER_TOKEN=$(json_field "$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$USER_EMAIL\",\"password\":\"Password1\"}")" "['data']['token']")

expect_failure "validation: bad email" "$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d '{"email":"nope","password":"x"}')" 400
expect_failure "wrong password" "$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"wrongpassword\"}")" 401
expect_failure "missing token" "$(curl -s "$BASE_URL/auth/me")" 401

echo "== Complaints =="
CID=$(json_field "$(curl -s -X POST "$BASE_URL/complaints" -H "Authorization: Bearer $USER_TOKEN" -H 'Content-Type: application/json' -d "{\"category\":\"OTHER\",\"roomNo\":\"$RAND\",\"block\":\"Q\",\"rank\":18,\"contactMethod\":\"PTCL\",\"contactNumber\":\"111\",\"description\":\"Smoke test complaint created at $RAND with sufficient length\"}")" "['data']['complaintId']")
if [ -n "$CID" ]; then ok "create complaint"; else bad "create complaint"; fi
CNO=$(json_field "$(curl -s "$BASE_URL/complaints/$CID" -H "Authorization: Bearer $ADMIN_TOKEN")" "['data']['complaintNumber']")
[ -n "$CNO" ] && ok "get complaint by id (number $CNO)" || bad "get complaint by id"

expect_success "list complaints" "$(curl -s "$BASE_URL/complaints?page=1&limit=5" -H "Authorization: Bearer $ADMIN_TOKEN")"

echo "== Assignment =="
ASN=$(curl -s -X PATCH "$BASE_URL/assignments/$CID" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"technicianName":"Smoke Handler","comment":"smoke assign"}')
expect_success "assign complaint" "$ASN"
expect_failure "re-assign conflict" "$(curl -s -X PATCH "$BASE_URL/assignments/$CID" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"technicianName":"Smoke Handler","comment":"again"}')" 409

echo "== Status transitions =="
# Assignment already moved the complaint to ACKNOWLEDGED.
expect_success "IN_PROGRESS" "$(curl -s -X PATCH "$BASE_URL/complaints/$CID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"IN_PROGRESS"}')"
expect_success "RESOLVED" "$(curl -s -X PATCH "$BASE_URL/complaints/$CID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"RESOLVED"}')"
expect_success "CLOSED" "$(curl -s -X PATCH "$BASE_URL/complaints/$CID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"CLOSED"}')"
expect_failure "illegal transition (RESOLVED after CLOSED)" "$(curl -s -X PATCH "$BASE_URL/complaints/$CID/status" -H "Authorization: Bearer $ADMIN_TOKEN" -H 'Content-Type: application/json' -d '{"status":"RESOLVED"}')" 422

echo "== History =="
expect_success "history" "$(curl -s "$BASE_URL/history/complaints/$CID" -H "Authorization: Bearer $ADMIN_TOKEN")"
echo "== Notifications =="
expect_success "list notifications" "$(curl -s "$BASE_URL/notifications" -H "Authorization: Bearer $STAFF_TOKEN")"

echo "== Queue =="
expect_success "queue" "$(curl -s "$BASE_URL/employee/queue" -H "Authorization: Bearer $ADMIN_TOKEN")"

echo "== Dashboard =="
expect_success "dashboard summary" "$(curl -s "$BASE_URL/admin/dashboard" -H "Authorization: Bearer $ADMIN_TOKEN")"
expect_success "dashboard staff" "$(curl -s "$BASE_URL/admin/dashboard/staff" -H "Authorization: Bearer $ADMIN_TOKEN")"

echo "== RBAC =="
expect_failure "staff on admin dashboard" "$(curl -s "$BASE_URL/admin/dashboard" -H "Authorization: Bearer $STAFF_TOKEN")" 403

echo "== Lookup enforcement =="
expect_failure "whitelist rejects unknown field" "$(curl -s -X POST "$BASE_URL/complaints" -H "Authorization: Bearer $USER_TOKEN" -H 'Content-Type: application/json' -d '{"category":"OTHER","roomNo":"1","block":"Q","rank":18,"contactMethod":"PTCL","contactNumber":"1","description":"valid length description here","bogusField":true}')" 400

echo "== Password reset flow =="
expect_success "forgot password" "$(curl -s -X POST "$BASE_URL/auth/forgot-password" -H 'Content-Type: application/json' -d "{\"email\":\"$USER_EMAIL\"}")"
expect_failure "reset with invalid token" "$(curl -s -X POST "$BASE_URL/auth/reset-password" -H 'Content-Type: application/json' -d "{\"email\":\"$USER_EMAIL\",\"token\":\"__nonexistent__\",\"newPassword\":\"Password2\"}")" 400

echo
echo "============================================="
echo "  Smoke test result: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  printf '  - %s\n' "${FAILURES[@]}"
  exit 1
fi
exit 0
