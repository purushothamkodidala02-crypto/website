"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { lookupCandidateAction, type CandidateLookupResult } from "@/app/admin/candidate-lookup-action";

export function AdminQuickCandidateLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CandidateLookupResult[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    setErrorMessage(null);
    startTransition(async () => {
      const res = await lookupCandidateAction(clean);
      if (!res.success) {
        setErrorMessage(res.error ?? "Failed to find candidate.");
        setResults(null);
      } else {
        setResults(res.candidates);
      }
    });
  };

  const handleClear = () => {
    setQuery("");
    setResults(null);
    setErrorMessage(null);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-teal-100 bg-white p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-100/70 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-md bg-teal-50 text-teal-700">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Instant Candidate Lookup
            </h3>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Quickly check student enrollment, phone number, and test attempt progress.
          </p>
        </div>
        <Link
          href="/admin/students"
          className="text-xs font-bold text-teal-700 hover:text-teal-900 transition self-start sm:self-auto"
        >
          All Registrations &rarr;
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter candidate phone number or name..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50/50 pl-10 pr-9 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:bg-white focus:ring-1 focus:ring-teal-100"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700 transition text-xs"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending || !query.trim()}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-800 px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition hover:bg-teal-900 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Searching…</span>
            </>
          ) : (
            <span>Lookup</span>
          )}
        </button>
      </form>

      {errorMessage && (
        <p className="mt-3 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
          {errorMessage}
        </p>
      )}

      {results !== null && (
        <div className="mt-4 space-y-2.5">
          {results.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600">
                No registered students found matching &ldquo;{query}&rdquo;.
              </p>
            </div>
          ) : (
            results.map((candidate) => (
              <div
                key={candidate.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 hover:border-teal-200 hover:shadow-2xs transition"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {candidate.fullName || "Registered Student"}
                    </span>
                    {candidate.phone && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
                        {candidate.phone}
                      </span>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>
                      Attempts:{" "}
                      <strong className="text-slate-900 font-bold">
                        {candidate.totalAttempts}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Passes:{" "}
                      {candidate.activePasses.length > 0 ? (
                        <span className="font-semibold text-emerald-800">
                          {candidate.activePasses.join(", ")}
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">Free Tier / No Active Pass</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/students`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-950 transition"
                  >
                    View in Registrations
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
