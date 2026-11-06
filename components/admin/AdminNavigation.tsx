"use client";

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/brand/VaradhiBrand";
import { usePathname } from "next/navigation";
import { getAdminNavBadges } from "@/app/actions/admin-badges";
import LogoutButton from "@/components/admin/LogoutButton";

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export const ADMIN_SECTIONS = [
  {
    label: "Workspace",
    links: [{ href: "/admin", label: "Overview", icon: "overview" as const }],
  },
  {
    label: "Curriculum",
    links: [
      { href: "/admin/exams", label: "Exam catalogue", icon: "categories" as const },
      { href: "/admin/subjects", label: "Subjects & Syllabus", icon: "subjects" as const },
      { href: "/admin/exam-pages", label: "Public exam pages", icon: "exams" as const },
    ],
  },
  {
    label: "Question Bank",
    links: [
      { href: "/admin/questions", label: "Question bank", icon: "questions" as const },
      { href: "/admin/similarity", label: "Similarity scanner", icon: "similarity" as const },
      { href: "/admin/excel-import-guide", label: "Excel import guide", icon: "guide" as const },
      { href: "/admin/question-reports", label: "Question reports", icon: "reports" as const },
    ],
  },
  {
    label: "Assessments",
    links: [
      { href: "/admin/mock-tests", label: "Mock tests", icon: "tests" as const },
      { href: "/admin/results", label: "Results & Submissions", icon: "results" as const },
    ],
  },
  {
    label: "Commerce & Users",
    links: [
      { href: "/admin/access", label: "Exam series", icon: "passes" as const },
      { href: "/admin/students", label: "Registrations & Sales", icon: "students" as const },
      { href: "/admin/surveys", label: "Surveys & Feedback", icon: "surveys" as const },
    ],
  },
];

export type NavIconName =
  | "overview"
  | "categories"
  | "exams"
  | "subjects"
  | "questions"
  | "similarity"
  | "tests"
  | "results"
  | "passes"
  | "students"
  | "reports"
  | "surveys"
  | "guide"
  | "portal";

export function NavIcon({ name }: { name: NavIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 shrink-0" {...common}>
      {name === "overview" && (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
          <rect x="13.5" y="11" width="7" height="9.5" rx="1.5" />
          <rect x="3.5" y="14" width="7" height="6.5" rx="1.5" />
        </>
      )}
      {name === "categories" && (
        <>
          <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
          <path d="m5.5 11 6.5 3.5 6.5-3.5" />
          <path d="m5.5 15 6.5 3.5 6.5-3.5" />
        </>
      )}
      {name === "exams" && (
        <>
          <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M14 3.5V7h3" />
          <path d="M9 11h6M9 14.5h6M9 18h4" />
        </>
      )}
      {name === "subjects" && (
        <>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
        </>
      )}
      {name === "questions" && (
        <>
          <path d="M9.4 9a2.7 2.7 0 1 1 4.5 2c-1 .7-1.9 1.2-1.9 2.5" />
          <path d="M12 17.5h.01" />
          <circle cx="12" cy="12" r="9" />
        </>
      )}
      {name === "similarity" && (
        <>
          <rect x="3.5" y="4.5" width="11" height="11" rx="2" />
          <path d="M9.5 9.5h10a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 8 19" />
          <path d="m7 10 2 2 4-4" />
        </>
      )}
      {name === "tests" && (
        <>
          <rect x="5" y="4.5" width="14" height="17" rx="2" />
          <path d="M9 4.5V3h6v1.5M9 10h6M9 14h2" />
          <path d="m13.5 17 1.5 1.5 3-3" />
        </>
      )}
      {name === "results" && (
        <>
          <path d="M4 20.5h16" />
          <rect x="6" y="12" width="2.8" height="6" rx=".7" />
          <rect x="10.6" y="8.5" width="2.8" height="9.5" rx=".7" />
          <rect x="15.2" y="4" width="2.8" height="14" rx=".7" />
        </>
      )}
      {name === "passes" && (
        <>
          <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
          <path d="M12 4v16M4 8.5l8 4.5 8-4.5" />
        </>
      )}
      {name === "students" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M15 5.5a3 3 0 0 1 0 5.8M16 14a4.5 4.5 0 0 1 4.5 4.5V20" />
        </>
      )}
      {name === "reports" && (
        <>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h5M8 16h4" />
          <path d="m15 15 1.5 1.5L19 14" />
        </>
      )}
      {name === "surveys" && (
        <>
          <path d="M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="2" width="6" height="3" rx="1" />
          <path d="m9 12 2 2 4-4" />
          <path d="M9 17h6" />
        </>
      )}
      {name === "guide" && (
        <>
          <path d="M6 3.5h10l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M13 3.5V7h3" />
          <path d="M8 11h8M8 14.5h8M8 18h5" />
        </>
      )}
      {name === "portal" && (
        <>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6" />
          <path d="m10 14 11-11" />
        </>
      )}
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin/exams") {
    return [
      "/admin/exams",
      "/admin/groups",
      "/admin/papers",
      "/admin/specializations",
    ].some((path) => pathname === path || pathname.startsWith(path + "/"));
  }
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(href + "/");
}

