"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { containsTeluguText, FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { pauseAttempt, resumeAttempt, saveAttemptProgress, saveReviewState, submitAttempt, syncAttemptTimer, type SubmitAttemptResult } from "./attempt-actions";
import { BookmarkButton } from "@/components/study/BookmarkButton";
import { ReportQuestionButton } from "@/components/questions/ReportQuestionButton";
import { SubmissionResult } from "./SubmissionResult";

const SubmissionDialog = dynamic(
  () => import("./SubmissionDialog").then((module) => module.SubmissionDialog),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 px-5"><p role="status" className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-xl">Preparing final review…</p></div>,
  },
);

type Answer = "A" | "B" | "C" | "D";
type TestQuestion = {
  question_id: string; question_order: number; marks: number; negative_marks: number;
  question_text: string; option_a: string; option_b: string; option_c: string; option_d: string;
  image_url: string | null; selected_answer: Answer | null; marked_for_review: boolean;
  content_language_mode: "bilingual" | "english" | "telugu";
  question_text_te: string | null; option_a_te: string | null; option_b_te: string | null;
  option_c_te: string | null; option_d_te: string | null;
};
type Props = { mockTestId: string; publicTestPath: string; title: string; sessionId: string; expiresAt: string; questions: TestQuestion[]; bookmarkedQuestionIds: string[] };

