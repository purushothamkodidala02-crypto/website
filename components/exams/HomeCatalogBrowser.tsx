"use client";

import { useMemo, useState, type ReactNode } from "react";

export type HomeExamFilterItem = {
  id: string;
  stateId: string;
  searchText: string;
  node: ReactNode;
};

export type HomeStateTab = {
  id: string;
  name: string;
  code: string;
};

export function HomeCatalogBrowser({
  states,
  items,
}: {
  states: HomeStateTab[];
  items: HomeExamFilterItem[];
}) {
  const [selectedStateId, setSelectedStateId] = useState<string>("all");
  const [filterText, setFilterText] = useState("");

  const filteredItems = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedStateId !== "all" && item.stateId !== selectedStateId) return false;
      if (!q) return true;
      return item.searchText.includes(q);
    });
  }, [items, selectedStateId, filterText]);

  return (
    <div className="mt-3.5 space-y-4">
      {(states.length > 1 || items.length > 4) && (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          {states.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter exams by state">
              <button
                type="button"
                aria-pressed={selectedStateId === "all"}
                onClick={() => setSelectedStateId("all")}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  selectedStateId === "all"
                    ? "bg-teal-800 text-white shadow-2xs"
                    : "border border-slate-200/90 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/60"
                }`}
              >
                All ({items.length})
              </button>
              {states.map((st) => {
                const count = items.filter((e) => e.stateId === st.id).length;
                const active = selectedStateId === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelectedStateId(st.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                      active
                        ? "bg-teal-800 text-white shadow-2xs"
                        : "border border-slate-200/90 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50/60"
                    }`}
                  >
                    {st.name} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {items.length > 4 && (
            <div className="relative w-full sm:w-64">
              <input
                type="search"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                placeholder="Quick filter exams..."
                aria-label="Quick filter exams"
                className="w-full rounded-xl border border-slate-200/90 bg-white px-3 py-1.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
              />
            </div>
          )}
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-display text-base font-bold text-slate-900">No exams match “{filterText}”</p>
          <button
            type="button"
            onClick={() => {
              setSelectedStateId("all");
              setFilterText("");
            }}
            className="mt-3 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-teal-900 transition"
          >
            Show all exams
          </button>
        </div>
      ) : (
        <div className="student-stagger grid gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4">
          {filteredItems.map((item) => item.node)}
        </div>
      )}
    </div>
  );
}
