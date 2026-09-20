"use client";

import { useActionState, useState, useTransition } from "react";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import {
  createSubjectSection,
  deleteSubjectSection,
  updateSubjectSection,
  type SectionActionState,
} from "../../sections/actions";
import type { SubjectSection } from "@/types/subject";

const initialState: SectionActionState = { success: false, message: "" };

export function SubjectSectionsManager({
  subjectId,
  subjectName,
  sections,
}: {
  subjectId: string;
  subjectName: string;
  sections: SubjectSection[];
}) {
  const [result, action, pending] = useActionState(
    createSubjectSection,
    initialState,
  );
  const [names, setNames] = useState("");
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleStartEdit = (sec: SubjectSection) => {
    setEditingId(sec.id);
    setEditingName(sec.name);
    setEditError(null);
  };

  const handleSaveEdit = (sectionId: string) => {
    if (!editingName.trim()) return;
    setEditPending(true);
    setEditError(null);
    startTransition(async () => {
      const res = await updateSubjectSection(sectionId, subjectId, editingName.trim());
      setEditPending(false);
      if (res.success) {
        setEditingId(null);
        setEditingName("");
      } else {
        setEditError(res.message);
      }
    });
  };

  const handleDelete = (sectionId: string, sectionName: string) => {
    if (!window.confirm(`Delete sub-section "${sectionName}"?`)) return;
    setDeletePendingId(sectionId);
    setDeleteError(null);
    startTransition(async () => {
      const res = await deleteSubjectSection(sectionId, subjectId);
      setDeletePendingId(null);
      if (!res.success) {
        setDeleteError(res.message);
      }
    });
  };

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm">
      <div className="border-b bg-gradient-to-r from-slate-950 to-teal-950 px-6 py-5 text-white sm:px-7">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-teal-200">
          Sub-sections / Months
        </p>
        <h2 className="font-display mt-1 text-xl font-bold">
          Sub-sections for {subjectName}
        </h2>
        <p className="mt-1 text-xs text-slate-300">
          Organize {subjectName} into months or topics (e.g. &ldquo;June&rdquo;, &ldquo;July&rdquo;). Students see month cards on the subject page and take tests inside them.
        </p>
      </div>

      <div className="p-6 sm:p-7">
        {/* Existing Sections List */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-slate-800">
            Current Sub-sections ({sections.length})
          </h3>
          {sections.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500 italic">
              No sub-sections added yet. All mock tests for this subject will appear directly as common mock tests.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2.5">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-3.5 py-2 text-xs"
                >
                  {editingId === sec.id ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSaveEdit(sec.id);
                          } else if (e.key === "Escape") {
                            setEditingId(null);
                          }
                        }}
                        className="rounded border bg-white px-2 py-0.5 text-xs outline-none focus:border-teal-500"
                        autoFocus
                        disabled={editPending}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(sec.id)}
                        disabled={editPending || !editingName.trim()}
                        className="font-bold text-teal-800 hover:underline disabled:opacity-50"
                      >
                        {editPending ? "…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={editPending}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="font-bold text-teal-950">{sec.name}</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-500">
                        {sec.slug}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(sec)}
                        className="ml-1 text-teal-700 hover:text-teal-950 font-semibold transition"
                        title={`Rename ${sec.name}`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(sec.id, sec.name)}
                        disabled={deletePendingId === sec.id}
                        className="ml-1 text-slate-400 hover:text-red-600 transition disabled:opacity-50"
                        title={`Delete ${sec.name}`}
                      >
                        {deletePendingId === sec.id ? "…" : "×"}
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
          {editError && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {editError}
            </p>
          )}
          {deleteError && (
            <p className="mt-2 text-xs font-semibold text-red-600">
              {deleteError}
            </p>
          )}
        </div>

        {/* Add Sub-section Form */}
        <form
          action={(fd) => {
            action(fd);
            setNames("");
          }}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
        >
          <input type="hidden" name="subject_id" value={subjectId} />
          <label htmlFor="sub-section-names" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Add New Sub-section(s)
          </label>
          <div className="mt-2 flex flex-col sm:flex-row gap-2">
            <input
              id="sub-section-names"
              type="text"
              name="names"
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="e.g. June, July, August (or separate with commas)"
              className="flex-1 rounded-xl border bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500"
              required
            />
            <button
              type="submit"
              disabled={pending || !names.trim()}
              className="rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-black text-white hover:bg-teal-900 transition disabled:opacity-50"
            >
              <PendingButtonContent pending={pending} pendingLabel="Adding…">
                + Add Sub-section
              </PendingButtonContent>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Tip: You can type multiple names separated by commas (e.g. &ldquo;June 2024, July 2024&rdquo;) to add them at once.
          </p>

          {result.message && (
            <p
              className={`mt-3 text-xs font-semibold ${
                result.success ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {result.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
