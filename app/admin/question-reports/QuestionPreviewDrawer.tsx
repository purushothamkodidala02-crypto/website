"use client";

import { useState } from "react";
import { FormattedQuestionText } from "@/components/questions/FormattedQuestionText";

export type QuestionPreviewProps = {
  questionId: string;
  reportId: string;
  optionA?: string | null;
  optionB?: string | null;
  optionC?: string | null;
  optionD?: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  imageUrl?: string | null;
  difficulty?: string | null;
  studentAttemptAnswer?: {
    selectedAnswer: string;
    isCorrect: boolean;
  } | null;
};

export function QuestionPreviewDrawer({
  questionId,
  reportId,
  optionA,
  optionB,
  optionC,
  optionD,
  correctAnswer,
  explanation,
  imageUrl,
  difficulty,
  studentAttemptAnswer,
}: QuestionPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedType, setCopiedType] = useState<"qid" | "rid" | null>(null);

  const copyToClipboard = async (text: string, type: "qid" | "rid") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const hasOptions = Boolean(optionA || optionB || optionC || optionD);

  const options = [
    { key: "A", text: optionA },
    { key: "B", text: optionB },
    { key: "C", text: optionC },
    { key: "D", text: optionD },
  ].filter((opt) => opt.text !== null && opt.text !== undefined);

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4 transition">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-teal-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Question content & answers
          </button>

          {difficulty && (
            <span className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
              {difficulty}
            </span>
          )}

          {correctAnswer && (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-2.5 w-2.5 shrink-0 text-emerald-700">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Key: Option {correctAnswer}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 shrink-0">
          <button
            type="button"
            onClick={() => copyToClipboard(questionId, "qid")}
            title="Copy question UUID"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 transition hover:border-slate-300 hover:text-slate-900"
          >
            <span>QID</span>
            <span className="font-mono text-[10px]">{questionId.slice(0, 8)}…</span>
            {copiedType === "qid" ? (
              <span className="font-black text-emerald-700">✓</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 opacity-60">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={() => copyToClipboard(reportId, "rid")}
            title="Copy report UUID"
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 transition hover:border-slate-300 hover:text-slate-900"
          >
            <span>Report</span>
            <span className="font-mono text-[10px]">{reportId.slice(0, 8)}…</span>
            {copiedType === "rid" ? (
              <span className="font-black text-emerald-700">✓</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3 opacity-60">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3.5 space-y-3 pt-2 text-sm min-w-0">
          {imageUrl && (
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attached diagram / image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Question diagram"
                className="mt-2 max-h-56 max-w-full rounded-lg border object-contain shadow-xs"
              />
            </div>
          )}

          {hasOptions && (
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((opt) => {
                const isCorrect = opt.key.toUpperCase() === (correctAnswer ?? "").toUpperCase();
                const isStudentSelected =
                  studentAttemptAnswer?.selectedAnswer.toUpperCase() === opt.key.toUpperCase();

                let cardStyle = "border-slate-200 bg-white text-slate-800";
                if (isCorrect) {
                  cardStyle = "border-emerald-300 bg-emerald-50/70 text-emerald-950 ring-1 ring-emerald-500/20";
                } else if (isStudentSelected && !studentAttemptAnswer?.isCorrect) {
                  cardStyle = "border-rose-300 bg-rose-50/70 text-rose-950 ring-1 ring-rose-500/20";
                }

                return (
                  <div
                    key={opt.key}
                    className={`relative flex items-start gap-2.5 rounded-xl border p-3 text-xs leading-5 transition ${cardStyle}`}
                  >
                    <span
                      className={`inline-grid h-6 w-6 shrink-0 place-items-center rounded-lg font-black text-xs ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : isStudentSelected
                            ? "bg-rose-600 text-white"
                            : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {opt.key}
                    </span>
                    <div className="min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                      <p className="font-medium text-slate-900 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{opt.text}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] uppercase text-emerald-800">
                            ✓ Official key
                          </span>
                        )}
                        {isStudentSelected && (
                          <span
                            className={`rounded-sm px-1.5 py-0.5 text-[10px] font-black uppercase ${
                              studentAttemptAnswer.isCorrect
                                ? "bg-emerald-200 text-emerald-900"
                                : "bg-rose-200 text-rose-900"
                            }`}
                          >
                            Student answered {isStudentSelected && !studentAttemptAnswer.isCorrect ? "(Wrong)" : "(Correct)"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {studentAttemptAnswer && (
            <div className="flex items-start sm:items-center gap-2 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs font-semibold text-blue-950 break-words [overflow-wrap:anywhere]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 text-blue-700 mt-0.5 sm:mt-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span className="break-words">
                In this test attempt, student selected <strong>Option {studentAttemptAnswer.selectedAnswer}</strong>{" "}
                (marked {studentAttemptAnswer.isCorrect ? "Correct" : "Incorrect"}).
              </span>
            </div>
          )}

          {explanation && (
            <div className="rounded-xl border border-slate-200 bg-white p-3 break-words [overflow-wrap:anywhere]">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Explanation in Question Bank</p>
              <div className="mt-1 text-xs leading-relaxed text-slate-700 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                <FormattedQuestionText text={explanation} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
