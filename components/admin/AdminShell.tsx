"use client";

import { useState } from "react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <>
      <AdminNavigation
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
      />
      <div className={`min-w-0 transition-[padding] duration-200 ${sidebarCollapsed ? "md:pl-20" : "md:pl-64"}`}>
        {children}
      </div>
    </>
  );
}
