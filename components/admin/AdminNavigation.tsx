"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLockup, BrandMark } from "@/components/brand/VaradhiBrand";
import { usePathname } from "next/navigation";

const sections = [
  {
    label: "Workspace",
    links: [{ href: "/admin", label: "Overview", icon: "overview" as const }],
  },
  {
    label: "Exam structure",
    links: [
      { href: "/admin/exams", label: "Exam catalogue", icon: "categories" as const },
      { href: "/admin/exam-pages", label: "Public exam pages", icon: "exams" as const },
    ],
  },
  {
    label: "Content and publishing",
    links: [
      { href: "/admin/questions", label: "Question bank", icon: "questions" as const },
      { href: "/admin/excel-import-guide", label: "Excel import guide", icon: "guide" as const },
      { href: "/admin/question-reports", label: "Question reports", icon: "reports" as const },
      { href: "/admin/mock-tests", label: "Mock tests", icon: "tests" as const },
      { href: "/admin/access", label: "Exam series", icon: "passes" as const },
      { href: "/admin/students", label: "Registrations", icon: "students" as const },
      { href: "/admin/results", label: "Results", icon: "results" as const },
    ],
  },
];

type NavIconName =
  | "overview"
  | "categories"
  | "exams"
  | "subjects"
  | "questions"
  | "tests"
  | "results"
  | "passes"
  | "students"
  | "reports"
  | "guide";

function NavIcon({ name }: { name: NavIconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" {...common}>
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
      {name === "passes" && <><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" /><path d="M12 4v16M4 8.5l8 4.5 8-4.5" /></>}
      {name === "students" && <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20" /><path d="M15 5.5a3 3 0 0 1 0 5.8M16 14a4.5 4.5 0 0 1 4.5 4.5V20" /></>}
      {name === "reports" && <><path d="M5 4h14v16H5z" /><path d="M8 8h8M8 12h5M8 16h4" /><path d="m15 15 1.5 1.5L19 14" /></>}
      {name === "guide" && <><path d="M6 3.5h10l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" /><path d="M13 3.5V7h3" /><path d="M8 11h8M8 14.5h8M8 18h5" /></>}
    </svg>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/admin/exams") {
    return [
      "/admin/exams",
      "/admin/groups",
      "/admin/papers",
      "/admin/subjects",
      "/admin/specializations",
    ].some((path) => pathname.startsWith(path));
  }
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function NavigationLinks({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="grid gap-6">
      {sections.map((section) => (
        <section key={section.label}>
          {!collapsed && <p className="px-3 text-[10px] font-black uppercase tracking-[0.17em] text-slate-500">{section.label}</p>}
          <div className="mt-2 grid gap-1">
            {section.links.map((link) => {
              const active = isActive(pathname, link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${collapsed ? "justify-center" : ""} ${
                    active
                      ? "bg-teal-300 text-slate-950 shadow-lg shadow-teal-950/20"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${
                      active
                        ? "bg-slate-950 text-teal-200"
                        : "bg-white/10 text-slate-300"
                    }`}
                  >
                    <NavIcon name={link.icon} />
                  </span>
                  {!collapsed && link.label}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

function Brand({ linked = true, collapsed = false }: { linked?: boolean; collapsed?: boolean }) {
  const content = collapsed
    ? <BrandMark preload className="h-10 w-10 shrink-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]" />
    : <BrandLockup context="admin" markClassName="h-10 w-10 shrink-0 drop-shadow-[0_8px_14px_rgba(0,0,0,0.3)]" />;

  if (!linked) return <div className="flex items-center gap-3">{content}</div>;

  return (
    <Link href="/admin" className="flex items-center gap-3">
      {content}
    </Link>
  );
}

export function AdminNavigation({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-800 bg-slate-950 py-6 text-white transition-[width] duration-200 md:flex ${collapsed ? "w-20 px-3" : "w-64 px-5"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          <Brand collapsed={collapsed} />
          {!collapsed && <button type="button" onClick={onToggle} aria-label="Collapse sidebar" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-white/10 hover:text-white"><MenuIcon /></button>}
        </div>
        {collapsed && <button type="button" onClick={onToggle} aria-label="Expand sidebar" className="mt-5 grid h-10 w-full place-items-center rounded-lg border border-slate-700 text-slate-300 transition hover:bg-white/10 hover:text-white"><MenuIcon /></button>}
        <div className="mt-6 flex-1 overflow-y-auto pb-4 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <NavigationLinks collapsed={collapsed} />
        </div>
        <div className="mt-auto border-t border-slate-800 pt-5">
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            aria-label="Student"
            title={collapsed ? "Student" : undefined}
            className={`flex items-center justify-between rounded-xl border border-slate-800 bg-white/5 px-3 py-2.5 text-sm font-bold text-slate-300 hover:border-slate-700 hover:bg-white/10 hover:text-white ${collapsed ? "justify-center" : ""}`}
          >
            <span>{collapsed ? "S" : "Student"}</span>
            {!collapsed && <span className="text-[10px] tracking-wider text-teal-200">Open</span>}
          </Link>
        </div>
      </aside>

      <div className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white md:hidden">
        <div>
          <button type="button" onClick={() => setMobileOpen(!mobileOpen)} className="flex w-full cursor-pointer items-center justify-between">
            <Brand linked={false} />
            <span className={`rounded-lg border border-slate-700 px-3 py-2 text-xs font-black text-slate-200 ${mobileOpen ? "bg-white/10" : ""}`}>
              Menu
            </span>
          </button>
          {mobileOpen && (
            <div className="mt-5 border-t border-slate-800 pt-5">
              <NavigationLinks />
              <Link
                href="/"
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-between rounded-xl border border-slate-800 bg-white/5 px-3 py-3 text-sm font-bold text-slate-200"
              >
                <span>Student</span>
                <span className="text-[10px] tracking-wider text-teal-200">Open</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function MenuIcon() {
  return <span className="space-y-1" aria-hidden="true"><span className="block h-0.5 w-4 rounded-full bg-current" /><span className="block h-0.5 w-4 rounded-full bg-current" /><span className="block h-0.5 w-4 rounded-full bg-current" /></span>;
}
