"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

type FilterCounts = {
  total: number;
  open: number;
  reviewing: number;
  resolved: number;
  dismissed: number;
  archived?: number;
};

export function QuestionReportsFilterBar({
  counts,
  categoryLabels,
  initialCategory,
  initialStatus,
  initialSearch,
  initialSort,
}: {
  counts: FilterCounts;
  categoryLabels: Record<string, string>;
  initialCategory?: string;
  initialStatus?: string;
  initialSearch?: string;
  initialSort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") ?? initialStatus ?? "";
  const currentCategory = searchParams.get("category") ?? initialCategory ?? "";
  const currentSort = searchParams.get("sort") ?? initialSort ?? "newest";
  const paramSearch = searchParams.get("q") ?? initialSearch ?? "";
  const [prevParamSearch, setPrevParamSearch] = useState(paramSearch);
  const [searchValue, setSearchValue] = useState(paramSearch);

  if (paramSearch !== prevParamSearch) {
    setPrevParamSearch(paramSearch);
    setSearchValue(paramSearch);
  }

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(newParams)) {
      if (value === null || value === "" || (key === "sort" && value === "newest")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchValue.trim() || null });
  };

  const handleClearFilters = () => {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname);
    });
  };

  const hasActiveFilters = Boolean(currentStatus || currentCategory || (searchParams.get("q") ?? "") || currentSort !== "newest");

  const statusTabs = [
    { id: "", label: "All Active", count: counts.total, dot: null },
    { id: "open", label: "Open", count: counts.open, dot: "bg-red-500" },
    { id: "reviewing", label: "Reviewing", count: counts.reviewing, dot: "bg-amber-500" },
    { id: "resolved", label: "Resolved", count: counts.resolved, dot: "bg-emerald-500" },
    { id: "dismissed", label: "Dismissed", count: counts.dismissed, dot: "bg-slate-400" },
    ...(counts.archived !== undefined && counts.archived > 0
      ? [{ id: "archived", label: "Archived >15d", count: counts.archived, dot: "bg-slate-400" }]
      : []),
  ];

  return (
    <div className="mt-7 space-y-4">
      {/* Quick Status Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3">
        {statusTabs.map((tab) => {
          const isActive = currentStatus === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateFilters({ status: tab.id || null })}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-700 hover:bg-slate-100/80 border border-slate-200/80"
              }`}
            >
              {tab.dot && <span className={`h-2 w-2 rounded-full ${tab.dot}`} />}
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Controls */}
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-0">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search question text, student name, email, or notes…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-9 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600"
          />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          {searchValue && (
            <button
              type="button"
              onClick={() => {
                setSearchValue("");
                updateFilters({ q: null });
              }}
              title="Clear search"
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="category-select" className="sr-only">
            Problem Type
          </label>
          <select
            id="category-select"
            value={currentCategory}
            onChange={(e) => updateFilters({ category: e.target.value || null })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
          >
            <option value="">All problem types</option>
            {Object.entries(categoryLabels).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="sort-select" className="sr-only">
            Sort Order
          </label>
          <select
            id="sort-select"
            value={currentSort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:border-teal-600 focus:bg-white focus:outline-hidden"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first (Backlog)</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100"
          >
            Reset
          </button>
        )}
      </div>

      {isPending && (
        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
          <div className="h-2 w-2 animate-ping rounded-full bg-teal-600" />
          <span>Updating reports list…</span>
        </div>
      )}
    </div>
  );
}
