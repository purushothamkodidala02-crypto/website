"use client";

import { useActionState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/site/PublicHeader";
import { submitSurveyToCloudflare } from "./actions";

export default function SurveyPage() {
  const [state, formAction, isPending] = useActionState(submitSurveyToCloudflare, null);

  return (
    <main className="min-h-screen bg-slate-50">
      <PublicHeader />
      
      <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-20">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl tracking-tight text-slate-950 sm:text-4xl">
            Help us improve VaradhiPrep
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            We want to build the exact mock tests you need. Let us know what you are preparing for!
          </p>
        </div>

        {state?.success ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-200 text-3xl">🎉</div>
            <h2 className="mt-6 font-display text-2xl text-emerald-950">Thank you!</h2>
            <p className="mt-2 text-emerald-800">Your feedback has been submitted successfully.</p>
            <Link href="/dashboard" className="mt-6 inline-block rounded-xl bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800">
              Return to Dashboard
            </Link>
          </div>
        ) : (
          <form action={formAction} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
            {state?.error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
                {state.error}
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label htmlFor="exam" className="block text-sm font-bold text-slate-900">
                  1. Which exam are you primarily preparing for?
                </label>
                <input
                  type="text"
                  id="exam"
                  name="exam"
                  required
                  placeholder="e.g. TG TET 2026, APPSC Group 2..."
                  className="mt-3 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <fieldset>
                <legend className="block text-sm font-bold text-slate-900">
                  2. What type of mock tests do you prefer?
                </legend>
                <div className="mt-4 space-y-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input type="radio" name="preference" value="Subject-wise mocks" required className="h-5 w-5 border-slate-300 text-teal-600 focus:ring-teal-600" />
                    <span className="font-semibold text-slate-900">Subject-wise mocks</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input type="radio" name="preference" value="Paper-wise full mocks" required className="h-5 w-5 border-slate-300 text-teal-600 focus:ring-teal-600" />
                    <span className="font-semibold text-slate-900">Paper-wise full mocks</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50 has-[:checked]:border-teal-500 has-[:checked]:bg-teal-50">
                    <input type="radio" name="preference" value="Both" required className="h-5 w-5 border-slate-300 text-teal-600 focus:ring-teal-600" />
                    <span className="font-semibold text-slate-900">I want both</span>
                  </label>
                </div>
              </fieldset>

              <div>
                <label htmlFor="suggestion" className="block text-sm font-bold text-slate-900">
                  3. Any suggestions for VaradhiPrep? (Optional)
                </label>
                <textarea
                  id="suggestion"
                  name="suggestion"
                  rows={4}
                  placeholder="Tell us what features or tests you'd like to see next..."
                  className="mt-3 block w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full rounded-xl bg-teal-700 px-6 py-4 text-center text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-70"
              >
                {isPending ? "Submitting..." : "Submit Survey"}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
