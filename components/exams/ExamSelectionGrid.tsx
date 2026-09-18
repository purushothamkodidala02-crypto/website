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
    <div className="student-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => (
        <Link key={exam.id} href={exam.href} className="student-card group flex min-h-56 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:border-teal-300 hover:shadow-xl hover:shadow-slate-950/5">
          <span className="flex items-center justify-between gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-800"><ExamSymbol name={exam.name} /></span><span className="max-w-[62%] truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-slate-600">{exam.boardName}</span></span>
          <h3 className="font-display mt-5 text-xl leading-7 text-slate-950">{exam.name}</h3>
          <p className="mt-2 text-sm text-slate-500">{exam.contextLabel}</p>
          <span className="mt-auto flex items-center justify-between border-t pt-4 text-sm"><span className="font-semibold text-slate-500">{exam.paperCount} paper{exam.paperCount === 1 ? "" : "s"}</span><span className="font-black text-teal-800 transition group-hover:translate-x-1">Open →</span></span>
        </Link>
      ))}
    </div>
  );
}
