"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { clearLocalPracticeStorage } from "@/lib/storage/student-practice-storage";

export default function LogoutButton({ className }: { className?: string } = {}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    clearLocalPracticeStorage();

    const supabase = createClient();

    // 1. Clear session locally in 0ms so the browser cookies are wiped immediately
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore
    }

    // 2. Fire-and-forget remote revocation in background so user never waits
    void supabase.auth.signOut({ scope: "global" }).catch(() => null);

    // 3. Instant navigation to login page
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-busy={loading}
      className={
        className ??
        "rounded-xl border border-teal-200 bg-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-teal-900 shadow-2xs hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 disabled:opacity-50"
      }
    >
      <PendingButtonContent pending={loading} pendingLabel="Logging out…">Logout</PendingButtonContent>
    </button>
  );
}
