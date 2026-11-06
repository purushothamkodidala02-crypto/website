"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminCommandPalette } from "@/components/admin/AdminCommandPalette";

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

export function AdminShell({
  children,
  userEmail,
  adminName = "Administrator",
}: {
  children: React.ReactNode;
  userEmail?: string;
  adminName?: string;
}) {
  const sidebarCollapsed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleToggleSidebar = useCallback(() => {
    try {
      const next = !getSnapshot();
      localStorage.setItem(STORAGE_KEY, String(next));
      window.dispatchEvent(new Event("admin_sidebar_toggle"));
    } catch {
      // ignore
    }
  }, []);

  // Global keyboard shortcuts (Ctrl+K, Cmd+K, [, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut when active in text inputs or editable elements
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      // Ctrl+K / Cmd+K / Slash to open command palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (e.key === "/" && !isInput) {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // [ key to toggle sidebar collapse
      if (e.key === "[" && !isInput && !(e.ctrlKey || e.metaKey || e.altKey)) {
        e.preventDefault();
        handleToggleSidebar();
        return;
      }
    };

    const handleOpenCommandPalette = () => {
      setCommandPaletteOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("admin_open_command_palette", handleOpenCommandPalette);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("admin_open_command_palette", handleOpenCommandPalette);
    };
  }, [handleToggleSidebar]);

  return (
    <div className="min-h-screen bg-[#f6faf8] text-slate-900 select-text">
      {/* Sidebar (Desktop docked + Mobile drawer) */}
      <AdminNavigation
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        userEmail={userEmail}
        adminName={adminName}
      />

      {/* Main Content Area - dynamically adjusted for sidebar width */}
      <div
        className={`min-w-0 flex flex-col transition-[padding] duration-200 ease-in-out ${
          sidebarCollapsed ? "md:pl-20" : "md:pl-68"
        }`}
      >
        {/* Desktop Sticky Header */}
        <AdminHeader
          collapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          userEmail={userEmail}
          adminName={adminName}
        />

        {/* Page Content */}
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-7 lg:p-9 min-w-0">
          {children}
        </main>
      </div>

      {/* Global Command Palette */}
      <AdminCommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