function secondsLeft(expiresAt: string) { return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)); }
function displayTime(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return hours ? `${String(hours).padStart(2, "0")}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function StudentTestRunner({ mockTestId, publicTestPath, title, sessionId, expiresAt, questions, bookmarkedQuestionIds }: Props) {
  const [deadline, setDeadline] = useState(expiresAt);
  const [index, setIndex] = useState(() => {
    const lastAnsweredIndex = questions.reduce((last, question, questionIndex) => question.selected_answer ? questionIndex : last, -1);
    return lastAnsweredIndex >= 0 ? Math.min(lastAnsweredIndex + 1, questions.length - 1) : 0;
  });
  const [answers, setAnswers] = useState<Record<string, Answer>>(() => Object.fromEntries(questions.flatMap((item) => item.selected_answer ? [[item.question_id, item.selected_answer]] : [])));
  const [reviewIds, setReviewIds] = useState<Set<string>>(
    () => new Set(questions.filter((item) => item.marked_for_review).map((item) => item.question_id)),
  );
  const [remaining, setRemaining] = useState<number | null>(null);
  const [language, setLanguage] = useState<"en" | "te">("en");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseError, setPauseError] = useState("");
  const [submission, setSubmission] = useState<SubmitAttemptResult | null>(null);
  const saveChains = useRef(new Map<string, Promise<void>>());

  const current = questions[index];
  const answered = useMemo(() => Object.keys(answers).length, [answers]);
  const unanswered = questions.length - answered;
  const locked = remaining === null || remaining === 0 || submitting || pausing || paused;
  const pauseControlDisabled = remaining === null || remaining === 0 || submitting || pausing;

  const queueSave = useCallback((key: string, operation: () => Promise<{ success: boolean }>) => {
    setSaveState("saving");
    const previous = saveChains.current.get(key) ?? Promise.resolve();
    const next = previous
      .then(operation)
      .then((result) => {
        if (!result.success) setSaveState("error");
      })
      .catch(() => setSaveState("error"))
      .then(() => {
        if (saveChains.current.get(key) === next) saveChains.current.delete(key);
        if (saveChains.current.size === 0) {
          setSaveState((current) => current === "error" ? current : "saved");
        }
      });
    saveChains.current.set(key, next);
  }, []);

  const flushSaves = useCallback(async () => {
    await Promise.all([...saveChains.current.values()]);
  }, []);

  const finish = useCallback(async () => {
    if (submitting || submission) return;
    setConfirming(false);
    setSubmitting(true);
    await flushSaves();
    setSubmission(await submitAttempt(sessionId, answers));
    setSubmitting(false);
  }, [answers, flushSaves, sessionId, submission, submitting]);

  useEffect(() => {
    if (submission || paused) return;
    const updateTimer = () => {
      const next = secondsLeft(deadline);
      setRemaining(next);
      if (next === 0 && !submitting) void finish();
    };
    updateTimer();
    const timer = window.setInterval(() => {
      updateTimer();
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, finish, paused, submission, submitting]);

  useEffect(() => {
    if (submission || paused || pausing || submitting) return;
    const sync = async () => {
      const result = await syncAttemptTimer(sessionId);
      if (result.success && typeof result.remaining === "number") {
        setRemaining(result.remaining);
      }
    };
    const timer = window.setInterval(() => void sync(), 30000);
    return () => window.clearInterval(timer);
  }, [paused, pausing, sessionId, submission, submitting]);

  useEffect(() => {
    function navigateWithKeyboard(event: KeyboardEvent) {
      if (locked || confirming) return;
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select, button, a, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setIndex((value) => Math.max(0, value - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setIndex((value) => Math.min(questions.length - 1, value + 1));
      }
    }
    window.addEventListener("keydown", navigateWithKeyboard);
    return () => window.removeEventListener("keydown", navigateWithKeyboard);
  }, [confirming, locked, questions.length]);

  if (submission) return <SubmissionResult publicTestPath={publicTestPath} title={title} result={submission} onRetry={() => setSubmission(null)} />;

  const bilingual = current.content_language_mode === "bilingual" && Boolean(current.question_text_te);
  const telugu = bilingual && language === "te";
  const questionText = telugu ? current.question_text_te ?? current.question_text : current.question_text;
  const options = [
    ["A", telugu ? current.option_a_te ?? current.option_a : current.option_a],
    ["B", telugu ? current.option_b_te ?? current.option_b : current.option_b],
    ["C", telugu ? current.option_c_te ?? current.option_c : current.option_c],
    ["D", telugu ? current.option_d_te ?? current.option_d : current.option_d],
  ] as const;

  function toggleReview() {
    const marked = !reviewIds.has(current.question_id);
    setReviewIds((value) => {
      const next = new Set(value);
      if (marked) next.add(current.question_id); else next.delete(current.question_id);
      return next;
    });
    queueSave(
      `review:${current.question_id}`,
      () => saveReviewState(sessionId, current.question_id, marked),
    );
  }
  function clearAnswer() {
    setSaveState("saving");
    setAnswers((value) => { const next = { ...value }; delete next[current.question_id]; return next; });
    queueSave(
      `answer:${current.question_id}`,
      () => saveAttemptProgress(sessionId, current.question_id, null),
    );
  }
  async function togglePause() {
    if (pauseControlDisabled) return;
    setPauseError("");
    setPausing(true);
    await flushSaves();
    if (paused) {
      const result = await resumeAttempt(mockTestId, sessionId);
      if (result.success && result.expiresAt) {
        setDeadline(result.expiresAt);
        setPaused(false);
      } else {
        setPauseError(result.message);
      }
      setPausing(false);
      return;
    }
    const result = await pauseAttempt(sessionId, answers);
    if (result.success) {
      if (typeof result.remaining === "number") setRemaining(result.remaining);
      setPaused(true);
    } else {
      setPauseError(result.message);
    }
    setPausing(false);
  }

  const navigator = <QuestionNavigator questions={questions} currentIndex={index} answers={answers} reviewIds={reviewIds} locked={locked} onSelect={(next) => { setIndex(next); setNavigatorOpen(false); }} onFinish={() => setConfirming(true)} />;

  return <main className="student-page min-h-screen bg-slate-100 pb-8">
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md text-white shadow-lg">
      <div className="mx-auto w-full max-w-[1600px] px-3 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Box 1: Test Title & Question Indicator */}
          <div className="flex min-w-0 items-center gap-2 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 backdrop-blur-sm shadow-sm">
            <div className="min-w-0">
              <p className="hidden md:block truncate text-[11px] font-semibold text-slate-400 max-w-[200px] xl:max-w-xs" title={title}>
                {title}
              </p>
              <h1 className="whitespace-nowrap text-xs sm:text-sm lg:text-base font-black text-white">
                Question {index + 1}{" "}
                <span className="text-slate-400 font-medium text-[10px] sm:text-xs">of {questions.length}</span>
              </h1>
            </div>
          </div>

          {/* Box 2: Attempted Questions Progress & Stats */}
          <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline text-[11px] font-bold text-slate-300">Attempted:</span>
              <span className="sm:hidden text-[10px] font-bold text-slate-300">Done:</span>
              <strong className="text-xs sm:text-sm font-black text-emerald-400">
                {answered}
              </strong>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">/{questions.length}</span>
              <span className="hidden md:inline rounded bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                {Math.round((answered / questions.length) * 100)}%
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 border-l border-white/10 pl-2.5 sm:pl-3">
              <span className="text-[11px] font-semibold text-slate-400">Review:</span>
              <strong className="text-xs sm:text-sm font-black text-amber-400">{reviewIds.size}</strong>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="text-[11px] font-semibold text-slate-400">Left:</span>
              <strong className="text-xs sm:text-sm font-black text-slate-200">{unanswered}</strong>
            </div>

            <div className="hidden sm:flex items-center border-l border-white/10 pl-2.5 sm:pl-3">
              <span
                className={`text-[10px] font-bold ${
                  saveState === "error" ? "text-rose-300" : saveState === "saving" ? "text-amber-200 animate-pulse" : "text-teal-200"
                }`}
              >
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved ✓"}
              </span>
            </div>
          </div>

          {/* Box 3: Time / Timer Control Box */}
          <div className="flex shrink-0 items-center">
            <PracticeTimerControl
              remaining={remaining}
              paused={paused}
              busy={pausing}
              disabled={pauseControlDisabled}
              onToggle={() => void togglePause()}
            />
          </div>
        </div>
      </div>

      {/* Slim responsive progress bar */}
      <div className="h-1 w-full bg-slate-800/80 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-300 transition-all duration-300"
          style={{ width: `${Math.round((answered / questions.length) * 100)}%` }}
        />
      </div>
    </header>

    <div className="mx-auto w-full max-w-[1600px] px-3 pt-3 sm:px-6 sm:pt-5 lg:px-8 pb-24 lg:pb-8">
      {pauseError && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{pauseError}</p>}
      {paused && <p className="mb-4 rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm font-semibold text-teal-800">Test paused. Your answers and remaining time are saved. Select Resume when you are ready.</p>}
      
      {/* Mobile Navigator Overlay */}
      {navigatorOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/50 backdrop-blur-sm lg:hidden">
          <div className="mt-auto max-h-[85vh] w-full animate-in slide-in-from-bottom-full overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-black text-slate-900">Questions</h2>
              <button type="button" onClick={() => setNavigatorOpen(false)} className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <div className="p-5">{navigator}</div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-5">
          <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8 lg:p-10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">Multiple choice question</p>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {current.marks} mark{Number(current.marks) === 1 ? "" : "s"}
                  {Number(current.negative_marks) > 0 ? ` · −${current.negative_marks} for a wrong answer` : ""}
                </p>
              </div>
              {bilingual && (
                <div className="rounded-xl bg-slate-100 p-1 text-xs font-bold shadow-inner">
                  <button type="button" onClick={() => setLanguage("en")} className={`rounded-lg px-3.5 py-1.5 transition ${language === "en" ? "bg-white shadow-sm font-black text-slate-950" : "text-slate-600 hover:text-slate-900"}`}>English</button>
                  <button type="button" onClick={() => setLanguage("te")} className={`rounded-lg px-3.5 py-1.5 transition ${language === "te" ? "bg-white shadow-sm font-black text-slate-950" : "text-slate-600 hover:text-slate-900"}`}>తెలుగు</button>
                </div>
              )}
            </div>
            <FormattedQuestionText text={questionText} className="mt-6 text-lg sm:text-xl leading-8 sm:leading-9 font-medium text-slate-950" />
            {current.image_url && <QuestionMedia src={current.image_url} className="mt-6" />}
            <div className="mt-7 grid gap-3 sm:gap-3.5">
              {options.map(([key, text]) => {
                const selected = answers[current.question_id] === key;
                const teluguOption = containsTeluguText(text);
                return (
                  <label
                    key={key}
                    className={`flex cursor-pointer gap-4 rounded-2xl border p-4 sm:p-4.5 transition hover:border-teal-400 ${
                      selected ? "border-teal-600 bg-teal-50/70 shadow-sm ring-1 ring-teal-500" : "border-slate-200/90 bg-white hover:bg-slate-50/50"
                    } ${locked ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name={current.question_id}
                      value={key}
                      checked={selected}
                      disabled={locked}
                      onChange={() => {
                        setSaveState("saving");
                        setAnswers((value) => ({ ...value, [current.question_id]: key }));
                        queueSave(`answer:${current.question_id}`, () => saveAttemptProgress(sessionId, current.question_id, key));
                      }}
                    />
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl text-sm font-black transition ${selected ? "bg-teal-700 text-white shadow-sm" : "bg-slate-100 text-slate-700"}`}>
                      {key}
                    </span>
                    <span lang={teluguOption ? "te" : undefined} className={`min-w-0 flex-1 whitespace-pre-line pt-1 text-sm sm:text-base font-medium leading-relaxed text-slate-800 ${teluguOption ? "font-telugu" : ""}`}>
                      {text}
                    </span>
                  </label>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
              <button type="button" onClick={clearAnswer} disabled={!answers[current.question_id] || locked} className="text-sm font-bold text-slate-500 hover:text-red-700 disabled:opacity-40">Clear answer</button>
              <div className="flex flex-wrap gap-2">
                <ReportQuestionButton key={`report-${current.question_id}`} questionId={current.question_id} />
                <BookmarkButton key={current.question_id} questionId={current.question_id} initialBookmarked={bookmarkedQuestionIds.includes(current.question_id)} />
                <button type="button" onClick={toggleReview} disabled={locked} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${reviewIds.has(current.question_id) ? "bg-amber-100 text-amber-900" : "border text-slate-700"}`}>
                  {reviewIds.has(current.question_id) ? "Marked for review" : "Mark for review"}
                </button>
              </div>
            </div>
          </section>
          
          <HorizontalQuestionScroller questions={questions} currentIndex={index} answers={answers} reviewIds={reviewIds} locked={locked} onSelect={(next) => setIndex(next)} />
        </div>
        <aside className="hidden h-[calc(100vh-7rem)] min-h-0 overflow-hidden rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:block">{navigator}</aside>
      </div>
      {remaining === 0 && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Time is up. Your saved answers are being submitted.</p>}
      
      {/* Fixed Bottom Navigation for Mobile / Inline for Desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t bg-white/95 backdrop-blur-md p-3 sm:p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.08)] lg:static lg:mt-6 lg:border-t-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <button type="button" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0 || locked} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40">
          Previous
        </button>
        
        <button type="button" onClick={() => setNavigatorOpen(true)} className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-bold text-teal-900 shadow-sm transition hover:bg-teal-100 lg:hidden">
          Questions ({index + 1}/{questions.length})
        </button>

        {index === questions.length - 1 ? (
          <button type="button" onClick={() => setConfirming(true)} disabled={locked} className="rounded-xl bg-teal-700 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-50">
            Review & finish
          </button>
        ) : (
          <button type="button" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={locked} className="rounded-xl bg-slate-950 px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-bold text-white shadow-sm transition hover:bg-slate-900 disabled:opacity-50">
            Save & next
          </button>
        )}
      </div>
    </div>

    {confirming && <SubmissionDialog answered={answered} review={reviewIds.size} unanswered={unanswered} submitting={submitting} onCancel={() => setConfirming(false)} onSubmit={() => void finish()} questions={questions} answers={answers as any} reviewIds={reviewIds} onGoToQuestion={(idx) => { setIndex(idx); setConfirming(false); }} />}
  </main>;
}

function QuestionNavigator({ questions, currentIndex, answers, reviewIds, locked, onSelect, onFinish }: { questions: TestQuestion[]; currentIndex: number; answers: Record<string, Answer>; reviewIds: Set<string>; locked: boolean; onSelect: (index: number) => void; onFinish: () => void }) {
  const answeredCount = Object.keys(answers).length;
  const remainingCount = questions.length - answeredCount;

  return (
    <div className="flex min-h-0 flex-col lg:h-full">
      <div className="shrink-0 bg-white">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Question navigator</p>
          <p className="whitespace-nowrap text-xs font-black text-slate-700">{questions.length} total</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <NavigatorMetric value={answeredCount} label="Answered" tone="text-emerald-800" />
          <NavigatorMetric value={reviewIds.size} label="Review" tone="text-amber-800" />
          <NavigatorMetric value={remainingCount} label="Remaining" tone="text-slate-700" />
        </div>
      </div>

      <div className="mt-4 max-h-[45vh] min-h-0 overflow-y-auto overscroll-contain pr-1 lg:max-h-none lg:flex-1">
        <div className="grid grid-cols-5 xl:grid-cols-6 gap-2">
          {questions.map((item, index) => {
            const marked = reviewIds.has(item.question_id);
            const answered = Boolean(answers[item.question_id]);
            return (
              <button
                key={item.question_id}
                type="button"
                disabled={locked}
                onClick={() => onSelect(index)}
                className={`flex h-10 w-full items-center justify-center rounded-xl text-xs font-black transition-all ${
                  index === currentIndex
                    ? "bg-slate-950 text-white shadow-md ring-2 ring-teal-300 ring-offset-2 scale-105"
                    : marked
                    ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                    : answered
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 shrink-0 border-t pt-4">
        <div className="space-y-2 text-xs text-slate-600">
          <Legend color="bg-emerald-100" label="Answered" />
          <Legend color="bg-amber-100" label="Marked for review" />
          <Legend color="bg-slate-100" label="Not answered" />
        </div>
        <button type="button" onClick={onFinish} disabled={locked} className="mt-4 w-full rounded-xl border px-4 py-3 text-sm font-bold disabled:opacity-50">
          Finish test
        </button>
      </div>
    </div>
  );
}

function NavigatorMetric({ value, label, tone }: { value: number; label: string; tone: string }) { return <div className="rounded-xl bg-slate-50 px-2 py-2.5 text-center"><strong className={`block text-base font-black ${tone}`}>{value}</strong><span className="mt-0.5 block text-[10px] font-bold text-slate-500">{label}</span></div>; }
function Legend({ color, label }: { color: string; label: string }) { return <span className="flex items-center gap-2"><span className={`h-3 w-3 rounded ${color}`} />{label}</span>; }

function PracticeTimerControl({
  remaining,
  paused,
  busy,
  disabled,
  onToggle,
}: {
  remaining: number | null;
  paused: boolean;
  busy: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const urgent = remaining !== null && remaining <= 300 && !paused;
  return (
    <div
      className={`flex items-center rounded-xl sm:rounded-2xl border p-1 shadow-sm backdrop-blur-sm transition ${
        paused
          ? "border-teal-400/50 bg-teal-400/10"
          : urgent
          ? "border-rose-400/60 bg-rose-500/15 animate-pulse"
          : "border-white/10 bg-white/5"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={paused ? "Resume test timer" : "Pause test timer"}
        title={paused ? "Resume timer" : "Pause timer"}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg sm:rounded-xl p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-black transition disabled:cursor-not-allowed disabled:opacity-50 ${
          paused
            ? "bg-teal-400 text-slate-950 hover:bg-teal-300 shadow-sm"
            : "border border-white/10 bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {busy ? (
          <LoadingSpinner className="h-3.5 w-3.5" />
        ) : paused ? (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
            <path d="M8 5.2v13.6c0 .9 1 1.4 1.7.9l9.1-6.8a1.1 1.1 0 0 0 0-1.8L9.7 4.3A1.1 1.1 0 0 0 8 5.2Z" />
          </svg>
        ) : (
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
            <rect x="6" y="5" width="4.5" height="14" rx="1.2" />
            <rect x="13.5" y="5" width="4.5" height="14" rx="1.2" />
          </svg>
        )}
        <span className="hidden sm:inline">{busy ? (paused ? "Resuming" : "Pausing") : paused ? "Resume" : "Pause"}</span>
      </button>

      <div className="ml-1 sm:ml-1.5 min-w-[4.2rem] sm:min-w-[5.6rem] border-l border-white/10 px-1.5 py-0.5 sm:px-2.5 text-right">
        <span
          className={`block text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] ${
            paused ? "text-teal-300" : urgent ? "text-rose-300 font-black" : "text-slate-400"
          }`}
        >
          {paused ? "Paused" : "Time Left"}
        </span>
        <strong
          className={`block font-mono text-xs sm:text-sm lg:text-base font-black leading-tight tracking-wider ${
            urgent ? "text-rose-300" : "text-white"
          }`}
        >
          {remaining === null ? "--:--" : displayTime(remaining)}
        </strong>
      </div>
    </div>
  );
}

function HorizontalQuestionScroller({ questions, currentIndex, answers, reviewIds, locked, onSelect }: { questions: TestQuestion[]; currentIndex: number; answers: Record<string, Answer>; reviewIds: Set<string>; locked: boolean; onSelect: (index: number) => void }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollLeft = () => { scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" }); };
  const scrollRight = () => { scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" }); };
  
  useEffect(() => {
    if (!scrollRef.current) return;
    const activeButton = scrollRef.current.children[currentIndex] as HTMLElement | undefined;
    if (activeButton) {
       activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [currentIndex]);

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={scrollLeft} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
      </button>
      
      <div ref={scrollRef} className="flex flex-1 snap-x gap-2 overflow-x-auto scroll-smooth py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {questions.map((item, index) => {
            const marked = reviewIds.has(item.question_id);
            const answered = Boolean(answers[item.question_id]);
            return (
              <button
                key={item.question_id}
                type="button"
                disabled={locked}
                onClick={() => onSelect(index)}
                className={`flex h-11 w-11 shrink-0 snap-center items-center justify-center rounded-lg text-xs font-black transition-colors ${index === currentIndex ? "bg-slate-950 text-white shadow-md ring-2 ring-teal-300 ring-offset-2" : marked ? "bg-amber-100 text-amber-900" : answered ? "bg-emerald-100 text-emerald-800" : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
              >
                {index + 1}
              </button>
            );
        })}
      </div>

      <button type="button" onClick={scrollRight} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
