"use client";

import Link from "next/link";
import { ExamSymbol } from "@/components/exams/CatalogSymbols";

export type ExamSelectionItem = {
  id: string;
  name: string;
  slug: string;
  boardName: string;
  contextLabel: string;
  paperCount: number;
  href: string;
};

export function ExamSelectionGrid({ exams }: { exams: ExamSelectionItem[] }) {
  return <ExamCards exams={exams} />;
}

function ExamCards({ exams }: { exams: ExamSelectionItem[] }) {
  return (
    <div className="student-stagger grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Link
          key={exam.id}
          href={exam.href}
          prefetch={false}
          className="student-card group flex min-w-0 flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs transition hover:border-teal-400 hover:shadow-md hover:shadow-slate-900/8 hover:-translate-y-0.5"
        >
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
