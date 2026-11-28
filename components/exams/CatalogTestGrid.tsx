"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useStudentPractice } from "@/components/mock-tests/useStudentPractice";

export type CatalogTestFilterItem = {
  id: string;
  isFree: boolean;
  searchText: string;
  node: ReactNode;
};

export function CatalogTestGrid({ items }: { items: CatalogTestFilterItem[] }) {
  const { hasAttempted } = useStudentPractice();
  const [accessFilter, setAccessFilter] = useState<"all" | "free" | "paid">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "todo" | "done">("all");
  const [quickQuery, setQuickQuery] = useState("");

  const hasPaidTests = useMemo(() => items.some((t) => !t.isFree), [items]);
  const hasFreeTests = useMemo(() => items.some((t) => t.isFree), [items]);
  const attemptedCount = useMemo(
    () => items.filter((t) => hasAttempted(t.id)).length,
    [items, hasAttempted],
  );

  const filteredItems = useMemo(() => {
    const q = quickQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (accessFilter === "free" && !item.isFree) return false;
      if (accessFilter === "paid" && item.isFree) return false;
      const done = hasAttempted(item.id);
      if (statusFilter === "todo" && done) return false;
      if (statusFilter === "done" && !done) return false;
      if (!q) return true;
      return item.searchText.includes(q);
    });
  }, [items, accessFilter, statusFilter, quickQuery, hasAttempted]);

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h3 className="font-display text-xl">No matching mock tests</h3>
        <p className="mt-2 text-sm text-slate-600">Try another paper or clear the current search.</p>
      </div>
    );
  }

  const showFilterBar = items.length >= 4 || (hasPaidTests && hasFreeTests) || attemptedCount > 0;

  return (
    <div className="space-y-4">
      {showFilterBar && (
        <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-1 text-xs font-semibold text-slate-600">
              Showing <strong className="font-black text-slate-900">{filteredItems.length}</strong> of{" "}
              {items.length} test{items.length === 1 ? "" : "s"}
            </span>
            {hasPaidTests && hasFreeTests && (
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5" role="group" aria-label="Filter by access type">
                {(
                  [
                    ["all", "All"],
                    ["free", "Free"],
                    ["paid", "Paid"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={accessFilter === val}
                    onClick={() => setAccessFilter(val)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      accessFilter === val
                        ? "bg-white text-slate-950 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {attemptedCount > 0 && (
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5" role="group" aria-label="Filter by completion status">
                {(
                  [
                    ["all", `All (${items.length})`],
                    ["todo", `Not attempted (${items.length - attemptedCount})`],
                    ["done", `Attempted (${attemptedCount})`],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    aria-pressed={statusFilter === val}
                    onClick={() => setStatusFilter(val)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      statusFilter === val
                        ? "bg-teal-800 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {items.length >= 4 && (
            <div className="relative w-full sm:w-64 sm:ml-auto">
              <input
                type="search"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Filter tests on this page..."
                aria-label="Filter tests on this page"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              />
            </div>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <h3 className="font-display text-lg font-bold text-slate-900">No tests match these filters</h3>
          <p className="mt-1 text-xs text-slate-600">Reset your quick filters to view all tests on this page.</p>
          <button
            type="button"
            onClick={() => {
              setAccessFilter("all");
              setStatusFilter("all");
              setQuickQuery("");
            }}
            className="mt-3 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-teal-900"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 min-w-0 max-w-full">
          {filteredItems.map((item) => item.node)}
        </div>
      )}
    </div>
  );
}
