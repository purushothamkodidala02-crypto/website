"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { DeleteSubjectButton } from "./DeleteSubjectButton";
import { bulkDeleteSubjects } from "./deleteAction";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import type { SubjectContentLanguageMode } from "@/types/subject";

type ExistingSubject = {
  id: string;
  paperId: string;
  name: string;
  slug: string;
  contentLanguageMode: SubjectContentLanguageMode;
  isActive: boolean;
  displayOrder: number;
};
type ReturnLocation = { categoryId: string; examId: string; specializationId: string; paperId: string };

const pageSize = 20;

export function ExistingSubjectsTable({
  categoryName,
  examName,
  specializationName,
  paperId,
  paperName,
  returnLocation,
  subjects,
}: {
  categoryName: string | null;
  examName: string | null;
  specializationName: string | null;
  paperId: string;
  paperName: string | null;
  returnLocation: ReturnLocation;
  subjects: ExistingSubject[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, setBulkPending] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return subjects.filter(
      (subject) =>
        subject.paperId === paperId &&
        (!query || `${subject.name} ${subject.slug}`.toLowerCase().includes(query)),
    );
  }, [paperId, search, subjects]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleSubjects = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstEntry = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastEntry = Math.min(currentPage * pageSize, filtered.length);

  const visibleSubjectIds = useMemo(() => visibleSubjects.map((s) => s.id), [visibleSubjects]);
  const allVisibleSelected = visibleSubjectIds.length > 0 && visibleSubjectIds.every((id) => selectedIds.has(id));
  const someVisibleSelected = visibleSubjectIds.some((id) => selectedIds.has(id));
  const selectAllCheckboxRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someVisibleSelected && !allVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        for (const id of visibleSubjectIds) next.delete(id);
      } else {
        for (const id of visibleSubjectIds) next.add(id);
      }
      return next;
    });
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const singleSelectedSubject = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const [id] = Array.from(selectedIds);
    return visibleSubjects.find((s) => s.id === id) ?? subjects.find((s) => s.id === id) ?? null;
  }, [selectedIds, subjects, visibleSubjects]);

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const count = ids.length;
    const promptMsg = `Delete ${count} selected subject${count === 1 ? "" : "s"}? This action cannot be undone.\n\nSubjects containing mock tests or questions will be protected.`;
    if (!window.confirm(promptMsg)) return;

    setBulkPending(true);
    setBulkFeedback(null);
    const result = await bulkDeleteSubjects(ids);
    setBulkPending(false);

    if (result.success) {
      setSelectedIds(new Set());
      setBulkFeedback({ type: "success", text: result.message });
      router.refresh();
    } else {
      setBulkFeedback({ type: "error", text: result.message });
      router.refresh();
    }
  };

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border bg-white">
      <div className="border-b px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-bold">Existing subjects</h2>
          {[categoryName, examName, specializationName, paperName].filter(Boolean).map((name) => (
            <span
              key={name}
              className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800"
            >
              {name}
            </span>
          ))}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          This list follows the category, exam, and paper selected above. Select subjects to edit or delete in bulk.
        </p>
      </div>

      <div className="border-b bg-slate-50 px-6 py-5">
        <label className="block max-w-xl text-sm font-bold">
          Search existing subjects
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              setSelectedIds(new Set());
              setBulkFeedback(null);
            }}
            placeholder="For example: History or General Studies"
            disabled={!paperId}
            className="mt-2 w-full rounded-xl border px-4 py-3 font-normal disabled:cursor-not-allowed disabled:bg-slate-100"
          />
        </label>
      </div>

      {bulkFeedback && (
        <div
          className={`mx-6 mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
            bulkFeedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <p>{bulkFeedback.text}</p>
          <button
            type="button"
            onClick={() => setBulkFeedback(null)}
            className="ml-3 text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="sticky top-4 z-20 mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200 bg-teal-50/95 p-3.5 shadow-lg backdrop-blur sm:mx-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-black text-white">
              {selectedIds.size}
            </span>
            <span className="text-sm font-bold text-teal-950">
              {selectedIds.size} subject{selectedIds.size === 1 ? "" : "s"} selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-xs font-semibold text-teal-800 underline hover:text-teal-950"
            >
              Deselect all
            </button>
            {!allVisibleSelected && visibleSubjects.length > 0 && (
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs font-semibold text-teal-800 underline hover:text-teal-950"
              >
                Select all on this page ({visibleSubjects.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {singleSelectedSubject && (
              <Link
                href={`/admin/subjects/${singleSelectedSubject.id}/edit?fromCategory=${returnLocation.categoryId}&fromExam=${returnLocation.examId}&fromSpecialization=${returnLocation.specializationId}&fromPaper=${returnLocation.paperId}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition"
              >
                <span>✏️</span> Edit subject
              </Link>
            )}
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkPending}
              aria-busy={bulkPending}
              className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              <PendingButtonContent pending={bulkPending} pendingLabel="Deleting…">
                Delete selected ({selectedIds.size})
              </PendingButtonContent>
            </button>
          </div>
        </div>
      )}

      {!paperId ? (
        <p className="p-6 text-sm text-slate-600">
          Choose a Recruiting Board, Exam, and Paper above to see existing Subjects.
        </p>
      ) : filtered.length === 0 ? (
        <p className="p-6 text-sm text-slate-600">
          No subjects match this paper and search.
        </p>
      ) : (
        <>
          <div className="max-h-[48rem] overflow-auto">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-12 px-5 py-3 text-slate-500">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={visibleSubjects.length > 0 && allVisibleSelected}
                        ref={selectAllCheckboxRef}
                        onChange={toggleSelectAll}
                        disabled={visibleSubjects.length === 0}
                        aria-label="Select all visible subjects"
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed"
                      />
                    </div>
                  </th>
                  <th className="px-5 py-3 w-16 text-slate-500">Order</th>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Question language</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {visibleSubjects.map((subject) => {
                  const isSelected = selectedIds.has(subject.id);
                  return (
                    <tr
                      key={subject.id}
                      className={`transition-colors ${
                        isSelected ? "bg-teal-50/60" : "hover:bg-slate-50/50"
                      }`}
                    >
                      <td className="w-12 px-5 py-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(subject.id)}
                            aria-label={`Select subject: ${subject.name}`}
                            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-bold text-slate-500">
                        #{subject.displayOrder}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-bold">{subject.name}</p>
                        <p className="text-xs text-slate-500">{subject.slug}</p>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                        {subject.contentLanguageMode === "bilingual" ? "English + Telugu" : subject.contentLanguageMode === "telugu" ? "Telugu only" : "English only"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${subject.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}
                        >
                          {subject.isActive ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/subjects/${subject.id}/edit?fromCategory=${returnLocation.categoryId}&fromExam=${returnLocation.examId}&fromSpecialization=${returnLocation.specializationId}&fromPaper=${returnLocation.paperId}`}
                            className="rounded-lg px-2.5 py-1.5 text-sm font-bold text-teal-700 hover:bg-teal-50"
                          >
                            Edit
                          </Link>
                          <DeleteSubjectButton
                            subjectId={subject.id}
                            subjectName={subject.name}
                            onDeleted={() => {
                              setSelectedIds((prev) => {
                                const next = new Set(prev);
                                next.delete(subject.id);
                                return next;
                              });
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-slate-50 px-6 py-4 text-sm">
            <p className="text-slate-600">
              Showing {firstEntry}–{lastEntry} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setPage((current) => Math.max(1, current - 1));
                  setSelectedIds(new Set());
                  setBulkFeedback(null);
                }}
                disabled={currentPage === 1}
                className="rounded-lg border bg-white px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 font-semibold text-slate-600">
                Page {currentPage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => {
                  setPage((current) => Math.min(pageCount, current + 1));
                  setSelectedIds(new Set());
                  setBulkFeedback(null);
                }}
                disabled={currentPage === pageCount}
                className="rounded-lg border bg-white px-3 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
