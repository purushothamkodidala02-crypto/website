"use client";

import { useState, useEffect, TouchEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookmarkButton } from "@/components/study/BookmarkButton";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { ReportQuestionButton } from "@/components/questions/ReportQuestionButton";

type StudyRow = {
  question_id: string;
  state_name: string;
  exam_name: string;
  paper_name: string;
  subject_name: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation: string | null;
  image_url: string | null;
  mistake_count: number;
  last_selected_answer: string | null;
  last_seen_at: string;
  bookmarked: boolean;
};

export function StudyViewer({ rows, initialIndex, view }: { rows: StudyRow[]; initialIndex: number; view: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Sync state if URL changes externally
  useEffect(() => {
    const item = Number(searchParams.get("item") ?? 1);
    const newIndex = Number.isInteger(item) ? Math.min(Math.max(item - 1, 0), Math.max(rows.length - 1, 0)) : 0;
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [searchParams, rows.length]);

  const handleNavigate = (newIndex: number) => {
    setCurrentIndex(newIndex);
    
    // Update the URL without triggering a server fetch
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", String(newIndex + 1));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      if (target) {
        const tag = target.tagName.toLowerCase();
        if (tag === "textarea" || tag === "select") return;
        if (tag === "input") {
          const type = (target as HTMLInputElement).type?.toLowerCase();
          if (!["radio", "checkbox", "button", "submit", "reset"].includes(type)) return;
        }
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault();
        target?.blur();
        handleNavigate(currentIndex - 1);
      } else if (event.key === "ArrowRight" && currentIndex < rows.length - 1) {
        event.preventDefault();
        target?.blur();
        handleNavigate(currentIndex + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, rows.length]);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance && currentIndex < rows.length - 1) {
      handleNavigate(currentIndex + 1);
    } else if (distance < -minSwipeDistance && currentIndex > 0) {
      handleNavigate(currentIndex - 1);
    }
  };

  const currentRow = rows[currentIndex];

  if (!currentRow) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-4 sm:px-5">
        {currentIndex > 0 ? (
          <button title="Previous question (← Arrow)" onClick={() => handleNavigate(currentIndex - 1)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-teal-300 hover:text-teal-800">← Previous</button>
        ) : (
          <span className="rounded-lg border border-slate-100 px-3 py-2 text-xs font-black text-slate-300">← Previous</span>
        )}
        <p className="text-center text-xs font-black text-slate-700 sm:text-sm">Question {currentIndex + 1} of {rows.length}</p>
        {currentIndex < rows.length - 1 ? (
          <button title="Next question (→ Arrow)" onClick={() => handleNavigate(currentIndex + 1)} className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-black text-white">Next →</button>
        ) : (
          <span className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-slate-400">Next →</span>
        )}
      </div>
      <div 
        className="max-h-[64vh] overflow-y-auto overscroll-contain p-3 sm:max-h-[72vh] sm:p-5"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <StudyQuestionCard key={currentRow.question_id} row={currentRow} index={currentIndex} />
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
        <span className="text-xs font-bold text-slate-500">{rows.length} total</span>
        <Link href={view === "bookmarks" ? "/dashboard/study-book?view=bookmarks" : "/dashboard/study-book"} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:border-teal-300 hover:text-teal-800">Clear search and filters</Link>
      </div>
    </section>
  );
}

function StudyQuestionCard({ row, index }: { row: StudyRow; index: number }) {
  const options = [["A", row.option_a], ["B", row.option_b], ["C", row.option_c], ["D", row.option_d]];
  return (
    <article className="student-card overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-slate-50 px-5 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="break-words text-xs font-black uppercase tracking-wide text-teal-700">{row.state_name} · {row.exam_name} · {row.paper_name} · {row.subject_name}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">Question {index + 1}{row.mistake_count > 0 ? ` · Incorrect ${row.mistake_count} time${row.mistake_count === 1 ? "" : "s"}` : ""}</p>
        </div>
        <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
          <ReportQuestionButton questionId={row.question_id} />
          <BookmarkButton questionId={row.question_id} initialBookmarked={row.bookmarked} />
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <FormattedQuestionText text={row.question_text} className="text-lg leading-8 text-slate-950" />
        {row.image_url && <QuestionMedia src={row.image_url} className="mt-5" />}
        <div className="mt-6 grid gap-3">
          {options.map(([key, label]) => (
            <div key={key} className={`flex gap-3 rounded-xl border p-3.5 text-sm leading-6 ${key === row.correct_answer ? "border-emerald-300 bg-emerald-50 text-emerald-950" : key === row.last_selected_answer ? "border-red-200 bg-red-50 text-red-900" : "border-slate-200 text-slate-700"}`}>
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-black ${key === row.correct_answer ? "bg-emerald-700 text-white" : "bg-slate-100"}`}>{key}</span>
              <span className="pt-1">{label}</span>
            </div>
          ))}
        </div>
        {row.explanation && (
          <div className="mt-5 rounded-2xl border border-teal-100 bg-teal-50 p-5 text-sm leading-7 text-teal-950">
            <p className="text-xs font-black uppercase tracking-wide text-teal-700">Explanation</p>
            <FormattedQuestionText text={row.explanation} className="mt-2" />
          </div>
        )}
      </div>
    </article>
  );
}
