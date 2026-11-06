"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type CommandItem = {
  id: string;
  title: string;
  category: "Navigation" | "Quick Actions" | "Tools & Support";
  description: string;
  href: string;
  icon: string;
  external?: boolean;
};

const COMMANDS: CommandItem[] = [
  // Navigation
  {
    id: "nav-overview",
    title: "Overview",
    category: "Navigation",
    description: "Main administration dashboard and KPI overview",
    href: "/admin",
    icon: "overview",
  },
  {
    id: "nav-mock-tests",
    title: "Mock Tests",
    category: "Navigation",
    description: "Manage, create, and publish student mock tests",
    href: "/admin/mock-tests",
    icon: "tests",
  },
  {
    id: "nav-questions",
    title: "Question Bank",
    category: "Navigation",
    description: "Browse, filter, and edit reusable exam questions",
    href: "/admin/questions",
    icon: "questions",
  },
  {
    id: "nav-similarity",
    title: "Similarity Scanner",
    category: "Navigation",
    description: "Detect duplicate questions and overlap across papers",
    href: "/admin/similarity",
    icon: "similarity",
  },
  {
    id: "nav-import-guide",
    title: "Excel Import Guide",
    category: "Navigation",
    description: "Formatting requirements and column templates for question imports",
    href: "/admin/excel-import-guide",
    icon: "guide",
  },
  {
    id: "nav-reports",
    title: "Question Reports",
    category: "Navigation",
    description: "Review and resolve questions flagged by students",
    href: "/admin/question-reports",
    icon: "reports",
  },
  {
    id: "nav-exams",
    title: "Exam Catalogue",
    category: "Navigation",
    description: "Configure States, Recruiting Boards, Exams, and Papers",
    href: "/admin/exams",
    icon: "categories",
  },
  {
    id: "nav-subjects",
    title: "Subjects & Syllabus",
    category: "Navigation",
    description: "Manage subject taxonomies and section hierarchies",
    href: "/admin/subjects",
    icon: "subjects",
  },
  {
    id: "nav-exam-pages",
    title: "Public Exam Pages",
    category: "Navigation",
    description: "Manage SEO content and FAQs for public landing pages",
    href: "/admin/exam-pages",
    icon: "exams",
  },
  {
    id: "nav-access",
    title: "Exam Series & Access",
    category: "Navigation",
    description: "Manage paid exam series, pricing, and discount referral codes",
    href: "/admin/access",
    icon: "passes",
  },
  {
    id: "nav-students",
    title: "Student Registrations",
    category: "Navigation",
    description: "View registered students, purchase history, and direct emails",
    href: "/admin/students",
    icon: "students",
  },
  {
    id: "nav-results",
    title: "Results & Analytics",
    category: "Navigation",
    description: "Review student test submissions and score performance",
    href: "/admin/results",
    icon: "results",
  },
  {
    id: "nav-surveys",
    title: "Surveys & Feedback",
    category: "Navigation",
    description: "Student onboarding responses and candidate feedback",
    href: "/admin/surveys",
    icon: "surveys",
  },

  // Quick Actions
  {
    id: "act-create-test",
    title: "Create Mock Test",
    category: "Quick Actions",
    description: "Start a new draft mock test series",
    href: "/admin/mock-tests",
    icon: "tests",
  },
  {
    id: "act-add-question",
    title: "Add Single Question",
    category: "Quick Actions",
    description: "Manually compose a bilingual or single-language question",
    href: "/admin/questions#add-one-question",
    icon: "questions",
  },
  {
    id: "act-import-questions",
    title: "Import Excel / CSV",
    category: "Quick Actions",
    description: "Bulk upload up to 500 questions from spreadsheet",
    href: "/admin/questions#import-questions",
    icon: "guide",
  },
  {
    id: "act-student-email",
    title: "Email Students",
    category: "Quick Actions",
    description: "Compose direct announcements to registered candidates",
    href: "/admin/students",
    icon: "students",
  },

  // Tools & External
  {
    id: "tool-student-portal",
    title: "Open Student Portal",
    category: "Tools & Support",
    description: "View the live platform from a student perspective",
    href: "/",
    icon: "portal",
    external: true,
  },
];

function CommandIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    className: "h-4 w-4",
  };

  switch (name) {
    case "overview":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
          <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
          <rect x="13.5" y="11" width="7" height="9.5" rx="1.5" />
          <rect x="3.5" y="14" width="7" height="6.5" rx="1.5" />
        </svg>
      );
    case "tests":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="5" y="4.5" width="14" height="17" rx="2" />
          <path d="M9 4.5V3h6v1.5M9 10h6M9 14h2" />
          <path d="m13.5 17 1.5 1.5 3-3" />
        </svg>
      );
    case "questions":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M9.4 9a2.7 2.7 0 1 1 4.5 2c-1 .7-1.9 1.2-1.9 2.5" />
          <path d="M12 17.5h.01" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "similarity":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="3.5" y="4.5" width="11" height="11" rx="2" />
          <path d="M9.5 9.5h10a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-10A1.5 1.5 0 0 1 8 19" />
          <path d="m7 10 2 2 4-4" />
        </svg>
      );
    case "guide":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M6 3.5h10l3 3V20a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M13 3.5V7h3" />
          <path d="M8 11h8M8 14.5h8M8 18h5" />
        </svg>
      );
    case "reports":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h5M8 16h4" />
          <path d="m15 15 1.5 1.5L19 14" />
        </svg>
      );
    case "categories":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z" />
          <path d="m5.5 11 6.5 3.5 6.5-3.5" />
          <path d="m5.5 15 6.5 3.5 6.5-3.5" />
        </svg>
      );
    case "subjects":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
        </svg>
      );
    case "exams":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M7 3.5h7l3 3V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M14 3.5V7h3" />
          <path d="M9 11h6M9 14.5h6M9 18h4" />
        </svg>
      );
    case "passes":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" />
          <path d="M12 4v16M4 8.5l8 4.5 8-4.5" />
        </svg>
      );
    case "students":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20v-2.5A4.5 4.5 0 0 1 8 13h2a4.5 4.5 0 0 1 4.5 4.5V20" />
          <path d="M15 5.5a3 3 0 0 1 0 5.8M16 14a4.5 4.5 0 0 1 4.5 4.5V20" />
        </svg>
      );
    case "results":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M4 20.5h16" />
          <rect x="6" y="12" width="2.8" height="6" rx=".7" />
          <rect x="10.6" y="8.5" width="2.8" height="9.5" rx=".7" />
          <rect x="15.2" y="4" width="2.8" height="14" rx=".7" />
        </svg>
      );
    case "surveys":
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M9 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2" />
          <rect x="9" y="2" width="6" height="3" rx="1" />
          <path d="m9 12 2 2 4-4" />
          <path d="M9 17h6" />
        </svg>
      );
    case "portal":
    default:
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <path d="M15 3h6v6" />
          <path d="m10 14 11-11" />
        </svg>
      );
  }
}

export function AdminCommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredCommands = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [query]);

  // Handle keyboard shortcuts inside palette
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : Math.max(0, filteredCommands.length - 1)
        );
        return;
      }

      if (e.key === "Enter" && filteredCommands.length > 0) {
        e.preventDefault();
        const selected = filteredCommands[selectedIndex];
        if (selected) {
          onClose();
          if (selected.external) {
            window.open(selected.href, "_blank", "noopener,noreferrer");
          } else {
            router.push(selected.href);
          }
        }
      }
    },
    [filteredCommands, selectedIndex, onClose, router]
  );

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: { category: string; items: { command: CommandItem; index: number }[] }[] = [];

    const categoryOrder: ("Quick Actions" | "Navigation" | "Tools & Support")[] = [
      "Quick Actions",
      "Navigation",
      "Tools & Support",
    ];

    for (const cat of categoryOrder) {
      const matching = filteredCommands
        .map((command, idx) => ({ command, index: idx }))
        .filter((item) => item.command.category === cat);

      if (matching.length > 0) {
        groups.push({ category: cat, items: matching });
      }
    }

    return groups;
  }, [filteredCommands]);

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Admin command palette"
      className="fixed inset-0 z-[120] flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#071f1a]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog box */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-teal-200/90 bg-white shadow-2xl transition-all">
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-teal-100 px-4 py-3.5">
          <svg
            className="h-5 w-5 text-teal-700 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a page, command, or shortcut..."
            className="w-full bg-transparent px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 border-0"
          />
          <kbd className="hidden sm:inline-block rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 [scrollbar-width:thin]">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <p className="text-sm font-bold">No results found for &ldquo;{query}&rdquo;</p>
              <p className="mt-1 text-xs">Try searching for &ldquo;questions&rdquo;, &ldquo;tests&rdquo;, or &ldquo;results&rdquo;.</p>
            </div>
          ) : (
            groupedCommands.map((group) => (
              <div key={group.category} className="mb-2 last:mb-0">
                <p className="px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-teal-800">
                  {group.category}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ command, index }) => {
                    const isSelected = index === selectedIndex;
                    return (
                      <button
                        key={command.id}
                        type="button"
                        onClick={() => {
                          onClose();
                          if (command.external) {
                            window.open(command.href, "_blank", "noopener,noreferrer");
                          } else {
                            router.push(command.href);
                          }
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                          isSelected
                            ? "bg-teal-700 text-white shadow-xs"
                            : "hover:bg-teal-50 text-slate-900"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition ${
                              isSelected
                                ? "bg-white text-teal-800 border-white"
                                : "bg-teal-50 text-teal-800 border-teal-100 group-hover:bg-teal-100"
                            }`}
                          >
                            <CommandIcon name={command.icon} />
                          </span>
                          <div className="min-w-0">
                            <p
                              className={`truncate text-xs sm:text-sm font-bold ${
                                isSelected ? "text-white" : "text-slate-900"
                              }`}
                            >
                              {command.title}
                            </p>
                            <p
                              className={`truncate text-[11px] ${
                                isSelected ? "text-teal-100" : "text-slate-500"
                              }`}
                            >
                              {command.description}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-bold ${
                            isSelected ? "text-white" : "text-slate-400 group-hover:text-teal-700"
                          }`}
                        >
                          {command.external ? "↗" : "↵"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center justify-between border-t border-teal-100 bg-slate-50/70 px-4 py-2.5 text-[11px] font-semibold text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] shadow-2xs">↑</kbd>{" "}
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] shadow-2xs">↓</kbd> navigate
            </span>
            <span>
              <kbd className="rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] shadow-2xs">↵</kbd> select
            </span>
          </div>
          <span>Varadhi Command</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
