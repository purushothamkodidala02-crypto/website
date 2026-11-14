"use client";

import { useState, useEffect, useCallback, TouchEvent } from "react";
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
  content_language_mode: string;
  question_text_te: string | null;
  option_a_te: string | null;
  option_b_te: string | null;
  option_c_te: string | null;
  option_d_te: string | null;
  explanation_te: string | null;
  mistake_count: number;
  last_selected_answer: string | null;
  last_seen_at: string;
  bookmarked: boolean;
};

export function StudyViewer({ rows, initialIndex, view }: { rows: StudyRow[]; initialIndex: number; view: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [language, setLanguage] = useState<"english" | "telugu">(() => {
    return rows[initialIndex]?.content_language_mode === "telugu" ? "telugu" : "english";
  });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Reconcile index at render time when item query parameter changes
  const itemParam = searchParams.get("item");
  const [prevItemParam, setPrevItemParam] = useState(itemParam);
  if (prevItemParam !== itemParam) {
    setPrevItemParam(itemParam);
    const item = Number(itemParam ?? 1);
    const targetIndex = Number.isInteger(item) ? Math.min(Math.max(item - 1, 0), Math.max(rows.length - 1, 0)) : 0;
    if (currentIndex !== targetIndex) {
      setCurrentIndex(targetIndex);
    }
  }

  const handleNavigate = useCallback((newIndex: number) => {
    setCurrentIndex((prev) => (prev !== newIndex ? newIndex : prev));
    
    // Update the URL without triggering a server fetch
    const params = new URLSearchParams(searchParams.toString());
    params.set("item", String(newIndex + 1));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

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
  }, [currentIndex, rows.length, handleNavigate]);

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

  const hasTelugu = Boolean(
    currentRow.question_text_te ||
    currentRow.option_a_te ||
    currentRow.option_b_te ||
    currentRow.option_c_te ||
    currentRow.option_d_te ||
    currentRow.explanation_te
  );
  const isTeluguOnly = currentRow.content_language_mode === "telugu";
  const isEnglishOnly = currentRow.content_language_mode === "english";
  const canSwitchLanguage = hasTelugu && !isTeluguOnly && !isEnglishOnly;

  const effectiveLanguage = isTeluguOnly
    ? "telugu"
    : isEnglishOnly
      ? "english"
      : language;

  const showTelugu = (effectiveLanguage === "telugu" && hasTelugu) || isTeluguOnly;

  return (
    <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-sm w-full max-w-full">
      {/* Top Toolbar: Navigation, Palette Toggle, Language Switch & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-3">
          {currentIndex > 0 ? (
            <button
              type="button"
              title="Previous question (← Arrow)"
              onClick={() => handleNavigate(currentIndex - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-xs transition hover:border-teal-400 hover:bg-teal-50"
            >
              <span aria-hidden="true">←</span>
              <span>Previous</span>
              <kbd className="hidden rounded bg-slate-100 px-1 py-0.5 text-[10px] font-semibold text-slate-500 xl:inline-block">←</kbd>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-black text-slate-300">
              <span aria-hidden="true">←</span>
              <span>Previous</span>
            </span>
          )}

          {currentIndex < rows.length - 1 ? (
            <button
              type="button"
              title="Next question (→ Arrow)"
              onClick={() => handleNavigate(currentIndex + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0a2922] px-3.5 py-2 text-xs font-black text-white shadow-xs transition hover:bg-[#11382f]"
            >
              <span>Next</span>
              <span aria-hidden="true">→</span>
              <kbd className="hidden rounded bg-slate-800 px-1 py-0.5 text-[10px] font-semibold text-slate-300 xl:inline-block">→</kbd>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 rounded-xl bg-slate-200 px-3.5 py-2 text-xs font-black text-slate-400">
              <span>Next</span>
              <span aria-hidden="true">→</span>
            </span>
          )}

          <button
            type="button"
            onClick={() => setPaletteOpen((prev) => !prev)}
            aria-expanded={paletteOpen}
            title="Toggle Question Palette"
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-black transition ${
              paletteOpen
                ? "border-teal-500 bg-teal-50 text-teal-900 ring-2 ring-teal-200"
                : "border-slate-200 bg-white text-slate-700 hover:border-teal-400 hover:bg-slate-50"
            }`}
          >
            <span aria-hidden="true">▦</span>
            <span className="hidden sm:inline">Palette</span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-black text-slate-700">
              {currentIndex + 1}/{rows.length}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-2 pl-1 text-xs font-bold text-slate-600">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / rows.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          {canSwitchLanguage && (
            <div className="inline-flex rounded-xl bg-slate-200/80 p-0.5" role="group" aria-label="Question language">
              <button
                type="button"
                onClick={() => setLanguage("english")}
                aria-pressed={effectiveLanguage === "english"}
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${
                  effectiveLanguage === "english"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("telugu")}
                aria-pressed={effectiveLanguage === "telugu"}
                lang="te"
                className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${
                  effectiveLanguage === "telugu"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                తెలుగు
              </button>
            </div>
          )}
          <ReportQuestionButton questionId={currentRow.question_id} />
          <BookmarkButton questionId={currentRow.question_id} initialBookmarked={currentRow.bookmarked} />
        </div>
      </div>

      {/* Collapsible Interactive Question Palette Drawer */}
      {paletteOpen && (
        <div className="border-b border-slate-200 bg-slate-50/95 p-3 sm:p-4 backdrop-blur-xs transition-all">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-3 font-bold text-slate-600">
              <span className="font-black text-slate-900">Question Palette</span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-[#0a2922] ring-2 ring-emerald-500" /> Current
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-red-700">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Mistake
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-teal-700">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" /> Bookmarked
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPaletteOpen(false)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-950"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1.5 max-h-52 overflow-y-auto overscroll-contain p-1.5 rounded-xl bg-white/70 border border-slate-200/80">
            {rows.map((r, i) => {
              const isCurrent = i === currentIndex;
              const isMistake = r.mistake_count > 0;
              let btnStyle = "border-slate-200 bg-white text-slate-700 hover:border-slate-400";
              if (isCurrent) {
                btnStyle = "border-[#0a2922] bg-[#0a2922] text-white shadow-xs ring-2 ring-emerald-500";
              } else if (isMistake) {
                btnStyle = "border-red-200 bg-red-50 text-red-800 hover:bg-red-100";
              } else {
                btnStyle = "border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100";
              }

              return (
                <button
                  key={r.question_id}
                  type="button"
                  onClick={() => {
                    handleNavigate(i);
                    setPaletteOpen(false);
                  }}
                  className={`flex h-8 items-center justify-center rounded-lg border text-xs font-black transition ${btnStyle}`}
                  title={`Question ${i + 1}: ${r.paper_name} (${isMistake ? `${r.mistake_count} mistake(s)` : "Bookmarked"})`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area: Responsive 2-column on desktop, stacked on mobile */}
      <div 
        className="p-2 sm:p-4 lg:p-5"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <StudyQuestionCard
          key={currentRow.question_id}
          row={currentRow}
          index={currentIndex}
          showTelugu={showTelugu}
          canSwitchLanguage={canSwitchLanguage}
          effectiveLanguage={effectiveLanguage}
          onLanguageChange={setLanguage}
        />
      </div>

      {/* Bottom Bar: Shortcuts hint & filter status */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="font-bold">{rows.length} questions available</span>
          <span className="hidden md:inline text-slate-300">·</span>
          <span className="hidden md:inline font-medium">Use <kbd className="rounded bg-slate-100 px-1 py-0.5 font-semibold text-slate-700">←</kbd> and <kbd className="rounded bg-slate-100 px-1 py-0.5 font-semibold text-slate-700">→</kbd> to navigate</span>
        </div>
        <Link href={view === "bookmarks" ? "/dashboard/study-book?view=bookmarks" : "/dashboard/study-book"} prefetch={true} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-teal-400 hover:text-teal-900">Clear search and filters</Link>
      </div>
    </section>
  );
}

function StudyQuestionCard({
  row,
  index,
  showTelugu,
  canSwitchLanguage,
  effectiveLanguage,
  onLanguageChange,
}: {
  row: StudyRow;
  index: number;
  showTelugu: boolean;
  canSwitchLanguage: boolean;
  effectiveLanguage: "english" | "telugu";
  onLanguageChange: (lang: "english" | "telugu") => void;
}) {
  const questionText = (showTelugu && row.question_text_te) ? row.question_text_te : row.question_text;
  const options = [
    ["A", (showTelugu && row.option_a_te) ? row.option_a_te : row.option_a],
    ["B", (showTelugu && row.option_b_te) ? row.option_b_te : row.option_b],
    ["C", (showTelugu && row.option_c_te) ? row.option_c_te : row.option_c],
    ["D", (showTelugu && row.option_d_te) ? row.option_d_te : row.option_d],
  ] as const;
  const explanation = showTelugu
    ? (row.explanation_te || row.explanation)
    : row.explanation;

  return (
    <article className="student-card overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-sm">
      {/* Context strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs">
          <span className="font-black uppercase tracking-wider text-teal-700">
            {row.state_name} · {row.exam_name}
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="truncate font-semibold text-slate-600">
            {row.paper_name} · {row.subject_name}
          </span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
          {canSwitchLanguage && (
            <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 sm:hidden" role="group" aria-label="Question language">
              <button
                type="button"
                onClick={() => onLanguageChange("english")}
                aria-pressed={effectiveLanguage === "english"}
                className={`rounded-md px-2 py-0.5 text-[11px] font-black transition ${
                  effectiveLanguage === "english"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange("telugu")}
                aria-pressed={effectiveLanguage === "telugu"}
                lang="te"
                className={`rounded-md px-2 py-0.5 text-[11px] font-black transition ${
                  effectiveLanguage === "telugu"
                    ? "bg-white text-slate-950 shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                తెలుగు
              </button>
            </div>
          )}
          {row.mistake_count > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">
              <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              Incorrect {row.mistake_count} time{row.mistake_count === 1 ? "" : "s"}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800">
              Bookmarked
            </span>
          )}
        </div>
      </div>

      {/* 2-Column Grid on Wide Desktop (lg+), Single-Column on Mobile & Split-Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Left Pane: Question text and options */}
        <div className="min-w-0 lg:col-span-7 p-4 sm:p-6 lg:p-7 flex flex-col justify-between lg:max-h-[max(22rem,calc(100dvh-250px))] [@media(max-height:600px)]:max-h-none lg:overflow-y-auto overscroll-contain">
          <div>
            <div className="flex items-start gap-3">
              <span className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-[#0a2922] text-xs font-black text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1" lang={showTelugu ? "te" : "en"}>
                <FormattedQuestionText
                  text={questionText}
                  className={`font-exam text-base sm:text-lg font-medium leading-relaxed text-slate-950 ${showTelugu ? "font-telugu" : ""}`}
                />
              </div>
            </div>

            {row.image_url && (
              <div className="mt-4">
                <QuestionMedia src={row.image_url} />
              </div>
            )}

            {/* Options */}
            <div className="mt-5 space-y-2.5">
              {options.map(([key, label]) => {
                const isCorrect = key === row.correct_answer;
                const isSelected = key === row.last_selected_answer;

                let cardStyle = "border-slate-200 bg-white text-slate-800";
                let badgeStyle = "bg-slate-100 text-slate-700";
                let statusBadge = null;

                if (isCorrect && isSelected) {
                  cardStyle = "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-400";
                  badgeStyle = "bg-emerald-700 text-white";
                  statusBadge = (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-200/80 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-900">
                      {showTelugu ? "✓ మీ సమాధానం · సరైనది" : "✓ Your Answer · Correct"}
                    </span>
                  );
                } else if (isCorrect) {
                  cardStyle = "border-emerald-500 bg-emerald-50/80 text-emerald-950 ring-1 ring-emerald-400";
                  badgeStyle = "bg-emerald-700 text-white";
                  statusBadge = (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-200/80 px-2 py-0.5 text-[11px] font-black uppercase text-emerald-900">
                      {showTelugu ? "✓ సరైన సమాధానం" : "✓ Correct Answer"}
                    </span>
                  );
                } else if (isSelected) {
                  cardStyle = "border-red-400 bg-red-50/90 text-red-950 ring-1 ring-red-300";
                  badgeStyle = "bg-red-700 text-white";
                  statusBadge = (
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-md bg-red-200/80 px-2 py-0.5 text-[11px] font-black uppercase text-red-900">
                      {showTelugu ? "✕ మీ సమాధానం" : "✕ Your Answer"}
                    </span>
                  );
                }

                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 rounded-2xl border p-3 sm:p-3.5 text-sm transition ${cardStyle}`}
                  >
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${badgeStyle}`}>
                      {key}
                    </span>
                    <span className={`min-w-0 flex-1 pt-0.5 text-[15px] sm:text-base leading-relaxed sm:leading-7 tracking-[0.01em] font-medium font-exam ${showTelugu ? "font-telugu" : ""}`} lang={showTelugu ? "te" : "en"}>
                      {label}
                    </span>
                    {statusBadge}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Pane: Explanation & Analysis */}
        <div className="min-w-0 lg:col-span-5 bg-slate-50/40 p-4 sm:p-6 lg:p-7 lg:max-h-[max(22rem,calc(100dvh-250px))] [@media(max-height:600px)]:max-h-none lg:overflow-y-auto overscroll-contain flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-teal-600 text-white text-xs font-black">
                  💡
                </span>
                <h3 className="text-xs font-black uppercase tracking-wider text-teal-900">
                  {showTelugu ? "వివరణ (Explanation)" : "Explanation & Key Concept"}
                </h3>
              </div>
              {row.last_selected_answer && (
                <span className="text-[11px] font-semibold text-slate-500">
                  {showTelugu ? "మీ ఎంపిక: " : "You chose: "}
                  <strong className={row.last_selected_answer === row.correct_answer ? "text-emerald-700" : "text-red-700"}>
                    {showTelugu ? `ఆప్షన్ ${row.last_selected_answer}` : `Option ${row.last_selected_answer}`}
                  </strong>
                </span>
              )}
            </div>

            {explanation ? (
              <div className="rounded-2xl border border-teal-200/70 bg-teal-50/50 p-4 sm:p-5 text-sm leading-relaxed text-slate-900 shadow-2xs" lang={showTelugu ? "te" : "en"}>
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
                    ? "సమస్య ఉంటే లేదా వివరణ కోరడానికి పైన ఉన్న Report బటన్‌ను ఉపయోగించండి."
                    : "Use the Report button in the header if you notice an issue or want to request an explanation."}
                </p>
              </div>
            )}
          </div>

          {/* Quick summary strip */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">
                {showTelugu ? "సరైన సమాధానం:" : "Correct Answer:"}
              </span>
              <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-black text-emerald-800">
                {showTelugu ? `ఆప్షన్ ${row.correct_answer}` : `Option ${row.correct_answer}`}
              </span>
            </div>
            {row.last_seen_at && (
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                <span>{showTelugu ? "చివరి ప్రయత్నం:" : "Last attempted:"}</span>
                <span>{new Date(row.last_seen_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
