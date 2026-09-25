"use client";

import { useState, useEffect } from "react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("varadhi_admin_sidebar_collapsed");
      if (stored !== null) {
        setSidebarCollapsed(stored === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed((current) => {
      const next = !current;
      try {
        localStorage.setItem("varadhi_admin_sidebar_collapsed", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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
