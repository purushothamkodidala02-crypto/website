"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [board, setBoard] = useState("all");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const searchId = useId();
  const dialogTitleId = useId();
  const boards = [...new Set(exams.map((exam) => exam.boardName))].sort((first, second) => first.localeCompare(second));
  const visibleExams = exams.slice(0, 4);
  const filteredExams = exams.filter((exam) => {
    const searchable = `${exam.name} ${exam.boardName}`.toLowerCase();
    return (board === "all" || exam.boardName === board) && searchable.includes(query.trim().toLowerCase());
  });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <ExamCards exams={visibleExams} />
      {exams.length > 4 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-xl border border-teal-200 bg-teal-50 px-5 py-3 text-sm font-black text-teal-900 transition hover:bg-teal-100"
          >
            View more exams ({exams.length - 4} more) →
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby={dialogTitleId}>
          <button type="button" aria-label="Close exam list" className="absolute inset-0 cursor-default" onClick={() => setIsOpen(false)} />
          <section className="relative flex max-h-[min(48rem,calc(100dvh-2rem))] w-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-[#f4f7f8] shadow-2xl">
            <div className="flex items-start justify-between gap-5 border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-teal-700">Choose an exam</p>
                <h3 id={dialogTitleId} className="font-display mt-1 text-2xl tracking-tight text-slate-950 sm:text-3xl">All available exams</h3>
                <p className="mt-1 text-sm text-slate-600">Search only the exams available on this page.</p>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setIsOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-2xl leading-none text-slate-700 transition hover:bg-slate-200" aria-label="Close exam list">×</button>
            </div>
            <div className="grid gap-3 border-b border-slate-200 bg-white px-5 py-4 sm:grid-cols-[1fr_13rem] sm:px-7">
              <label className="sr-only" htmlFor={searchId}>Search exams</label>
              <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search exams in this list" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
              <label className="sr-only" htmlFor={`${searchId}-board`}>Filter by recruiting board</label>
              <select id={`${searchId}-board`} value={board} onChange={(event) => setBoard(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100">
                <option value="all">All boards</option>
                {boards.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="overflow-y-auto p-5 sm:p-7">
              {filteredExams.length > 0 ? <ExamCards exams={filteredExams} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><p className="font-display text-xl text-slate-950">No exams match your search</p><p className="mt-2 text-sm text-slate-600">Try a different exam name or board.</p></div>}
            </div>
          </section>
        </div>
      )}
    </>
  );
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
