"use client";

import { useEffect } from "react";
import { api, getToken, redirectByRole } from "@/lib/api";

// Client-side authorization re-check for protected route sections.
//
// The server-side proxy.ts gates page delivery, but a stale localStorage role
// must never be trusted on its own: every protected layout also validates the
// token against the backend (/auth/me) on mount and re-checks the role before
// rendering children. The api client clears the token and bounces to /login
// on a 401, so an expired/invalid session is caught here too.
export function useAuthGuard(roles) {
  const rolesKey = Array.isArray(roles) ? roles.join(",") : String(roles || "");

  useEffect(() => {
    let cancelled = false;

    async function check() {
      if (!getToken()) {
        window.location.href = `/login?next=${encodeURIComponent(
          window.location.pathname
        )}`;
        return;
      }

      try {
        const me = await api.get("/auth/me", { auth: true });
        if (cancelled) return;
        const role = me?.data?.role;
        if (!role || !rolesKey.split(",").includes(role)) {
          // Wrong role for this section — send them to their own home.
          window.location.href = redirectByRole(role);
        }
      } catch {
        // api.get already cleared the token and redirected to /login on 401.
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [rolesKey]);
}
