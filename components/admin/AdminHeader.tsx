"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";

const PATH_TITLES: Record<string, { parent?: string; title: string }> = {
  "/admin": { title: "Overview" },
  "/admin/mock-tests": { parent: "Assessments", title: "Mock Tests" },
  "/admin/questions": { parent: "Content Bank", title: "Question Bank" },
  "/admin/similarity": { parent: "Quality", title: "Similarity Scanner" },
  "/admin/excel-import-guide": { parent: "Tools", title: "Excel Import Guide" },
  "/admin/question-reports": { parent: "Quality", title: "Question Reports" },
  "/admin/exams": { parent: "Curriculum", title: "Exam Catalogue" },
  "/admin/subjects": { parent: "Curriculum", title: "Subjects & Syllabus" },
  "/admin/exam-pages": { parent: "Curriculum", title: "Public Exam Pages" },
  "/admin/access": { parent: "Commerce", title: "Exam Series & Access" },
  "/admin/students": { parent: "Users", title: "Registrations & Sales" },
  "/admin/results": { parent: "Assessments", title: "Results & Analytics" },
  "/admin/surveys": { parent: "Feedback", title: "Student Surveys" },
};

function getBreadcrumb(pathname: string): { parent?: string; title: string } {
  if (PATH_TITLES[pathname]) return PATH_TITLES[pathname];

  if (pathname.startsWith("/admin/mock-tests/")) {
    if (pathname.endsWith("/questions")) {
      return { parent: "Mock Tests", title: "Manage Questions" };
    }
    if (pathname.endsWith("/preview")) {
      return { parent: "Mock Tests", title: "Preview Test" };
    }
    if (pathname.endsWith("/edit")) {
      return { parent: "Mock Tests", title: "Edit Configuration" };
    }
    return { parent: "Assessments", title: "Mock Test Workspace" };
  }

  if (pathname.startsWith("/admin/questions/") && pathname.endsWith("/edit")) {
    return { parent: "Question Bank", title: "Edit Question" };
  }

  if (pathname.startsWith("/admin/subjects/") && pathname.endsWith("/edit")) {
    return { parent: "Subjects", title: "Edit Subject" };
  }

  if (pathname.startsWith("/admin/access/") && pathname.endsWith("/edit")) {
    return { parent: "Exam Series", title: "Edit Access Series" };
  }

  if (pathname.startsWith("/admin/exams/") && pathname.endsWith("/edit")) {
    return { parent: "Exam Catalogue", title: "Edit Category" };
  }

  return { title: "Administration" };
}

export function AdminHeader({
  collapsed,
  onToggleSidebar,
  onOpenCommandPalette,
  userEmail,
  adminName = "Administrator",
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenCommandPalette: () => void;
  userEmail?: string;
  adminName?: string;
}) {
  const pathname = usePathname();
  const breadcrumb = getBreadcrumb(pathname);

  // Initials for avatar
  const initials = adminName
    ? adminName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="sticky top-0 z-20 hidden min-h-16 items-center justify-between gap-4 border-b border-teal-100 bg-white/90 px-5 py-3 shadow-2xs backdrop-blur-xl md:flex sm:px-8">
      {/* Left: Sidebar Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={collapsed ? "Open navigation ( [ )" : "Close navigation ( [ )"}
          title={collapsed ? "Open navigation ( [ )" : "Close navigation ( [ )"}
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-teal-200 bg-white text-teal-800 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          {collapsed ? (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
            </svg>
          )}
        </button>

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 truncate">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-slate-600 hover:text-teal-800 transition font-bold"
          >
            <span className="h-2 w-2 rounded-full bg-teal-600" />
            <span>Admin</span>
          </Link>

          {breadcrumb.parent && (
            <>
              <span className="text-slate-300">/</span>
              <span className="text-slate-600 truncate">{breadcrumb.parent}</span>
            </>
          )}

          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 truncate">{breadcrumb.title}</span>
        </nav>
      </div>

      {/* Center: Search / Command Palette Trigger */}
      <div className="flex-1 max-w-sm mx-2">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex w-full items-center justify-between gap-3 rounded-xl border border-teal-100 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-500 shadow-2xs transition hover:border-teal-300 hover:bg-white hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          <div className="flex items-center gap-2 truncate">
            <svg
              className="h-3.5 w-3.5 text-teal-700 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <span className="truncate">Search commands or tools...</span>
          </div>
          <kbd className="hidden lg:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-600 shadow-2xs">
            <span>Ctrl</span>
            <span>K</span>
          </kbd>
        </button>
      </div>

      {/* Right: Security, Student Portal, User Profile, Sign Out */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* MFA Active Badge */}
        <span
          title="Session secured with Two-Factor Authentication (AAL2)"
          className="hidden xl:inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-teal-800"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
          </span>
          <span>MFA Active</span>
        </span>

        {/* Student Portal Quick Link */}
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          title="Open public student portal in new tab"
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200/90 bg-teal-50/70 px-3 py-1.5 text-xs font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-100"
        >
          <svg className="h-3.5 w-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          <span className="hidden sm:inline">Student View</span>
        </Link>

        {/* Admin User Info */}
        <div className="hidden lg:flex items-center gap-2 rounded-xl border border-teal-100 bg-white px-2.5 py-1 text-xs shadow-2xs">
          <div className="grid h-6 w-6 place-items-center rounded-lg bg-teal-700 font-black text-white text-[10px]">
            {initials}
          </div>
          <span className="max-w-44 truncate font-semibold text-slate-700">
            {userEmail ?? adminName}
          </span>
        </div>

        {/* Logout */}
        <LogoutButton className="rounded-xl border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 disabled:opacity-50" />
      </div>
    </header>
  );
}
