"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { containsTeluguText, FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { LoadingSpinner } from "@/components/feedback/LoadingSpinner";
import { pauseAttempt, resumeAttempt, saveAttemptProgress, saveReviewState, submitAttempt, syncAttemptTimer, verifySubmittedAttempt, type SubmitAttemptResult } from "./attempt-actions";
import { BookmarkButton } from "@/components/study/BookmarkButton";
import { ReportQuestionButton } from "@/components/questions/ReportQuestionButton";
import { SubmissionResult } from "./SubmissionResult";
import { ScreenWatermark } from "@/components/mock-tests/ScreenWatermark";
import {
  exitFullscreenSafely,
  getLastFullscreenStatus,
  isBigScreen,
  isCurrentlyFullscreen,
  isFullscreenSupported,
  subscribeToFullscreenChange,
  toggleFullscreenSafely,
} from "@/lib/fullscreen";

const SubmissionDialog = dynamic(
  () => import("./SubmissionDialog").then((module) => module.SubmissionDialog),
  {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-50 grid place-items-center bg-[#0a2922]/70 px-5"><p role="status" className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-slate-700 shadow-xl">Preparing final review…</p></div>,
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
type Props = {
  mockTestId: string;
  publicTestPath: string;
  title: string;
  sessionId: string;
  expiresAt: string;
  questions: TestQuestion[];
  bookmarkedQuestionIds: string[];
  studentEmail?: string;
};

function secondsLeft(expiresAt: string) { return Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000)); }
function displayTime(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return hours ? `${String(hours).padStart(2, "0")}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}

export function StudentTestRunner({
  mockTestId,
  publicTestPath,
  title,
  sessionId,
  expiresAt,
  questions,
  bookmarkedQuestionIds,
  studentEmail,
}: Props) {
  const router = useRouter();
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
  const [navigatorOpenDesktop, setNavigatorOpenDesktop] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [paused, setPaused] = useState(false);
  const [pauseError, setPauseError] = useState("");
  const [submission, setSubmission] = useState<SubmitAttemptResult | null>(null);
  const isFullscreen = useSyncExternalStore(
    subscribeToFullscreenChange,
    isCurrentlyFullscreen,
    () => false,
  );
  const fullscreenAvailable = useSyncExternalStore(
    () => () => {},
    isFullscreenSupported,
    () => false,
  );
  const isBigDisplay = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    isBigScreen,
    () => false,
  );
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const showFullscreenNotice = !noticeDismissed && !isFullscreen;
  const [fullscreenFeedback, setFullscreenFeedback] = useState("");
  const containerRef = useRef<HTMLElement | null>(null);
  const saveChains = useRef(new Map<string, Promise<void>>());
  const isFinishingRef = useRef(false);
  const hasAutoSubmittedRef = useRef(false);

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
    if (isFinishingRef.current || submitting || submission) return;
    isFinishingRef.current = true;
    setConfirming(false);
    setSubmitting(true);
    void exitFullscreenSafely();
    try {
      await flushSaves();
      const res = await submitAttempt(sessionId, answers);
      router.refresh();
      if (!res.success) {
        console.warn("submitAttempt returned unsuccessful:", res.message);
        const verified = await verifySubmittedAttempt(sessionId);
        if (verified.success && verified.attempt) {
          setSubmission(verified.attempt);
        } else {
          setSubmission(res);
        }
      } else {
        setSubmission(res);
      }
    } catch (err) {
      console.error("Error submitting test attempt:", err);
      try {
        const verified = await verifySubmittedAttempt(sessionId);
        if (verified.success && verified.attempt) {
          setSubmission(verified.attempt);
        } else {
          setSubmission({
            success: false,
            message: "Your answers are saved in your account. Check your result in the dashboard.",
          });
        }
      } catch {
        setSubmission({
          success: false,
          message: "Your answers are saved in your account. Check your result in the dashboard.",
        });
      }
    } finally {
      setSubmitting(false);
      void exitFullscreenSafely();
    }
  }, [answers, flushSaves, router, sessionId, submission, submitting]);

  useEffect(() => {
    if (submission || paused) return;
    const updateTimer = () => {
      const next = secondsLeft(deadline);
      setRemaining(next);
      if (next === 0 && !hasAutoSubmittedRef.current && !isFinishingRef.current && !submitting) {
        hasAutoSubmittedRef.current = true;
        void finish();
      }
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
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        target?.blur();
        setNavigatorOpen(false);
        setIndex((value) => Math.max(0, value - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        target?.blur();
        setNavigatorOpen(false);
        setIndex((value) => Math.min(questions.length - 1, value + 1));
      }
    }
    window.addEventListener("keydown", navigateWithKeyboard);
    return () => window.removeEventListener("keydown", navigateWithKeyboard);
  }, [confirming, locked, questions.length]);

  const handleToggleFullscreen = useCallback(async (event?: React.MouseEvent) => {
    event?.preventDefault();
    setFullscreenFeedback("");
    const success = await toggleFullscreenSafely(containerRef.current);
    const active = isCurrentlyFullscreen();
    if (!success && !active) {
      const status = getLastFullscreenStatus();
      if (status.isBlockedByBrowser) {
        setFullscreenFeedback("Browser permissions blocked automatic full screen. You can press F11 on keyboard or continue in normal / split screen.");
      } else {
        setFullscreenFeedback("Fullscreen could not be enabled in this window. You can press F11 on keyboard or continue in normal screen.");
      }
    } else {
      setFullscreenFeedback("");
    }
  }, []);

  if (submission) {
    return (
      <SubmissionResult
        publicTestPath={publicTestPath}
        title={title}
        result={submission}
      />
    );
  }

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

  const watermarkText = studentEmail ? `Varadhi • ${studentEmail}` : "Varadhi";

  return <main ref={containerRef} className="student-page relative flex h-screen h-[100dvh] max-h-screen max-h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-slate-100">
    <ScreenWatermark text={watermarkText} />
    <header className="shrink-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md text-slate-900 shadow-xs">
      <div className="mx-auto w-full max-w-[1720px] 2xl:max-w-[1850px] px-3 py-2 sm:px-6 sm:py-2.5 lg:px-8">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Box 1: Test Title & Question Indicator */}
          <div className="flex min-w-0 items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 sm:px-3.5 sm:py-2 shadow-xs">
            <div className="min-w-0">
              <p className="hidden md:block truncate text-[11px] font-semibold text-slate-500 max-w-[200px] xl:max-w-xs" title={title}>
                {title}
              </p>
              <h1 className="whitespace-nowrap text-xs sm:text-sm lg:text-base font-black text-slate-950">
                Question {index + 1}{" "}
                <span className="text-slate-500 font-medium text-[10px] sm:text-xs">of {questions.length}</span>
              </h1>
            </div>
          </div>

          {/* Box 2: Attempted Questions Progress & Stats */}
          <div className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline text-[11px] font-bold text-slate-600">Attempted:</span>
              <span className="sm:hidden text-[10px] font-bold text-slate-600">Done:</span>
              <strong className="text-xs sm:text-sm font-black text-emerald-700">
                {answered}
              </strong>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">/{questions.length}</span>
              <span className="hidden md:inline rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                {Math.round((answered / questions.length) * 100)}%
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-2.5 sm:pl-3">
              <span className="text-[11px] font-semibold text-slate-500">Review:</span>
              <strong className="text-xs sm:text-sm font-black text-amber-700">{reviewIds.size}</strong>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-3">
              <span className="text-[11px] font-semibold text-slate-500">Left:</span>
              <strong className="text-xs sm:text-sm font-black text-slate-800">{unanswered}</strong>
            </div>

            <div className="hidden sm:flex items-center border-l border-slate-200 pl-2.5 sm:pl-3">
              <span
                className={`text-[10px] font-bold ${
                  saveState === "error" ? "text-rose-600" : saveState === "saving" ? "text-amber-600 animate-pulse" : "text-teal-700"
                }`}
              >
                {saveState === "saving" ? "Saving…" : saveState === "error" ? "Save failed" : "Saved ✓"}
              </span>
            </div>
          </div>

          {/* Box 3: Controls (Palette Toggle, Fullscreen Toggle & Timer) */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Desktop Palette Toggle */}
            <button
              type="button"
              onClick={() => setNavigatorOpenDesktop((v) => !v)}
              title={navigatorOpenDesktop ? "Hide Question Palette (Expand question width)" : "Show Question Palette"}
              aria-label={navigatorOpenDesktop ? "Hide Question Palette" : "Show Question Palette"}
              className={`hidden lg:flex items-center gap-1.5 rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition shadow-xs ${
                !navigatorOpenDesktop
                  ? "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
              <span>{navigatorOpenDesktop ? "Hide Palette" : "View Palette"}</span>
            </button>

            {fullscreenAvailable && (
              <button
                type="button"
                onClick={handleToggleFullscreen}
                title={
                  isFullscreen
                    ? "Exit full screen (or use normal / split screen)"
                    : "Enter full screen (CBT Exam Mode)"
                }
                aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
                className={`hidden md:flex items-center gap-1.5 rounded-xl sm:rounded-2xl border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-bold transition shadow-xs ${
                  isFullscreen
                    ? "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {isFullscreen ? (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span className="hidden md:inline">Exit full screen</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                    <span className="hidden md:inline">Full screen</span>
                  </>
                )}
              </button>
            )}

            <PracticeTimerControl
              remaining={remaining}
              paused={paused}
              busy={pausing}
              disabled={pauseControlDisabled}
              onToggle={() => void togglePause()}
            />

            <button
              type="button"
              onClick={() => setConfirming(true)}
              disabled={locked}
              className="flex items-center gap-1 rounded-xl sm:rounded-2xl bg-teal-700 hover:bg-teal-800 text-white px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-black shadow-xs transition disabled:opacity-50"
              title="Submit test"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* Slim responsive progress bar */}
      <div className="h-1 w-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 transition-all duration-300"
          style={{ width: `${Math.round((answered / questions.length) * 100)}%` }}
        />
      </div>
    </header>

    {/* Middle Movable / Independently Scrollable Section */}
    <div className="relative flex flex-1 min-h-0 w-full overflow-hidden">
      {/* Scrollable Question Workspace (Independent Scroll) */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-6 sm:py-4 lg:px-8 lg:py-5">
        <div className={`mx-auto w-full transition-all duration-300 ${navigatorOpenDesktop ? "max-w-5xl 2xl:max-w-6xl" : "max-w-6xl 2xl:max-w-7xl"}`}>
          {!isFullscreen && isBigDisplay && showFullscreenNotice && (
            <aside
              aria-label="Exam display mode option"
              className="mb-2.5 sm:mb-3 rounded-xl border border-teal-200/80 bg-teal-50/80 p-2.5 sm:px-3 sm:py-2 text-slate-800 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-lg bg-teal-700 text-white shadow-sm">
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </span>
                  <span>
                    <strong>Exam Hall Mode:</strong> Switch to full screen for a focused test, or keep using normal / split screen.
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleToggleFullscreen}
                    className="rounded-lg bg-teal-700 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
                  >
                    Enter Full Screen
                  </button>
                  <button
                    type="button"
                    onClick={() => setNoticeDismissed(true)}
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                    title="Keep using normal or split screen"
                  >
                    Normal / Split screen ✕
                  </button>
                </div>
              </div>
              {fullscreenFeedback && (
                <p className="mt-1.5 rounded-md bg-amber-100/90 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
                  ℹ️ {fullscreenFeedback}
                </p>
              )}
            </aside>
          )}

          {pauseError && <p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs sm:text-sm font-semibold text-red-700">{pauseError}</p>}
          {paused && <p className="mb-3 rounded-xl border border-teal-200 bg-teal-50 p-2.5 text-xs sm:text-sm font-semibold text-teal-800">Test paused. Your answers and remaining time are saved. Select Resume when you are ready.</p>}

          <section className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 lg:p-6 shadow-sm">
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700">Multiple choice question</p>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {current.marks} mark{Number(current.marks) === 1 ? "" : "s"}
                    {Number(current.negative_marks) > 0 ? ` · −${current.negative_marks} for a wrong answer` : ""}
                  </p>
                </div>
                {bilingual && (
                  <div className="rounded-lg bg-slate-100 p-0.5 text-xs font-bold shadow-inner">
                    <button type="button" onClick={() => setLanguage("en")} className={`rounded-md px-2.5 py-1 transition ${language === "en" ? "bg-white shadow-sm font-black text-slate-950" : "text-slate-600 hover:text-slate-900"}`}>English</button>
                    <button type="button" onClick={() => setLanguage("te")} className={`rounded-md px-2.5 py-1 transition ${language === "te" ? "bg-white shadow-sm font-black text-slate-950" : "text-slate-600 hover:text-slate-900"}`}>తెలుగు</button>
                  </div>
                )}
              </div>
              <FormattedQuestionText text={questionText} className="font-exam mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl font-medium leading-relaxed sm:leading-8 text-slate-950" />
              {current.image_url && <QuestionMedia src={current.image_url} className="mt-3 max-h-48 sm:max-h-56 lg:max-h-64 w-auto object-contain" />}
              <div className="mt-4 sm:mt-5 grid gap-2 sm:gap-2.5">
                {options.map(([key, text]) => {
                  const selected = answers[current.question_id] === key;
                  const teluguOption = containsTeluguText(text);
                  return (
                    <label
                      key={key}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 sm:p-3 transition hover:border-teal-400 ${
                        selected
                          ? "border-teal-600 bg-teal-50/90 shadow-sm ring-1 ring-teal-500"
                          : "border-slate-200/90 bg-white hover:bg-slate-50/70"
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
                      <span className={`grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-lg text-xs sm:text-sm font-bold transition ${selected ? "bg-teal-700 text-white shadow-sm" : "bg-slate-100 text-slate-700"}`}>
                        {key}
                      </span>
                      <span lang={teluguOption ? "te" : undefined} className={`min-w-0 flex-1 whitespace-pre-line text-sm sm:text-base font-normal sm:font-medium leading-normal text-slate-800 font-exam ${teluguOption ? "font-telugu" : ""}`}>
                        {text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 sm:pt-4">
              <button type="button" onClick={clearAnswer} disabled={!answers[current.question_id] || locked} className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-700 disabled:opacity-40">Clear answer</button>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                <ReportQuestionButton key={`report-${current.question_id}`} questionId={current.question_id} mockTestId={mockTestId} />
                <BookmarkButton key={current.question_id} questionId={current.question_id} initialBookmarked={bookmarkedQuestionIds.includes(current.question_id)} />
                <button type="button" onClick={toggleReview} disabled={locked} className={`rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold transition ${reviewIds.has(current.question_id) ? "bg-amber-100 text-amber-900 border border-amber-300" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                  {reviewIds.has(current.question_id) ? "Marked for review" : "Mark for review"}
                </button>
              </div>
            </div>
          </section>

          {/* Mobile/Tablet number scroller (hidden on PC / desktop where right-side Question Navigator is active) */}
          <div className="mt-4 lg:hidden">
            <HorizontalQuestionScroller questions={questions} currentIndex={index} answers={answers} reviewIds={reviewIds} locked={locked} onSelect={(next) => setIndex(next)} />
          </div>

          {remaining === 0 && <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">Time is up. Your saved answers are being submitted.</p>}
        </div>
      </div>

      {/* TCS iON Style Vertical Edge Toggle Button */}
      <div className="hidden lg:flex items-center shrink-0 z-20">
        <button
          type="button"
          onClick={() => setNavigatorOpenDesktop((v) => !v)}
          title={navigatorOpenDesktop ? "Collapse Question Palette (Expand question width)" : "Expand Question Palette"}
          aria-label={navigatorOpenDesktop ? "Collapse Question Palette" : "Expand Question Palette"}
          className="group relative -ml-3 flex h-16 w-6 items-center justify-center rounded-l-lg border border-r-0 border-slate-300 bg-white text-slate-600 shadow-md hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition cursor-pointer"
        >
          <svg
            className={`h-4 w-4 transition-transform duration-200 ${navigatorOpenDesktop ? "" : "rotate-180"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Collapsible Question Navigator Sidebar (Desktop) */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-l border-slate-200/90 bg-white transition-all duration-300 ease-in-out ${
          navigatorOpenDesktop
            ? "w-80 xl:w-88 2xl:w-96 p-4 overflow-y-auto"
            : "w-0 p-0 border-l-0 overflow-hidden"
        }`}
      >
        {navigatorOpenDesktop && (
          <div className="flex h-full min-h-0 flex-col">
            {navigator}
          </div>
        )}
      </aside>
    </div>

    {/* Fixed Bottom Navigation (Lower part) */}
    <footer
      className="shrink-0 z-30 border-t border-slate-200/80 bg-white/95 p-2.5 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] backdrop-blur-md sm:p-3 lg:px-8 lg:py-3"
      style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex w-full max-w-[1720px] 2xl:max-w-[1850px] items-center justify-between gap-2 sm:gap-3">
        <button type="button" title="Previous question (← Arrow)" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0 || locked} className="group flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40 sm:px-4 sm:py-2.5">
          <kbd className="hidden rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-500 shadow-sm transition group-hover:border-slate-300 group-hover:bg-white lg:inline-block">←</kbd>
          Previous
        </button>

        {/* Center: Mobile Sheet Trigger & Desktop Palette Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile trigger */}
          <button type="button" onClick={() => setNavigatorOpen(true)} className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs font-bold text-teal-900 shadow-sm transition hover:bg-teal-100 disabled:opacity-40 sm:px-4 sm:py-2.5 sm:text-sm lg:hidden">
            Questions <span className="font-mono">({index + 1}/{questions.length})</span>
          </button>

          {/* Desktop Palette Toggle Button */}
          <button
            type="button"
            onClick={() => setNavigatorOpenDesktop((v) => !v)}
            className="hidden lg:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition shadow-xs"
            title={navigatorOpenDesktop ? "Hide Question Navigator (Full width question view)" : "Show Question Navigator"}
          >
            <svg className="h-3.5 w-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            <span>{navigatorOpenDesktop ? "Hide Navigator" : "View Navigator"}</span>
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono font-bold text-teal-700 border border-slate-200">
              {index + 1}/{questions.length}
            </span>
          </button>
        </div>

        {index === questions.length - 1 ? (
          <button type="button" onClick={() => setConfirming(true)} disabled={locked} className="rounded-xl bg-teal-700 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-50 sm:px-5 sm:py-2.5">
            Submit test
          </button>
        ) : (
          <button type="button" title="Save & next question (→ Arrow)" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={locked} className="group flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#0a2922] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#11382f] disabled:opacity-50 sm:px-5 sm:py-2.5">
            Save & next
            <kbd className="hidden rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 font-sans text-[10px] font-semibold text-slate-300 shadow-sm transition group-hover:border-slate-600 group-hover:bg-slate-700 lg:inline-block">→</kbd>
          </button>
        )}
      </div>
    </footer>

    {/* Mobile Navigator Overlay */}
    {navigatorOpen && (
      <div className="fixed inset-0 z-50 flex flex-col justify-end bg-[#0a2922]/60 backdrop-blur-sm lg:hidden" onClick={() => setNavigatorOpen(false)}>
        <div
          className="flex flex-col max-h-[88vh] max-h-[88dvh] w-full animate-in slide-in-from-bottom-full overflow-hidden rounded-t-3xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Questions Palette</h2>
              <p className="text-[11px] font-semibold text-slate-500">Tap to jump • Submit test anytime</p>
            </div>
            <button
              type="button"
              onClick={() => setNavigatorOpen(false)}
              className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 transition"
              aria-label="Close questions palette"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
            {navigator}
          </div>
        </div>
      </div>
    )}

    {confirming && <SubmissionDialog answered={answered} review={reviewIds.size} unanswered={unanswered} submitting={submitting} onCancel={() => setConfirming(false)} onSubmit={() => void finish()} questions={questions} answers={answers} reviewIds={reviewIds} onGoToQuestion={(idx) => { setIndex(idx); setConfirming(false); }} />}
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

      <div className="mt-4 max-h-[42vh] lg:max-h-none min-h-0 overflow-y-auto overscroll-contain pr-1 lg:flex-1">
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
                    ? "bg-[#0a2922] text-white shadow-md ring-2 ring-emerald-400 ring-offset-2 scale-105"
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

      <div className="mt-4 shrink-0 border-t border-slate-100 pt-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <Legend color="bg-emerald-100" label="Answered" />
          <Legend color="bg-amber-100" label="Marked for review" />
          <Legend color="bg-slate-100" label="Not answered" />
        </div>
        <button
          type="button"
          onClick={onFinish}
          disabled={locked}
          className="mt-3 w-full rounded-xl bg-teal-700 hover:bg-teal-800 text-white px-4 py-3 text-sm font-black shadow-sm transition disabled:opacity-50"
        >
          Submit / Finish test
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
      className={`flex items-center rounded-xl sm:rounded-2xl border p-1 shadow-xs transition ${
        paused
          ? "border-teal-300 bg-teal-50"
          : urgent
          ? "border-rose-300 bg-rose-50 animate-pulse"
          : "border-slate-200 bg-slate-50/80"
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
            ? "bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-950 shadow-xs"
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

      <div className="ml-1 sm:ml-1.5 min-w-[4.2rem] sm:min-w-[5.6rem] border-l border-slate-200 px-1.5 py-0.5 sm:px-2.5 text-right">
        <span
          className={`block text-[8px] sm:text-[9px] font-black uppercase tracking-[0.14em] ${
            paused ? "text-teal-800 font-bold" : urgent ? "text-rose-600 font-black" : "text-slate-500"
          }`}
        >
          {paused ? "Paused" : "Time Left"}
        </span>
        <strong
          className={`block font-mono text-xs sm:text-sm lg:text-base font-black leading-tight tracking-wider ${
            urgent ? "text-rose-600" : "text-slate-950"
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
                className={`flex h-11 w-11 shrink-0 snap-center items-center justify-center rounded-lg text-xs font-black transition-colors ${index === currentIndex ? "bg-[#0a2922] text-white shadow-md ring-2 ring-emerald-400 ring-offset-2" : marked ? "bg-amber-100 text-amber-900" : answered ? "bg-emerald-100 text-emerald-800" : "border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"}`}
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
