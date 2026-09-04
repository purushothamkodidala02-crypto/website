"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { containsTeluguText, FormattedQuestionText } from "@/components/questions/FormattedQuestionText";
import { QuestionMedia } from "@/components/questions/QuestionMedia";
import { mockTestPreviewHref } from "@/lib/admin/mock-test-navigation";

type Answer = "A" | "B" | "C" | "D";

export type PreviewQuestion = {
  id: string;
  marks: number;
  negativeMarks: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  questionTextTe: string | null;
  optionATe: string | null;
  optionBTe: string | null;
  optionCTe: string | null;
  optionDTe: string | null;
  correctAnswer: Answer;
  explanation: string | null;
  explanationTe: string | null;
  imageUrl: string | null;
  languageMode: "bilingual" | "english" | "telugu";
};

export function StudentPreview({ mockTestId, questions, canEdit, backHref, listReturnTo, initialQuestion }: { mockTestId: string; questions: PreviewQuestion[]; canEdit: boolean; backHref: string; listReturnTo: string; initialQuestion: number }) {
  const [index, setIndex] = useState(() => Math.min(Math.max(initialQuestion - 1, 0), Math.max(questions.length - 1, 0)));
  const [language, setLanguage] = useState<"en" | "te">("en");

  useEffect(() => {
    function navigateWithKeyboard(event: KeyboardEvent) {
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
        setIndex((value) => Math.max(0, value - 1));
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        target?.blur();
        setIndex((value) => Math.min(questions.length - 1, value + 1));
      }
    }
    window.addEventListener("keydown", navigateWithKeyboard);
    return () => window.removeEventListener("keydown", navigateWithKeyboard);
  }, [questions.length]);
  const current = questions[index];
  const previewHref = mockTestPreviewHref(mockTestId, listReturnTo, index + 1);
  const editHref = current ? `/admin/mock-tests/${mockTestId}/questions/${current.id}/edit?returnTo=${encodeURIComponent(previewHref)}` : backHref;
  const options = useMemo(() => {
    if (!current) return [] as Array<readonly [Answer, string]>;
    const useTelugu = current.languageMode === "bilingual" && language === "te";
    return [["A", useTelugu ? current.optionATe ?? current.optionA : current.optionA], ["B", useTelugu ? current.optionBTe ?? current.optionB : current.optionB], ["C", useTelugu ? current.optionCTe ?? current.optionC : current.optionC], ["D", useTelugu ? current.optionDTe ?? current.optionD : current.optionD]] as Array<readonly [Answer, string]>;
  }, [current, language]);

  if (!current) return <section className="mt-8 rounded-3xl border border-dashed bg-white p-8 text-center shadow-sm"><h2 className="text-xl font-black text-slate-950">No questions to preview</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Add or import questions for this mock test, then return here to check the student presentation.</p><Link href={backHref} className="mt-5 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">Manage Questions</Link></section>;

  const bilingual = current.languageMode === "bilingual" && Boolean(current.questionTextTe);
  const useTelugu = bilingual && language === "te";
  const questionText = useTelugu ? current.questionTextTe ?? current.questionText : current.questionText;
  const explanation = useTelugu ? current.explanationTe ?? current.explanation : current.explanation;

  return <div className="mt-7">
    <div className="sticky top-[4.5rem] z-10 rounded-2xl border border-teal-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-700">Student preview</p><p className="mt-1 text-sm font-bold text-slate-950">Question {index + 1} of {questions.length}</p></div><div className="flex flex-wrap gap-2">{canEdit && <Link href={editHref} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">Edit this question</Link>}<Link href={backHref} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50">Manage Questions</Link></div></div></div>

    <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <section className="rounded-3xl border bg-white p-5 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-700">Multiple-choice question</p><p className="mt-1 text-xs font-semibold text-slate-500">{current.marks} mark{current.marks === 1 ? "" : "s"}{current.negativeMarks > 0 ? ` · −${current.negativeMarks} for a wrong answer` : " · No negative marking"}</p></div>{bilingual && <div className="rounded-lg bg-slate-100 p-1 text-xs font-bold"><button type="button" onClick={() => setLanguage("en")} className={`rounded-md px-3 py-1.5 ${language === "en" ? "bg-white shadow-sm" : "text-slate-600"}`}>English</button><button type="button" onClick={() => setLanguage("te")} className={`rounded-md px-3 py-1.5 ${language === "te" ? "bg-white shadow-sm" : "text-slate-600"}`}>తెలుగు</button></div>}</div>
        <FormattedQuestionText text={questionText} className="mt-6 text-lg leading-8" />
        {current.imageUrl && <QuestionMedia src={current.imageUrl} className="mt-6" />}
        <div className="mt-7 grid gap-3">{options.map(([key, text]) => { const correct = key === current.correctAnswer; const teluguOption = containsTeluguText(text); return <div key={key} className={`flex gap-4 rounded-2xl border p-4 ${correct ? "border-emerald-400 bg-emerald-50" : "bg-white"}`}><span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-black ${correct ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`}>{key}</span><span lang={teluguOption ? "te" : undefined} className={`pt-1 text-sm font-medium leading-6 text-slate-800 ${teluguOption ? "font-telugu" : ""}`}>{text}</span>{correct && <span className="ml-auto shrink-0 self-center rounded-full bg-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-950">Correct answer</span>}</div>; })}</div>
        <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5" aria-label="Administrator answer key"><p className="text-xs font-black uppercase tracking-[0.14em] text-teal-800">Administrator answer key</p><p className="mt-2 text-sm font-semibold text-slate-900">Correct answer: Option {current.correctAnswer}</p>{explanation ? <><p className="mt-4 text-sm font-black text-slate-950">Explanation</p><FormattedQuestionText text={explanation} className="mt-1 text-sm leading-6 text-slate-700" /></> : <p className="mt-3 text-sm leading-6 text-slate-600">No explanation has been added for this question.</p>}</section>
        <div className="mt-6 flex justify-between gap-3 border-t pt-5"><button type="button" title="Previous question (← Arrow)" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="rounded-xl border bg-white px-5 py-3 text-sm font-bold disabled:opacity-40">Previous</button><button type="button" title="Next question (→ Arrow)" onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))} disabled={index === questions.length - 1} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Next</button></div>
      </section>
      <aside className="rounded-3xl border bg-white p-5 shadow-sm lg:sticky lg:top-36 lg:self-start"><p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Question navigator</p><p className="mt-2 text-sm leading-6 text-slate-600">Select any question to inspect its student view.</p><div aria-label="Preview question list" className="mt-4 grid max-h-72 grid-cols-[repeat(auto-fill,2.5rem)] justify-start gap-2 overflow-y-auto overscroll-contain pr-1 sm:max-h-80 lg:max-h-[calc(100vh-18rem)]">{questions.map((question, questionIndex) => <button key={question.id} type="button" onClick={() => setIndex(questionIndex)} aria-label={`Preview question ${questionIndex + 1}`} aria-current={questionIndex === index ? "step" : undefined} className={`grid h-10 w-10 place-items-center rounded-lg text-xs font-black ${questionIndex === index ? "bg-slate-950 text-white ring-2 ring-teal-300 ring-offset-2" : "bg-slate-100 text-slate-700 hover:bg-teal-50"}`}>{questionIndex + 1}</button>)}</div><p className="mt-5 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">This is an administrator-only preview. Students cannot see answer keys or explanations before submitting their test.</p></aside>
    </div>
  </div>;
}