export type BadgeState = {
  openReports: number;
  newSurveys: number;
  hasNewReport: boolean;
};

export function NavigationLinks({
  badges,
  onLinkClick,
}: {
  badges: BadgeState;
  onLinkClick?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-5">
      {ADMIN_SECTIONS.map((section) => {
        const sectionHasUpdates = section.links.some((l) =>
          l.href === "/admin/question-reports"
            ? badges.openReports > 0
            : l.href === "/admin/surveys"
              ? badges.newSurveys > 0
              : false
        );

        return (
          <section key={section.label} className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-teal-800">
                {section.label}
              </p>
              {sectionHasUpdates && (
                <span
                  title="Updates available in this section"
                  className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                />
              )}
            </div>

            <div className="space-y-0.5">
              {section.links.map((link) => {
                const active = isActive(pathname, link.href);
                const isReportsLink = link.href === "/admin/question-reports";
                const isSurveysLink = link.href === "/admin/surveys";
                const reportCount = isReportsLink
                  ? pathname.startsWith("/admin/question-reports")
                    ? 0
                    : badges.openReports
                  : 0;
                const surveyCount = isSurveysLink
                  ? pathname.startsWith("/admin/surveys")
                    ? 0
                    : badges.newSurveys
                  : 0;
                const showBadge = reportCount > 0 || surveyCount > 0;
                const badgeCount = reportCount || surveyCount;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={true}
                    onClick={onLinkClick}
                    className={`group relative flex items-center justify-between rounded-xl px-3 py-2 text-xs sm:text-sm font-bold transition duration-150 ${
                      active
                        ? "bg-teal-700 text-white shadow-xs font-bold"
                        : "text-slate-700 hover:bg-teal-50 hover:text-teal-950"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
                          active
                            ? "bg-white/15 text-white"
                            : "text-teal-800 group-hover:text-teal-950"
                        }`}
                      >
                        <NavIcon name={link.icon} />
                      </span>

                      <span className="truncate">{link.label}</span>
                    </div>

                    {showBadge && (
                      <span
                        className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight ${
                          isReportsLink
                            ? active
                              ? "bg-amber-400 text-slate-950"
                              : "bg-amber-100 text-amber-900 border border-amber-200"
                            : active
                              ? "bg-white/20 text-white"
                              : "bg-teal-100 text-teal-800 border border-teal-200"
                        }`}
                      >
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function AdminNavigation(props: {
  collapsed?: boolean;
  onToggle?: () => void;
  userEmail?: string;
  adminName?: string;
}) {
  const { collapsed = false, onToggle, userEmail, adminName = "Administrator" } = props;
  const [mobileOpen, setMobileOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribeToClient, getClientSnapshot, getServerSnapshot);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [badges, setBadges] = useState<BadgeState>({
    openReports: 0,
    newSurveys: 0,
    hasNewReport: false,
  });
  const pathname = usePathname();

  const handleDrawerClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const fetchBadges = useCallback(async () => {
    try {
      const lastSeenSurveys =
        typeof window !== "undefined"
          ? localStorage.getItem("varadhi_admin_surveys_last_seen")
          : null;
      const lastSeenReports =
        typeof window !== "undefined"
          ? localStorage.getItem("varadhi_admin_reports_last_seen")
          : null;

      const data = await getAdminNavBadges(lastSeenSurveys);

      const hasNewReport = Boolean(
        data.reports.latestCreatedAt &&
          (!lastSeenReports ||
            new Date(data.reports.latestCreatedAt) > new Date(lastSeenReports))
      );

      const hasAny = data.reports.openCount > 0 || data.surveys.newCount > 0;

      setBadges({
        openReports: data.reports.openCount,
        newSurveys: data.surveys.newCount,
        hasNewReport,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("admin_has_updates", {
            detail: hasAny,
          })
        );
      }
    } catch (err) {
      console.error("Failed to fetch admin nav badges:", err);
    }
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  }

  // Listen to open/toggle/close events from header or shortcuts
  useEffect(() => {
    const handleOpen = () => setMobileOpen(true);
    const handleClose = () => setMobileOpen(false);
    const handleToggle = () => setMobileOpen((prev) => !prev);

    window.addEventListener("admin_sidebar_open", handleOpen);
    window.addEventListener("admin_sidebar_close", handleClose);
    window.addEventListener("admin_sidebar_toggle_mobile", handleToggle);

    return () => {
      window.removeEventListener("admin_sidebar_open", handleOpen);
      window.removeEventListener("admin_sidebar_close", handleClose);
      window.removeEventListener("admin_sidebar_toggle_mobile", handleToggle);
    };
  }, []);

  // Lock body scroll on mobile drawer open
  useEffect(() => {
    if (!mobileOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDrawerClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, handleDrawerClose]);

  // Update seen states in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (pathname.startsWith("/admin/surveys")) {
        try {
          localStorage.setItem("varadhi_admin_surveys_last_seen", new Date().toISOString());
        } catch {}
      }
      if (pathname.startsWith("/admin/question-reports")) {
        try {
          localStorage.setItem("varadhi_admin_reports_last_seen", new Date().toISOString());
        } catch {}
      }
    }
  }, [pathname]);

  // Periodic badge check
  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void fetchBadges();
    }, 0);

    const handleFocus = () => void fetchBadges();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void fetchBadges();
    };
    const handleBadgeRefresh = () => void fetchBadges();

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("admin-badge-refresh", handleBadgeRefresh);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchBadges();
      }
    }, 45000);

    return () => {
      window.clearTimeout(initialTimer);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("admin-badge-refresh", handleBadgeRefresh);
      clearInterval(interval);
    };
  }, [fetchBadges]);

  const hasAnyUpdate = badges.openReports > 0 || badges.newSurveys > 0;

  const initials = adminName
    ? adminName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <>
      {/* ========================================================
          1. PERSISTENT DESKTOP SIDEBAR (Visible md: and up)
             Closes fully with -translate-x-full (no lingering icon bar)
      ======================================================== */}
      <aside
        aria-label="Admin desktop navigation"
        className={`fixed inset-y-0 left-0 z-30 hidden md:flex flex-col border-r border-teal-100 bg-white text-slate-900 shadow-xl transition-transform duration-200 ease-in-out w-72 ${
          collapsed ? "-translate-x-full pointer-events-none" : "translate-x-0"
        }`}
      >
        {/* Sidebar Header Brand Lockup */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-teal-100 px-4">
          <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
            <BrandLockup
              context="admin"
              markClassName="h-8 w-8 shrink-0 drop-shadow-xs"
            />
          </Link>

          <button
            type="button"
            onClick={onToggle}
            title="Collapse sidebar ( [ )"
            aria-label="Close sidebar"
            className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-4 space-y-5 [scrollbar-width:thin] [scrollbar-color:theme(colors.teal.100)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-teal-100 hover:[&::-webkit-scrollbar-thumb]:bg-teal-200">
          <NavigationLinks
            badges={badges}
            collapsed={collapsed}
          />
        </div>

        {/* Sidebar Bottom Actions */}
        <div className="shrink-0 border-t border-teal-100 bg-slate-50/50 p-3 space-y-2">
          {/* Student Portal shortcut */}
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            title={collapsed ? "Student portal (Open in new tab)" : "Student portal (Open in new tab)"}
            className="flex items-center justify-between rounded-xl border border-teal-200/80 bg-white px-3 py-2 text-xs font-bold text-teal-900 shadow-2xs hover:bg-teal-50 transition"
          >
            <span className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded bg-teal-50 text-teal-800">
                <NavIcon name="portal" />
              </span>
              <span>Student Portal</span>
            </span>
            <span className="text-[10px] font-bold text-teal-700">↗</span>
          </Link>

          {/* Admin identity & status */}
          <div className="flex items-center justify-between gap-2 pt-1 px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-teal-700 text-[10px] font-black text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 leading-tight">
                  {userEmail ?? adminName}
                </p>
                <p className="flex items-center gap-1 text-[10px] font-semibold text-teal-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  <span>MFA Active</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onToggle}
              title="Collapse sidebar ( [ )"
              aria-label="Collapse sidebar"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          2. MOBILE TOP STICKY BAR (Visible on < md)
      ======================================================== */}
      <div className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-teal-100 bg-white/95 px-4 text-slate-900 shadow-xs backdrop-blur md:hidden">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin side navigation"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-drawer"
            className="relative grid h-9 w-9 place-items-center rounded-xl border border-teal-200/80 bg-teal-50/60 text-teal-800 transition hover:bg-teal-100 hover:text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <MenuIcon />
            {hasAnyUpdate && (
              <span
                title="Updates available in question reports or surveys"
                className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"
              />
            )}
          </button>
          <Link href="/admin" className="flex items-center">
            <BrandLockup context="admin" markClassName="h-7 w-7 shrink-0 drop-shadow-xs" />
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("admin_open_command_palette"))}
            aria-label="Open command search"
            className="grid h-9 w-9 place-items-center rounded-xl border border-teal-200/80 bg-teal-50/60 text-teal-800 hover:bg-teal-100 transition"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </button>
          <LogoutButton className="rounded-xl border border-teal-200/80 bg-teal-50/60 px-2.5 py-1.5 text-xs font-bold text-teal-800 hover:bg-teal-100 hover:text-teal-950 disabled:opacity-50" />
        </div>
      </div>

      {/* ========================================================
          3. MOBILE SLIDE-OUT DRAWER (createPortal)
      ======================================================== */}
      {mounted &&
        createPortal(
          <div
            id="admin-mobile-drawer"
            className={`fixed inset-0 z-[100] transition-opacity duration-300 md:hidden ${
              mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            }`}
            aria-hidden={!mobileOpen}
          >
            {/* Backdrop overlay */}
            <button
              type="button"
              aria-label="Close admin side navigation"
              onClick={handleDrawerClose}
              className={`absolute inset-0 h-full w-full bg-[#0a2922]/50 backdrop-blur-[2px] transition-opacity duration-300 cursor-pointer ${
                mobileOpen ? "opacity-100" : "opacity-0"
              }`}
              tabIndex={mobileOpen ? 0 : -1}
            />

            {/* Slide-out Sidebar Drawer */}
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Admin side navigation"
              className={`absolute inset-y-0 left-0 flex h-full w-[min(22rem,88vw)] flex-col border-r border-teal-100 bg-white text-slate-900 shadow-2xl transition-transform duration-300 ease-out ${
                mobileOpen ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              {/* Drawer Top Header */}
              <div className="flex h-16 shrink-0 items-center justify-between border-b border-teal-100 px-5">
                <Link href="/admin" onClick={handleDrawerClose}>
                  <BrandLockup context="admin" markClassName="h-8 w-8 shrink-0 drop-shadow-xs" />
                </Link>
                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={handleDrawerClose}
                  aria-label="Close admin navigation"
                  className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 space-y-6 [scrollbar-width:thin] [scrollbar-color:theme(colors.teal.100)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-teal-100 hover:[&::-webkit-scrollbar-thumb]:bg-teal-200">
                <NavigationLinks
                  badges={badges}
                  onLinkClick={handleDrawerClose}
                />
              </div>

              {/* Drawer Footer */}
              <div className="shrink-0 border-t border-teal-100 bg-slate-50 p-4 space-y-3">
                <div className="flex items-center gap-2 px-1 text-[11px] font-semibold text-teal-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  <span>MFA Verified Session</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Link
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleDrawerClose}
                    title={collapsed ? "Student portal (Open in new tab)" : "Student portal (Open in new tab)"}
                    className="flex flex-1 items-center justify-between rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-900 shadow-2xs hover:bg-teal-50"
                  >
                    <span>Student portal</span>
                    <span className="text-[10px] text-teal-700">↗</span>
                  </Link>
                  <LogoutButton className="rounded-xl border border-teal-200 bg-white px-3 py-2 text-xs font-bold text-teal-900 shadow-2xs hover:bg-teal-50 disabled:opacity-50" />
                </div>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

function MenuIcon() {
  return (
    <span className="space-y-1" aria-hidden="true">
      <span className="block h-0.5 w-4 rounded-full bg-current" />
      <span className="block h-0.5 w-4 rounded-full bg-current" />
      <span className="block h-0.5 w-4 rounded-full bg-current" />
    </span>
  );
}
