"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { clearLocalPracticeStorage } from "@/lib/storage/student-practice-storage";

export default function LogoutButton({
  className,
  allowMultipleDevices = false,
}: {
  className?: string;
  allowMultipleDevices?: boolean;
} = {}) {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    clearLocalPracticeStorage();

    const supabase = createClient();
    const isAdminRoute =
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/admin-mfa"));
    const preserveOtherDevices = allowMultipleDevices || isAdminRoute;

    // 1. Clear session locally in 0ms so the browser cookies on this device are wiped immediately
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore
    }

    // 2. For single-device student accounts, also revoke remote sessions; admins keep other devices signed in
    if (!preserveOtherDevices) {
      void supabase.auth.signOut({ scope: "global" }).catch(() => null);
    }

    // 3. Instant navigation to login page
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-busy={loading}
      aria-label={loading ? "Logging out" : "Logout"}
      title="Logout"
      className={
        className ??
        "inline-flex h-9 sm:h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:border-rose-200 hover:bg-rose-50/70 hover:text-rose-700 disabled:opacity-50"
      }
    >
      <span className="inline-flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap">
        {loading ? (
          <LoadingSpinner className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 fill-none stroke-current"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
        )}
        <span className="hidden min-[400px]:inline">{loading ? "Logging out…" : "Logout"}</span>
      </span>
    </button>
  );
}
