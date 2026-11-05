"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function BackToDashboardButton({
  className = "inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 transition py-1",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsReturning(true);

    if (typeof window !== "undefined") {
      // If student navigated from the dashboard, instant browser history back
      // restores the exact previous page (including page 2/3 & scroll) in 0ms without server queries.
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      const lastDashboardUrl = sessionStorage.getItem("varadhi_last_dashboard_url");
      if (lastDashboardUrl) {
        router.push(lastDashboardUrl);
        return;
      }
    }

    router.push("/dashboard");
  };

  return (
    <Link
      href="/dashboard"
      prefetch={true}
      onClick={handleClick}
      className={className}
    >
      {isReturning ? (
        <>
          <svg className="h-4 w-4 animate-spin text-teal-700 shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Returning to dashboard...</span>
        </>
      ) : (
        <>
          <span aria-hidden="true">←</span>
          <span>Back to dashboard</span>
        </>
      )}
    </Link>
  );
}
