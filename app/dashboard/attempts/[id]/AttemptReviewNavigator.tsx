"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { BookmarkButton } from "@/components/study/BookmarkButton";
import { ReportQuestionButton } from "@/components/questions/ReportQuestionButton";
import { exitFullscreenSafely } from "@/lib/fullscreen";

export type ReviewRow = {
  question_id: string;
  mock_test_title: string;
  score: number;
  total_marks: number;
  correct_answers: number;
  incorrect_answers: number;
  unanswered_questions: number;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  content_language_mode: "bilingual" | "english" | "telugu";
  question_text_te: string | null;
  option_a_te: string | null;
  option_b_te: string | null;
  option_c_te: string | null;
  option_d_te: string | null;
  selected_answer: string | null;
  correct_answer: string;
  is_correct: boolean;
  marks_awarded: number;
  explanation: string | null;
  explanation_te: string | null;
  image_url: string | null;
};

export function AttemptReviewNavigator({ attemptId, rows, bookmarkedQuestionIds }: { attemptId: string; rows: ReviewRow[]; bookmarkedQuestionIds: string[] }) {
  useEffect(() => {
    void exitFullscreenSafely();
  }, []);

  const [index, setIndex] = useState(0);
  const [language, setLanguage] = useState<"english" | "telugu">(
    rows[0]?.content_language_mode === "telugu" ? "telugu" : "english",
  );
  const questionRef = useRef<HTMLElement>(null);
  const activeNumberRef = useRef<HTMLButtonElement>(null);
  const row = rows[index];
  const hasTelugu = Boolean(row.question_text_te);
  const effectiveLanguage =
    row.content_language_mode === "telugu"
      ? "telugu"
      : row.content_language_mode === "english"
        ? "english"
        : language;
  const showTelugu = effectiveLanguage === "telugu" && hasTelugu;
  const questionText = showTelugu ? row.question_text_te ?? row.question_text : row.question_text;

  const showQuestion = useCallback((nextIndex: number, scrollToCard = true) => {
    const safeIndex = Math.max(0, Math.min(rows.length - 1, nextIndex));
    setIndex(safeIndex);
    if (scrollToCard) {
      requestAnimationFrame(() => questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [rows.length]);

  useEffect(() => {
    activeNumberRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [index]);

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
      if (event.key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        target?.blur();
        showQuestion(index - 1);
      } else if (event.key === "ArrowRight" && index < rows.length - 1) {
        event.preventDefault();
        target?.blur();
        showQuestion(index + 1);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, rows.length, showQuestion]);

  const options = [
    ["A", showTelugu ? row.option_a_te ?? row.option_a : row.option_a],
    ["B", showTelugu ? row.option_b_te ?? row.option_b : row.option_b],
    ["C", showTelugu ? row.option_c_te ?? row.option_c : row.option_c],
    ["D", showTelugu ? row.option_d_te ?? row.option_d : row.option_d],
  ] as const;
  const explanation = showTelugu
    ? row.explanation_te ?? row.explanation
    : row.explanation;

  return (
    <section className="mt-8 sm:mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Detailed review</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Questions and explanations</h2>
          <p className="mt-1.5 text-xs text-slate-600 sm:text-sm">
            Review questions side-by-side with complete explanations. On a laptop, use the <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-bold text-slate-700">←</kbd> and <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-bold text-slate-700">→</kbd> arrow keys.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
          <Legend tone="emerald" label="Correct answer" />
          <Legend tone="red" label="Incorrect selection" />
        </div>
      </div>

      <div className="mt-5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Review question navigator">
          {rows.map((item, questionIndex) => {
            const active = questionIndex === index;
            const tone = item.is_correct
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              : item.selected_answer
                ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                : "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200";
            return (
              <button
                ref={active ? activeNumberRef : undefined}
                key={item.question_order}
                type="button"
                onClick={() => showQuestion(questionIndex)}
                aria-current={active ? "step" : undefined}
                aria-label={`Review question ${item.question_order}`}
                className={`grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-xl border text-xs sm:text-sm font-black transition ${active ? "border-teal-800 bg-teal-800 text-white ring-2 ring-teal-500 ring-offset-2 shadow-sm" : tone}`}
              >
                {item.question_order}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative mt-4 w-full">
        <article
          ref={questionRef}
          className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl w-full"
          aria-live="polite"
        >
          {/* Header strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
                <ReviewArrow direction="previous" disabled={index === 0} onClick={() => showQuestion(index - 1)} className="h-7 w-7" />
                <span className="px-2 text-xs font-black uppercase tracking-wider text-slate-700">
                  Question {row.question_order} of {rows.length}
                </span>
                <ReviewArrow direction="next" disabled={index === rows.length - 1} onClick={() => showQuestion(index + 1)} className="h-7 w-7" />
              </div>
              <QuestionStatus row={row} />
              <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                {row.marks_awarded > 0 ? `+${row.marks_awarded}` : row.marks_awarded} mark{row.marks_awarded === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {hasTelugu && row.content_language_mode === "bilingual" && (
                <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5" role="group" aria-label="Review language">
                  <LanguageButton active={effectiveLanguage === "english"} onClick={() => setLanguage("english")}>English</LanguageButton>
                  <LanguageButton active={effectiveLanguage === "telugu"} onClick={() => setLanguage("telugu")} lang="te">తెలుగు</LanguageButton>
                </div>
              )}
              <ReportQuestionButton key={`report-${row.question_id}`} questionId={row.question_id} attemptId={attemptId} />
              <BookmarkButton key={row.question_id} questionId={row.question_id} initialBookmarked={bookmarkedQuestionIds.includes(row.question_id)} />
            </div>
          </div>

          {/* 2-Column Wide Grid on Wide Desktop (lg+), Single Column on Mobile & Split-Screen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left Pane: Question Text & Options */}
            <div className="min-w-0 lg:col-span-7 p-4 sm:p-6 lg:p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <span className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-teal-800 text-xs sm:text-sm font-black text-white">
                    {row.question_order}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5" lang={showTelugu ? "te" : "en"}>
                    <FormattedQuestionText
                      text={questionText}
                      className={`font-exam text-base sm:text-lg font-medium leading-relaxed sm:leading-8 text-slate-950 ${showTelugu ? "font-telugu" : ""}`}
                    />
                  </div>
                </div>

                {row.image_url && (
                  <div className="mt-4">
                    <QuestionMedia src={row.image_url} className="mb-4 max-h-72 w-auto object-contain" />
                  </div>
                )}

                <div className="mt-5 grid gap-2.5 sm:gap-3">
                  {options.map(([key, label]) => (
                    <OptionRow
                      key={key}
                      optionKey={key}
                      label={label}
                      correct={key === row.correct_answer}
                      selected={key === row.selected_answer}
                      showTelugu={showTelugu}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                <span>
                  {row.selected_answer ? (
                    <span>Your response: Option <strong className="text-slate-900">{row.selected_answer}</strong></span>
                  ) : (
                    <span className="font-bold text-amber-700">Not attempted</span>
                  )}
                </span>
                <span className="hidden xl:inline text-slate-400">
                  Keyboard shortcuts: <kbd className="rounded bg-slate-100 px-1 py-0.5 font-bold text-slate-600">←</kbd> Previous · <kbd className="rounded bg-slate-100 px-1 py-0.5 font-bold text-slate-600">→</kbd> Next
                </span>
              </div>
            </div>

            {/* Right Pane: Complete Explanation & Answer Key Analysis */}
            <div className="min-w-0 lg:col-span-5 bg-slate-50/50 p-4 sm:p-6 lg:p-7 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-700 text-white text-xs font-black shadow-xs">
                      💡
                    </span>
                    <h3 className="text-xs font-black uppercase tracking-wider text-teal-950">
                      {showTelugu ? "సమాధాన వివరణ" : "Answer Explanation"}
                    </h3>
                  </div>
                  {row.selected_answer ? (
                    <span className="text-xs font-semibold text-slate-500">
                      {showTelugu ? "మీ ఎంపిక: " : "Selected: "}
                      <strong className={row.is_correct ? "text-emerald-700" : "text-red-700"}>
                        Option {row.selected_answer}
                      </strong>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">Not attempted</span>
                  )}
                </div>

                {explanation ? (
                  <div
                    lang={showTelugu ? "te" : "en"}
                    className="rounded-2xl border border-teal-200/80 bg-teal-50/70 p-4 sm:p-5 text-sm leading-relaxed text-teal-950 shadow-2xs"
                  >
                    <FormattedQuestionText
                      text={explanation}
                      className={`font-exam text-sm sm:text-base leading-relaxed text-teal-950 ${showTelugu ? "font-telugu" : ""}`}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
                    <p className="text-sm font-semibold text-slate-600">
                      {showTelugu
                        ? "ఈ ప్రశ్నకు వివరణ ఇంకా జోడించబడలేదు."
                        : "No detailed explanation has been added for this question yet."}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {showTelugu
                        ? "సమస్య ఉంటే పైన ఉన్న Report బటన్‌ను ఉపయోగించండి."
                        : "Use the Report button above if you notice an issue or want to request an explanation."}
                    </p>
                  </div>
                )}

                {/* Performance Summary Pill */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 text-xs shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">{showTelugu ? "సరైన సమాధానం:" : "Correct answer:"}</span>
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-black text-emerald-800">
                      {showTelugu ? `ఆప్షన్ ${row.correct_answer}` : `Option ${row.correct_answer}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="font-bold text-slate-600">{showTelugu ? "మీ ఎంపిక:" : "Your selection:"}</span>
                    {row.selected_answer ? (
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${
                        row.is_correct
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                          : "border border-red-300 bg-red-50 text-red-800"
                      }`}>
                        Option {row.selected_answer} {row.is_correct ? "✓" : "✕"}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Not attempted</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                    <span className="font-bold text-slate-600">{showTelugu ? "మార్కులు:" : "Marks awarded:"}</span>
                    <span className={`font-black ${row.marks_awarded > 0 ? "text-emerald-700" : row.marks_awarded < 0 ? "text-red-700" : "text-slate-700"}`}>
                      {row.marks_awarded > 0 ? `+${row.marks_awarded}` : row.marks_awarded}
                    </span>
                  </div>
                </div>
              </div>

              {/* Navigation buttons at bottom of right column */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                <button
                  type="button"
                  onClick={() => showQuestion(index - 1)}
                  disabled={index === 0}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-black text-slate-700 shadow-2xs transition hover:border-teal-400 hover:bg-teal-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span aria-hidden="true">←</span>
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  onClick={() => showQuestion(index + 1)}
                  disabled={index === rows.length - 1}
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-teal-800 px-4 py-2 text-xs font-black text-white shadow-2xs transition hover:bg-teal-900 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

function LanguageButton({ active, onClick, children, lang }: { active: boolean; onClick: () => void; children: React.ReactNode; lang?: string }) {
  return <button type="button" lang={lang} onClick={onClick} aria-pressed={active} className={`rounded-lg px-3 py-1 text-xs font-black transition ${active ? "bg-white text-slate-950 shadow-xs" : "text-slate-600 hover:text-slate-950"}`}>{children}</button>;
}

function QuestionStatus({ row }: { row: ReviewRow }) {
  const detail = row.is_correct ? ["Correct", "bg-emerald-100 text-emerald-800"] : row.selected_answer ? ["Incorrect", "bg-red-100 text-red-800"] : ["Unanswered", "bg-slate-100 text-slate-600"];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${detail[1]}`}>{detail[0]}</span>;
}

function OptionRow({
  optionKey,
  label,
  correct,
  selected,
  showTelugu,
}: {
  optionKey: string;
  label: string;
  correct: boolean;
  selected: boolean;
  showTelugu?: boolean;
}) {
  let style = "border-slate-200 bg-white text-slate-800";
  let badgeStyle = "bg-slate-100 text-slate-600";
  let statusText = "";

  if (correct && selected) {
    style = "border-emerald-400 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-300";
    badgeStyle = "bg-emerald-700 text-white";
    statusText = showTelugu ? "✓ మీ సమాధానం · సరైనది" : "✓ Your answer · Correct";
  } else if (correct) {
    style = "border-emerald-400 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-300";
    badgeStyle = "bg-emerald-700 text-white";
    statusText = showTelugu ? "✓ సరైన సమాధానం" : "✓ Correct answer";
  } else if (selected) {
    style = "border-red-300 bg-red-50 text-red-950 ring-1 ring-red-200";
    badgeStyle = "bg-red-700 text-white";
    statusText = showTelugu ? "✕ మీ సమాధానం" : "✕ Your answer";
  }

  return (
    <div className={`flex flex-wrap items-start gap-3 rounded-xl border p-3 sm:rounded-2xl sm:p-3.5 transition ${style}`}>
      <span className={`grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg text-xs sm:text-sm font-black ${badgeStyle}`}>
        {optionKey}
      </span>
      <span className={`min-w-0 flex-1 pt-0.5 text-[15px] sm:text-base font-medium leading-relaxed sm:leading-7 tracking-[0.01em] font-exam ${showTelugu ? "font-telugu" : ""}`} lang={showTelugu ? "te" : "en"}>
        {label}
      </span>
      {statusText && (
        <span className="w-full pl-10 text-[11px] font-black uppercase tracking-wide sm:ml-auto sm:w-auto sm:shrink-0 sm:pl-0 sm:pt-1">
          {statusText}
        </span>
      )}
    </div>
  );
}

function ReviewArrow({ direction, disabled, onClick, className = "" }: { direction: "previous" | "next"; disabled: boolean; onClick: () => void; className?: string }) {
  const previous = direction === "previous";
  return <button type="button" onClick={onClick} disabled={disabled} aria-label={previous ? "Previous question" : "Next question"} title={previous ? "Previous question (← Arrow)" : "Next question (→ Arrow)"} className={`grid h-11 w-11 place-items-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-lg transition-colors hover:border-teal-400 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-30 ${className}`}><svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 fill-none stroke-current stroke-2 ${previous ? "" : "rotate-180"}`}><path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg></button>;
}

function Legend({ tone, label }: { tone: "emerald" | "red"; label: string }) {
  return <span className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-slate-600 shadow-sm"><span className={`h-2.5 w-2.5 rounded-full ${tone === "emerald" ? "bg-emerald-500" : "bg-red-500"}`} />{label}</span>;
}
