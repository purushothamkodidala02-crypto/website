"use client";

import { useEffect, useState } from "react";
import { getAdminNavBadges } from "@/app/actions/admin-badges";

export function AdminMenuButton() {
  const [hasAnyUpdate, setHasAnyUpdate] = useState(false);

  useEffect(() => {
    let active = true;
    const checkBadges = async () => {
      try {
        const lastSurveysSeen =
          typeof window !== "undefined"
            ? localStorage.getItem("varadhi_admin_surveys_last_seen")
            : null;
        const data = await getAdminNavBadges(lastSurveysSeen);
        if (active) {
          setHasAnyUpdate(data.reports.openCount > 0 || data.surveys.newCount > 0);
        }
      } catch {
        // ignore
      }
    };

    void checkBadges();
    const handleRefresh = () => void checkBadges();
    window.addEventListener("admin-badge-refresh", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    return () => {
      active = false;
      window.removeEventListener("admin-badge-refresh", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("admin_sidebar_open"))}
      aria-label="Open admin side navigation"
      className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-teal-200 bg-white text-teal-800 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-400"
    >
      <span className="space-y-1" aria-hidden="true">
        <span className="block h-0.5 w-4 rounded-full bg-current" />
        <span className="block h-0.5 w-4 rounded-full bg-current" />
        <span className="block h-0.5 w-4 rounded-full bg-current" />
      </span>
      {hasAnyUpdate && (
        <span
          title="Updates available in question reports or surveys"
          className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"
        />
      )}
    </button>
  );
}
