"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { SearchableSelect } from "@/components/admin/SearchableSelect";
import { QuestionImageField } from "@/components/admin/QuestionImageField";
import type { Question, QuestionLifecycle, MockTestQuestionNav } from "@/types/question";
import type { SubjectContentLanguageMode } from "@/types/subject";
import { updateQuestion, type UpdateQuestionState } from "./actions";

type SubjectOption = {
  id: string;
  label: string;
  contentLanguageMode: SubjectContentLanguageMode;
};

const initialState: UpdateQuestionState = { success: false, message: "" };

const QUESTION_NAV_STORAGE_KEY = "varadhi_admin_question_navigator_hidden";

function subscribeQuestionNav(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("question_navigator_toggle", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("question_navigator_toggle", callback);
  };
}

function getQuestionNavSnapshot() {
  try {
    return localStorage.getItem(QUESTION_NAV_STORAGE_KEY) !== "true";
  } catch {
    return true;
  }
}

function getQuestionNavServerSnapshot() {
  return true;
}

export function EditQuestionForm({
  question,
  subjects,
  mockTestId,
  hasAttempts,
  navigation,
  marks,
  negativeMarks,
}: {
  question: Question;
  subjects: SubjectOption[];
  mockTestId?: string;
  hasAttempts?: boolean;
  navigation?: MockTestQuestionNav;
  marks?: number;
  negativeMarks?: number;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const activePaletteItemRef = useRef<HTMLAnchorElement | null>(null);
  const paletteContainerRef = useRef<HTMLDivElement | null>(null);

  const updateQuestionAction = useMemo(
    () => updateQuestion.bind(null, question.id),
    [question.id],
  );

  const [state, action, pending] = useActionState(
    updateQuestionAction,
    initialState,
  );
  const [subjectId, setSubjectId] = useState(question.subject_id);
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer);
  const [lifecycle, setLifecycle] = useState<QuestionLifecycle>(
    question.content_lifecycle,
  );

  const [isDirty, setIsDirty] = useState(false);
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [submitIntent, setSubmitIntent] = useState<"save" | "save_and_next" | "save_and_return">("save");

  const showQuestionNavigator = useSyncExternalStore(
    subscribeQuestionNav,
    getQuestionNavSnapshot,
    getQuestionNavServerSnapshot,
  );

  const toggleQuestionNavigator = useCallback(() => {
    try {
      const isVisible = getQuestionNavSnapshot();
      localStorage.setItem(QUESTION_NAV_STORAGE_KEY, String(isVisible));
      window.dispatchEvent(new Event("question_navigator_toggle"));
    } catch {
      // ignore
    }
  }, []);

  const hasUnsavedChanges = isDirty;

  // Keep active question scrolled into view in palette
  useEffect(() => {
    if (activePaletteItemRef.current && paletteContainerRef.current) {
      activePaletteItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, []);

  // Handle navigation with unsaved changes check
  const confirmNavigation = useCallback(
    (targetHref: string) => {
      if (hasUnsavedChanges) {
        const discard = window.confirm(
          `You have unsaved changes on Question ${navigation ? navigation.currentQuestionNumber : ""}. Discard changes and leave this question?`,
        );
        if (!discard) return false;
      }
      router.push(targetHref);
      return true;
    },
    [hasUnsavedChanges, navigation, router],
  );

  // Prevent accidental tab close or page reload when dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle save success navigation
  useEffect(() => {
    if (state.success) {
      setIsDirty(false);
      if (state.newQuestionId && mockTestId) {
        router.replace(`/admin/mock-tests/${mockTestId}/questions/${state.newQuestionId}/edit`);
        return;
      }
      if (submitIntent === "save_and_next" && navigation?.nextHref) {
        router.push(navigation.nextHref);
      } else if (submitIntent === "save_and_return" && navigation?.backHref) {
        router.push(navigation.backHref);
      }
    }
  }, [state.success, state.newQuestionId, mockTestId, submitIntent, navigation, router]);

  // Keyboard navigation and shortcuts:
  // - Right / Left arrow keys: Navigate to Next / Prev question (when not editing text)
  // - Alt + Right / Left arrow keys: Navigate to Next / Prev question from anywhere
  // - Ctrl+S / Ctrl+Enter: Save Question
  // - Alt+N: Toggle Question Navigator
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        setSubmitIntent("save");
        formRef.current?.requestSubmit();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setSubmitIntent("save");
        formRef.current?.requestSubmit();
        return;
      }
      if (e.altKey && (e.key === "n" || e.key === "N")) {
        e.preventDefault();
        toggleQuestionNavigator();
        return;
      }

      // Alt + Arrow navigation (always works, even when typing)
      if (e.altKey && e.key === "ArrowRight" && navigation?.nextHref) {
        e.preventDefault();
        confirmNavigation(navigation.nextHref);
        return;
      }
      if (e.altKey && e.key === "ArrowLeft" && navigation?.prevHref) {
        e.preventDefault();
        confirmNavigation(navigation.prevHref);
        return;
      }

      // Direct Left / Right arrow buttons on keyboard
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        const target = e.target as HTMLElement | null;
        if (target?.isContentEditable) return;
        if (target) {
          const tag = target.tagName.toLowerCase();
          if (tag === "textarea" || tag === "select") return;
          if (tag === "input") {
            const type = (target as HTMLInputElement).type?.toLowerCase();
            if (!["radio", "checkbox", "button", "submit", "reset"].includes(type)) return;
          }
        }

        if (e.key === "ArrowRight" && navigation?.nextHref) {
          e.preventDefault();
          target?.blur();
          confirmNavigation(navigation.nextHref);
        } else if (e.key === "ArrowLeft" && navigation?.prevHref) {
          e.preventDefault();
          target?.blur();
          confirmNavigation(navigation.prevHref);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigation, confirmNavigation, toggleQuestionNavigator]);

  const languageMode = useMemo(
    () =>
      subjects.find((subject) => subject.id === subjectId)?.contentLanguageMode ??
      "bilingual",
    [subjectId, subjects],
  );

  const showEnglish = languageMode !== "telugu";
  const showTelugu = languageMode !== "english";

  const topNavBar = navigation && (
    <div className="sticky top-16 z-30 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur sm:px-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={navigation.backHref}
          onClick={(e) => {
            const allowed = confirmNavigation(navigation.backHref);
            if (!allowed) e.preventDefault();
          }}
          className="text-xs font-bold text-teal-700 hover:underline sm:text-sm"
        >
          ← Back to {navigation.backLabel}
        </Link>
        <span className="text-slate-300 hidden sm:inline" aria-hidden="true">·</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">
          Question {navigation.currentQuestionNumber} of {navigation.totalCount}
        </span>
        {typeof marks === "number" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 border border-teal-300 px-2.5 py-0.5 text-xs font-bold text-teal-900">
            {marks.toFixed(2)} Mark{marks === 1 ? "" : "s"}{typeof negativeMarks === "number" && negativeMarks > 0 ? ` (-${negativeMarks.toFixed(2)})` : ""}
          </span>
        )}
        {hasUnsavedChanges && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 animate-pulse">
            ● Unsaved edits
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {navigation.prevHref ? (
          <Link
            href={navigation.prevHref}
            onClick={(e) => {
              const allowed = confirmNavigation(navigation.prevHref!);
              if (!allowed) e.preventDefault();
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            ← Prev (Q{navigation.prevQuestionNumber})
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 opacity-60">
            ← Prev
          </span>
        )}

        {navigation.nextHref ? (
          <Link
            href={navigation.nextHref}
            onClick={(e) => {
              const allowed = confirmNavigation(navigation.nextHref!);
              if (!allowed) e.preventDefault();
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            Next (Q{navigation.nextQuestionNumber}) →
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400 opacity-60">
            Next →
          </span>
        )}

        {/* Desktop Toggle Button for Question Navigator */}
        <button
          type="button"
          onClick={toggleQuestionNavigator}
          title={showQuestionNavigator ? "Hide Question Navigator (Alt+N)" : "Show Question Navigator (Alt+N)"}
          className={`hidden lg:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
            showQuestionNavigator
              ? "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
              : "border-teal-300 bg-teal-50 text-teal-800 hover:bg-teal-100 ring-1 ring-teal-200"
          }`}
        >
          <span>{showQuestionNavigator ? "Hide Navigator ✕" : "Show Navigator 🧭"}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowMobilePalette((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100 lg:hidden"
        >
          <span>🔢 Palette ({navigation.totalCount})</span>
          <span>{showMobilePalette ? "▲" : "▼"}</span>
        </button>
      </div>
    </div>
  );

  const mobilePalette = navigation && showMobilePalette && (
    <div className="mb-6 rounded-2xl border border-teal-200 bg-teal-50/70 p-4 shadow-xs lg:hidden">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-wider text-teal-900">
          Jump to question ({navigation.totalCount} total)
        </p>
        <button
          type="button"
          onClick={() => setShowMobilePalette(false)}
          className="text-xs font-bold text-teal-800 underline"
        >
          Close
        </button>
      </div>
      <div className="mt-3 grid max-h-60 grid-cols-[repeat(auto-fill,2.5rem)] gap-1.5 overflow-y-auto overscroll-contain pr-1">
        {navigation.items.map((item) => {
          const isCurrent = item.questionNumber === navigation.currentQuestionNumber;
          return (
            <Link
              key={item.questionId}
              href={item.href}
              onClick={(e) => {
                if (!isCurrent) {
                  const allowed = confirmNavigation(item.href);
                  if (!allowed) e.preventDefault();
                } else {
                  e.preventDefault();
                }
              }}
              className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-black transition ${
                isCurrent
                  ? "bg-slate-950 text-white ring-2 ring-teal-400 ring-offset-2"
                  : item.isActive && item.isScoreValid
                  ? "bg-white text-slate-700 border border-slate-200 hover:bg-teal-50"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}
            >
              {item.questionNumber}
            </Link>
          );
        })}
      </div>
    </div>
  );

  const desktopSidebar = navigation && showQuestionNavigator && (
    <aside className="hidden lg:block lg:w-72 shrink-0">
      <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs text-slate-500">
          <span>Click to jump:</span>
          <button
            type="button"
            onClick={toggleQuestionNavigator}
            title="Hide Navigator (Alt+N)"
            aria-label="Hide Navigator"
            className="grid h-6 w-6 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition text-xs font-black"
          >
            ✕
          </button>
        </div>

        <div
          ref={paletteContainerRef}
          aria-label="Mock test question palette"
          className="mt-3 grid max-h-[calc(100vh-20rem)] grid-cols-5 gap-1.5 overflow-y-auto overscroll-contain pr-1 scroll-smooth"
        >
          {navigation.items.map((item) => {
            const isCurrent = item.questionNumber === navigation.currentQuestionNumber;
            return (
              <Link
                key={item.questionId}
                href={item.href}
                ref={isCurrent ? activePaletteItemRef : undefined}
                onClick={(e) => {
                  if (!isCurrent) {
                    const allowed = confirmNavigation(item.href);
                    if (!allowed) e.preventDefault();
                  } else {
                    e.preventDefault();
                  }
                }}
                title={`Question ${item.questionNumber}: ${item.questionText.slice(0, 70)}`}
                className={`group relative grid h-10 w-10 place-items-center rounded-xl text-xs font-black transition ${
                  isCurrent
                    ? "bg-slate-950 text-white shadow-md ring-2 ring-teal-400 ring-offset-2"
                    : item.isActive && item.isScoreValid
                    ? "bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-900 border border-transparent"
                    : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                }`}
              >
                <span>{item.questionNumber}</span>
                {(!item.isActive || !item.isScoreValid) && !isCurrent && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500" title="Incomplete scoring or inactive" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col gap-2 text-[11px] font-medium text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-950" /> Current
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-slate-100 border" /> Ready
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-200" /> Needs check
            </span>
          </div>
          {navigation.previewHref && (
            <Link
              href={navigation.previewHref}
              onClick={(e) => {
                const allowed = confirmNavigation(navigation.previewHref!);
                if (!allowed) e.preventDefault();
              }}
              className="mt-1 text-center font-bold text-teal-700 hover:underline"
            >
              👁️ Preview Question in Student View
            </Link>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <div className={navigation ? "mt-4" : ""}>
      {topNavBar}
      {mobilePalette}
      <div className={navigation && showQuestionNavigator ? "grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]" : ""}>
        <div className="min-w-0">
          <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-7">
            {typeof marks === "number" && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-teal-50 border border-teal-200 px-3.5 py-1.5 text-xs font-bold text-teal-900">
                <span>🎯 Marking Weightage:</span>
                <span className="font-extrabold">+{marks.toFixed(2)} Mark{marks === 1 ? "" : "s"}</span>
                {typeof negativeMarks === "number" && negativeMarks > 0 && (
                  <span className="text-rose-700">(-{negativeMarks.toFixed(2)} negative)</span>
                )}
              </div>
            )}
            <form
              ref={formRef}
              action={action}
              onChange={() => setIsDirty(true)}
              onInput={() => setIsDirty(true)}
              className="space-y-6"
            >
              <input type="hidden" name="mock_test_id" value={mockTestId ?? ""} />
              <label className="block text-sm font-bold">
                Question classification
                <SearchableSelect
                  name="subject_id"
                  value={subjectId}
                  onChange={(val) => {
                    setSubjectId(val);
                    setIsDirty(true);
                  }}
                  options={subjects.map((subject) => ({
                    value: subject.id,
                    label: subject.label,
                  }))}
                  placeholder="Search for a subject"
                />
              </label>

              <div className="rounded-2xl border border-teal-100 bg-teal-50 px-4 py-3 text-sm text-teal-950">
                <span className="font-black">Question language: </span>
                {languageMode === "bilingual"
                  ? "English + Telugu"
                  : languageMode === "telugu"
                    ? "Telugu only"
                    : "English only"}
              </div>

        <div className={`grid gap-5 ${showEnglish && showTelugu ? "xl:grid-cols-2" : ""}`}>
          {showEnglish && (
            <LanguageFields
              language="English"
              suffix=""
              question={question.question_text}
              options={[question.option_a, question.option_b, question.option_c, question.option_d]}
              explanation={question.explanation ?? ""}
              required={languageMode === "english"}
            />
          )}
          {showTelugu && (
            <LanguageFields
              language="తెలుగు"
              suffix="_te"
              question={question.question_text_te ?? (languageMode === "telugu" ? question.question_text : "")}
              options={[
                question.option_a_te ?? (languageMode === "telugu" ? question.option_a : ""),
                question.option_b_te ?? (languageMode === "telugu" ? question.option_b : ""),
                question.option_c_te ?? (languageMode === "telugu" ? question.option_c : ""),
                question.option_d_te ?? (languageMode === "telugu" ? question.option_d : ""),
              ]}
              explanation={question.explanation_te ?? (languageMode === "telugu" ? question.explanation ?? "" : "")}
              required={languageMode === "telugu"}
              lang="te"
            />
          )}
        </div>

        <QuestionImageField currentUrl={question.image_url} />

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block text-sm font-bold">
            Correct answer
            <SearchableSelect
              name="correct_answer"
              value={correctAnswer}
              onChange={(value) =>
                setCorrectAnswer(value as Question["correct_answer"])
              }
              options={["A", "B", "C", "D"].map((answer) => ({
                value: answer,
                label: `Option ${answer}`,
              }))}
              placeholder="Choose the correct option"
            />
          </label>
          <label className="block text-sm font-bold">
            Question lifetime
            <SearchableSelect
              name="content_lifecycle"
              value={lifecycle}
              onChange={(value) => setLifecycle(value as QuestionLifecycle)}
              options={[
                { value: "permanent", label: "Permanent" },
                { value: "review", label: "Review later" },
                { value: "expires", label: "Expire after a date" },
              ]}
              placeholder="Choose a lifetime setting"
            />
          </label>
        </div>

        {lifecycle === "review" && (
          <label className="block text-sm font-bold">
            Review on
            <input name="review_on" required type="date" defaultValue={question.review_on ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          </label>
        )}
        {lifecycle === "expires" && (
          <label className="block text-sm font-bold">
            Stop using after
            <input name="expires_on" required type="date" defaultValue={question.expires_on ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
          </label>
        )}

        <label className="block text-sm font-bold">
          Source reference
          <input name="source_reference" defaultValue={question.source_reference ?? ""} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" />
        </label>
        <label className="flex items-center gap-3 text-sm font-bold">
          <input name="is_active" type="checkbox" defaultChecked={question.is_active} className="h-4 w-4" />
          Ready to use in mock tests
        </label>
        {hasAttempts && (
          <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-950">
            Student attempts exist for this question. Updates to text, diagram images, or explanations will automatically synchronize to student attempt reviews.
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            onClick={() => setSubmitIntent("save")}
            disabled={pending}
            aria-busy={pending && submitIntent === "save"}
            className="rounded-xl bg-teal-700 px-6 py-3 text-sm font-black text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition"
          >
            <PendingButtonContent pending={pending && submitIntent === "save"} pendingLabel="Saving…">
              Save Question
            </PendingButtonContent>
          </button>
          {navigation?.nextHref && (
            <button
              type="submit"
              onClick={() => setSubmitIntent("save_and_next")}
              disabled={pending}
              aria-busy={pending && submitIntent === "save_and_next"}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <PendingButtonContent pending={pending && submitIntent === "save_and_next"} pendingLabel="Saving…">
                Save &amp; Next (Q{navigation.nextQuestionNumber}) →
              </PendingButtonContent>
            </button>
          )}
          {navigation?.backHref && (
            <button
              type="submit"
              onClick={() => setSubmitIntent("save_and_return")}
              disabled={pending}
              aria-busy={pending && submitIntent === "save_and_return"}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition"
            >
              <PendingButtonContent pending={pending && submitIntent === "save_and_return"} pendingLabel="Saving…">
                Save &amp; Return
              </PendingButtonContent>
            </button>
          )}
        </div>

        {state.message && (
          <p className={`text-sm font-semibold ${state.success ? "text-emerald-700" : "text-red-700"}`}>
            {state.message}
          </p>
        )}
      </form>
    </section>
  </div>
  {desktopSidebar}
</div>
</div>
  );
}

function LanguageFields({
  language,
  suffix,
  question,
  options,
  explanation,
  required,
  lang,
}: {
  language: string;
  suffix: "" | "_te";
  question: string;
  options: string[];
  explanation: string;
  required: boolean;
  lang?: string;
}) {
  return (
    <fieldset lang={lang} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <legend className="px-2 text-sm font-black text-slate-950">{language}</legend>
      <label className="block text-sm font-bold">
        Question
        <textarea name={`question_text${suffix}`} required={required} rows={5} defaultValue={question} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal leading-7" />
      </label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {options.map((value, index) => {
          const letter = String.fromCharCode(65 + index);
          return (
            <label key={letter} className="block text-sm font-bold">
              Option {letter}
              <textarea name={`option_${letter.toLowerCase()}${suffix}`} required={required} rows={2} defaultValue={value} className="mt-2 w-full resize-y rounded-xl border bg-white px-4 py-3 font-normal leading-6" />
            </label>
          );
        })}
      </div>
      <label className="mt-4 block text-sm font-bold">
        Explanation <span className="font-normal text-slate-500">(optional)</span>
        <textarea name={`explanation${suffix}`} rows={3} defaultValue={explanation} className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal leading-6" />
      </label>
    </fieldset>
  );
}
