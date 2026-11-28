"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExamSymbol } from "@/components/exams/CatalogSymbols";

export type ExamSelectionItem = {
  id: string;
  name: string;
  slug: string;
  boardName: string;
  contextLabel: string;
  paperCount: number;
  href: string;
  teluguName?: string;
  description?: string;
};

export function ExamSelectionGrid({
  exams,
  searchPlaceholder = "Filter exams in this state...",
}: {
  exams: ExamSelectionItem[];
  searchPlaceholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [selectedBoard, setSelectedBoard] = useState<string>("all");

  const boards = useMemo(() => {
    const unique = Array.from(new Set(exams.map((item) => item.boardName).filter(Boolean)));
    return unique;
  }, [exams]);

  const filteredExams = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return exams.filter((exam) => {
      if (selectedBoard !== "all" && exam.boardName !== selectedBoard) return false;
      if (!normalized) return true;
      const haystack = `${exam.name} ${exam.teluguName ?? ""} ${exam.boardName} ${exam.description ?? ""}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [exams, query, selectedBoard]);

  const showToolbar = exams.length > 3 || boards.length > 1;

  return (
    <div className="space-y-4">
      {showToolbar && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
          {boards.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by exam board">
              <button
                type="button"
                aria-pressed={selectedBoard === "all"}
                onClick={() => setSelectedBoard("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedBoard === "all"
                    ? "bg-teal-800 text-white shadow-2xs"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-white"
                }`}
              >
                All Boards ({exams.length})
              </button>
              {boards.map((board) => {
                const active = selectedBoard === board;
                return (
                  <button
                    key={board}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedBoard(board)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-teal-800 text-white shadow-2xs"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-teal-300 hover:bg-white"
                    }`}
                  >
                    {board}
                  </button>
                );
              })}
            </div>
          )}

          {exams.length > 3 && (
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              />
            </div>
          )}
        </div>
      )}

      {filteredExams.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-display text-base font-bold text-slate-900">No matching exams</p>
          <p className="mt-1 text-xs text-slate-600">Try clearing the search text or selecting All Boards.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSelectedBoard("all");
            }}
            className="mt-3 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-900"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <ExamCards exams={filteredExams} />
      )}
    </div>
  );
}

function ExamCards({ exams }: { exams: ExamSelectionItem[] }) {
  return (
    <div className="student-stagger grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Link
          key={exam.id}
          href={exam.href}
          prefetch={false}
          className="student-card group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md hover:shadow-slate-900/8 hover:-translate-y-0.5"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-600/0 via-teal-500/35 to-teal-600/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-teal-100/90 bg-teal-50/70 text-teal-900 shadow-2xs transition-all duration-200 group-hover:scale-105 group-hover:border-teal-200 group-hover:bg-teal-100/80">
                <ExamSymbol name={exam.name} />
              </span>
              <span className="max-w-full rounded-full border border-teal-200/80 bg-teal-50/70 px-2.5 py-0.5 text-[11px] font-bold leading-snug text-teal-900 break-words">
                {exam.boardName}
              </span>
            </div>
            <h3 className="font-display mt-3.5 text-lg font-bold leading-snug text-slate-950 group-hover:text-teal-950 transition break-words">
              {exam.name}
            </h3>
            {exam.teluguName && (
              <p lang="te" className="font-telugu mt-1 text-xs font-semibold text-teal-800 break-words">
                {exam.teluguName}
              </p>
            )}
            <p className="mt-1 text-xs leading-relaxed text-slate-500 break-words">{exam.contextLabel}</p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs">
            <span className="font-bold text-slate-600">
              {exam.paperCount} paper{exam.paperCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 font-bold text-teal-800 transition group-hover:text-teal-950 group-hover:translate-x-1">
              Explore papers →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
