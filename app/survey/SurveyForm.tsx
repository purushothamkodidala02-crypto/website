"use client";

import { useState } from "react";
import Link from "next/link";
import { submitDynamicSurvey, type DynamicSurveyData } from "@/app/actions/surveys";

export function SurveyForm({ survey }: { survey: DynamicSurveyData }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [respondentName, setRespondentName] = useState("");
  const [respondentContact, setRespondentContact] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await submitDynamicSurvey(survey.id, answers, {
      name: respondentName,
      contact: respondentContact,
    });

    if (res.error) {
      setErrorMsg(res.error);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm sm:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-200 text-4xl shadow-inner">
          🎉
        </div>
        <h2 className="mt-6 font-display text-3xl font-black text-emerald-950">
          Thank you for your feedback!
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-emerald-800">
          Your responses have been recorded and will help us build the best mock tests for your preparation.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/mock-tests"
            className="rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Explore Mock Tests
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-emerald-300 bg-white px-6 py-3.5 text-sm font-bold text-emerald-900 transition hover:bg-emerald-50"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"
    >
      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {errorMsg}
        </div>
      )}

      <div className="space-y-8">
        {survey.questions.map((q, idx) => (
          <div key={q.id} className="space-y-3">
            <label className="block text-base font-bold text-slate-900">
              {idx + 1}. {q.question_text}
              {q.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {q.question_type === "text" && (
              <input
                type="text"
                required={q.is_required ?? true}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Type your answer here..."
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            )}

            {q.question_type === "textarea" && (
              <textarea
                rows={4}
                required={q.is_required ?? false}
                value={answers[q.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder="Share your thoughts or suggestions..."
                className="block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            )}

            {q.question_type === "radio" && q.options && (
              <div className="space-y-3">
                {q.options.map((option, optIdx) => {
                  const isChecked = answers[q.id] === option;
                  return (
                    <label
                      key={optIdx}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition ${
                        isChecked
                          ? "border-teal-500 bg-teal-50/70 text-teal-950 font-semibold"
                          : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        required={q.is_required ?? true}
                        checked={isChecked}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                        className="h-5 w-5 border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Optional contact info for respondent */}
        <div className="border-t border-slate-100 pt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Contact Information (Optional)
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            If you&apos;d like us to notify you when new tests are released:
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="respondent_name" className="block text-xs font-semibold text-slate-700">
                Your Name
              </label>
              <input
                type="text"
                id="respondent_name"
                value={respondentName}
                onChange={(e) => setRespondentName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label htmlFor="respondent_contact" className="block text-xs font-semibold text-slate-700">
                Phone Number or Email
              </label>
              <input
                type="text"
                id="respondent_contact"
                value={respondentContact}
                onChange={(e) => setRespondentContact(e.target.value)}
                placeholder="Enter your phone or email"
                className="mt-1 block w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-teal-700 px-6 py-4 text-center text-base font-bold text-white shadow-sm transition hover:bg-teal-800 disabled:opacity-70"
        >
          {isSubmitting ? "Submitting Survey..." : "Submit Survey"}
        </button>
      </div>
    </form>
  );
}
