"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/admin/LogoutButton";
import { resolveStudentDisplayInfo } from "@/lib/student-name";

const PATH_TITLES: Record<string, { parent?: string; title: string }> = {
  "/admin": { title: "Overview" },
  "/admin/mock-tests": { parent: "Assessments", title: "Mock Tests" },
  "/admin/questions": { parent: "Content Bank", title: "Question Bank" },
  "/admin/similarity": { parent: "Quality", title: "Similarity Scanner" },
  "/admin/excel-import-guide": { parent: "Tools", title: "Excel Import Guide" },
  "/admin/question-reports": { parent: "Quality", title: "Question Reports" },
  "/admin/exams": { parent: "Curriculum", title: "Exam Catalogue" },
  "/admin/groups": { parent: "Curriculum", title: "Exams & Papers" },
  "/admin/subjects": { parent: "Curriculum", title: "Subjects & Syllabus" },
  "/admin/exam-pages": { parent: "Curriculum", title: "Public Pages" },
  "/admin/access": { parent: "Commerce", title: "Exam Series & Access" },
  "/admin/students": { parent: "Users", title: "Registrations & Sales" },
  "/admin/results": { parent: "Assessments", title: "Results & Analytics" },
  "/admin/surveys": { parent: "Feedback", title: "Student Surveys & Feedback" },
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

  if (pathname.startsWith("/admin/groups/") && pathname.endsWith("/edit")) {
    return { parent: "Curriculum", title: "Edit Exam & Papers" };
  }

  if (pathname.startsWith("/admin/papers/") && pathname.endsWith("/edit")) {
    return { parent: "Curriculum", title: "Edit Paper" };
  }

  if (pathname.startsWith("/admin/specializations/") && pathname.endsWith("/edit")) {
    return { parent: "Curriculum", title: "Edit Specialization" };
  }

  if (pathname.startsWith("/admin/surveys/")) {
    return { parent: "Feedback", title: "Survey Editor & Responses" };
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
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const quickCreateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (quickCreateRef.current && !quickCreateRef.current.contains(e.target as Node)) {
        setQuickCreateOpen(false);
      }
    };
    if (quickCreateOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [quickCreateOpen]);

  const identity = resolveStudentDisplayInfo({
    fullName: adminName && adminName !== "Administrator" ? adminName : undefined,
    email: userEmail,
  });

  // Initials for avatar
  const initials = identity.displayName
    .split(/\s+/)
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || identity.avatarLetter;

  return (
    <header className="sticky top-0 z-20 hidden min-h-16 items-center justify-between gap-4 border-b border-teal-100 bg-white/90 px-5 py-3 shadow-2xs backdrop-blur-xl md:flex sm:px-8">
      {/* Left: Sidebar Toggle (when collapsed) + Breadcrumbs */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {collapsed && (
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open navigation ( [ )"
            title="Open navigation ( [ )"
            className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-teal-200 bg-white text-teal-800 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 focus:outline-none focus:ring-2 focus:ring-teal-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}

        {/* Dynamic Breadcrumbs */}
        <nav aria-label="Breadcrumbs" className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm font-semibold text-slate-500 min-w-0 leading-snug">
          <Link
            href="/admin"
            className="text-slate-600 hover:text-teal-800 transition font-bold shrink-0"
          >
            Admin
          </Link>

          {breadcrumb.parent && (
            <>
              <span aria-hidden="true" className="text-slate-300">/</span>
              <span className="text-slate-600 break-words">{breadcrumb.parent}</span>
            </>
          )}

          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="font-bold text-slate-900 break-words">{breadcrumb.title}</span>
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
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Zoho-style Quick Action Launcher */}
        <div className="relative shrink-0" ref={quickCreateRef}>
          <button
            type="button"
            onClick={() => setQuickCreateOpen((prev) => !prev)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-teal-800 px-3 text-xs font-bold text-white shadow-2xs transition hover:bg-teal-900 active:scale-95"
            title="Zoho-style Quick Actions"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="hidden sm:inline">Quick Action</span>
            <svg
              className={`h-3 w-3 transition-transform ${quickCreateOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>

          {quickCreateOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-teal-100 bg-white p-1.5 shadow-xl ring-1 ring-slate-900/5 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-teal-800 border-b border-slate-100">
                ⚡ Operational Shortcuts
              </div>
              <div className="py-1">
                <Link
                  href="/admin/questions#add-one-question"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                  </span>
                  <span>New Question</span>
                </Link>
                <Link
                  href="/admin/mock-tests"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span>New Mock Test</span>
                </Link>
                <Link
                  href="/admin/excel-import-guide"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </span>
                  <span>Excel Question Import</span>
                </Link>
                <Link
                  href="/admin/students"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <span>Broadcast Notice / Email</span>
                </Link>
                <Link
                  href="/admin/access"
                  onClick={() => setQuickCreateOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-950 transition"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                    </svg>
                  </span>
                  <span>Exam Series & Pricing</span>
                </Link>
              </div>
            </div>
          )}
        </div>

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
          className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-200/90 bg-teal-50/70 px-3 text-xs font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-100"
        >
          <svg className="h-3.5 w-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
          <span className="hidden sm:inline">Student View</span>
        </Link>

        {/* Admin User Info */}
        <div
          className="hidden min-h-8 min-w-0 md:flex items-center gap-2 rounded-xl border border-teal-200/80 bg-teal-50/40 px-2.5 py-1 text-xs shadow-2xs"
          title={userEmail ? `${identity.displayName} (${userEmail})` : identity.displayName}
        >
          <div className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-teal-700 font-black text-white text-[10px]">
            {initials}
          </div>
          <span className="font-bold text-slate-800 whitespace-nowrap lg:hidden">
            {identity.firstName}
          </span>
          <span className="hidden lg:inline font-bold text-slate-800 max-w-44 xl:max-w-60 truncate">
            {identity.displayName}
          </span>
        </div>

        {/* Logout */}
        <LogoutButton
          allowMultipleDevices
          className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-teal-200 bg-white px-3 text-xs font-bold text-teal-900 shadow-2xs transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 disabled:opacity-50"
        />
      </div>
    </header>
  );
}
