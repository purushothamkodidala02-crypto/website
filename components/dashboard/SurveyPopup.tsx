"use client";

import { useState, useEffect } from "react";
import { submitDynamicSurvey } from "@/app/actions/surveys";

export type SurveyQuestion = {
  id: string;
  question_text: string;
  question_type: string; // 'text', 'radio', 'textarea'
  options: string[] | null;
  is_required: boolean;
};

export type ActiveSurvey = {
  id: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
};

export function SurveyPopup({ survey }: { survey: ActiveSurvey | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!survey) return;
    
    // Check if they already completed or dismissed this specific survey
    const storageKey = `survey_completed_${survey.id}`;
    const hasCompleted = localStorage.getItem(storageKey);
    
    if (!hasCompleted) {
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getSession().then(({ data }) => {
          // ONLY show the survey if they are logged in!
          if (data.session?.user) {
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 1500);
            return () => clearTimeout(timer);
          }
        });
      });
    }
  }, [survey]);

  if (!survey || !isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const res = await submitDynamicSurvey(survey.id, answers);
    
    if (res.error) {
      setError(res.error);
      setIsSubmitting(false);
    } else {
      setIsSuccess(true);
      localStorage.setItem(`survey_completed_${survey.id}`, "true");
      setTimeout(() => setIsOpen(false), 3000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Mark as dismissed so we don't annoy them on every single page load
    localStorage.setItem(`survey_completed_${survey.id}`, "dismissed");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="p-6 sm:p-8">
          {isSuccess ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">🎉</div>
              <h2 className="mt-4 text-2xl font-black text-slate-950">Thank you!</h2>
              <p className="mt-2 text-slate-600">Your feedback helps us improve VaradhiPrep.</p>
            </div>
          ) : (
            <>
              <h2 className="pr-8 text-2xl font-black text-slate-950">{survey.title}</h2>
              {survey.description && <p className="mt-2 text-sm text-slate-600">{survey.description}</p>}

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="student-scrollbar max-h-[50vh] space-y-6 overflow-y-auto pr-2">
                  {survey.questions.map((q, idx) => (
                    <div key={q.id}>
                      <label className="block text-sm font-bold text-slate-900">
                        {idx + 1}. {q.question_text} {q.is_required && <span className="text-red-500">*</span>}
                      </label>
                      
                      {q.question_type === 'text' && (
                        <input
                          type="text"
                          required={q.is_required}
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                          className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      )}

                      {q.question_type === 'textarea' && (
                        <textarea
                          required={q.is_required}
                          rows={3}
                          value={answers[q.id] || ""}
                          onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                          className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                        />
                      )}

                      {q.question_type === 'radio' && q.options && (
                        <div className="mt-3 space-y-2">
                          {q.options.map((opt, i) => (
                            <label key={i} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                              <input 
                                type="radio" 
                                name={q.id}
                                value={opt}
                                required={q.is_required}
                                checked={answers[q.id] === opt}
                                onChange={(e) => setAnswers({...answers, [q.id]: e.target.value})}
                                className="h-4 w-4 border-slate-300 text-teal-600 focus:ring-teal-600"
                              />
                              <span className="text-sm font-semibold text-slate-700">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
                >
                  {isSubmitting ? "Submitting..." : "Submit Answers"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
