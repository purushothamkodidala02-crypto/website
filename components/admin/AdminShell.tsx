"use client";

import { useSyncExternalStore, useCallback } from "react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

const STORAGE_KEY = "varadhi_admin_sidebar_collapsed";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("admin_sidebar_toggle", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("admin_sidebar_toggle", callback);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleToggle = useCallback(() => {
    try {
      const next = !getSnapshot();
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("admin_sidebar_toggle"));
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <AdminNavigation
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
      />
      <div className={`min-w-0 transition-[padding] duration-200 ${sidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        {children}
      </div>
    </>
  );
}
