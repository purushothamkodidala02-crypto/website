"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DeletePaperButton } from "@/app/admin/papers/DeletePaperButton";
import { DeleteSpecializationButton } from "@/app/admin/specializations/DeleteSpecializationButton";
import { DeleteSubjectButton } from "@/app/admin/subjects/DeleteSubjectButton";
import { CreateGroupForm } from "@/app/admin/groups/CreateGroupForm";
import { DeleteGroupButton } from "@/app/admin/groups/DeleteGroupButton";
import { ExamSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { CreateExamForm } from "./CreateExamForm";
import { DeleteExamButton } from "./DeleteExamButton";
import { StateManager } from "./StateManager";

type ExamState = {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  displayOrder: number;
};

type Category = {
  id: string;
  stateId: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

type Exam = {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

type Specialization = {
  id: string;
  examId: string;
  name: string;
  isActive: boolean;
};

type Paper = {
  id: string;
  examId: string;
  specializationId: string | null;
  name: string;
  isActive: boolean;
};

type Subject = {
  id: string;
  paperId: string;
  name: string;
  isActive: boolean;
  displayOrder?: number;
};

function stateCategoriesFor(categories: Category[], stateId: string) {
  return categories.filter((category) => category.stateId === stateId);
}

// Clean inline SVG icons for a professional, human-crafted design
function IconSettings({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconPlus({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconClose({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function IconChevronDown({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function IconChevronUp({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
    </svg>
  );
}

function IconLayers({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l9.75 5.25 9.75-5.25-4.179-2.25m-11.142 4.5L2.25 16.5l9.75 5.25 9.75-5.25-4.179-2.25M12 2.25L2.25 7.5l9.75 5.25 9.75-5.25L12 2.25z" />
    </svg>
  );
}

function IconFileText({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconStar({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export function ExamStructureWorkspace({
  states,
  categories,
  exams,
  specializations,
  papers,
  subjects,
}: {
  states: ExamState[];
  categories: Category[];
  exams: Exam[];
  specializations: Specialization[];
  papers: Paper[];
  subjects: Subject[];
}) {
  const [selectedStateId, setSelectedStateId] = useState(states[0]?.id ?? "");
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showStateManager, setShowStateManager] = useState(false);

  const resolvedStateId = states.some((state) => state.id === selectedStateId)
    ? selectedStateId
    : (states[0]?.id ?? "");
  const selectedState = states.find((state) => state.id === resolvedStateId);
  const stateCategories = categories.filter((category) => category.stateId === resolvedStateId);

  const [selectedCategoryId, setSelectedCategoryId] = useState(stateCategories[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const resolvedCategoryId = stateCategories.some((category) => category.id === selectedCategoryId)
    ? selectedCategoryId
    : (stateCategories[0]?.id ?? "");
  const selectedCategory = stateCategories.find((category) => category.id === resolvedCategoryId);

  const query = search.trim().toLowerCase();

  const visibleExams = useMemo(() => {
    return exams.filter((exam) => {
      if (exam.categoryId !== resolvedCategoryId) return false;
      if (statusFilter === "active" && !exam.isActive) return false;
      if (statusFilter === "inactive" && exam.isActive) return false;
      if (query && !`${exam.name} ${exam.slug}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [exams, resolvedCategoryId, statusFilter, query]);

  return (
    <div className="space-y-6">
      {/* State / Region Pill Selector & Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            Region:
          </span>
          {states.map((state) => {
            const active = state.id === resolvedStateId;
            const stateExams = exams.filter((exam) =>
              categories.some((c) => c.id === exam.categoryId && c.stateId === state.id),
            );
            const stateBoardCount = stateCategoriesFor(categories, state.id).length;

            return (
              <button
                key={state.id}
                type="button"
                onClick={() => {
                  setSelectedStateId(state.id);
                  const firstCategory = categories.find((c) => c.stateId === state.id);
                  setSelectedCategoryId(firstCategory?.id ?? "");
                  setSearch("");
                }}
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span className={`grid h-4 w-4 place-items-center ${active ? "text-teal-300" : "text-slate-500"}`}>
                  <StateSymbol slug={state.slug} className="h-4 w-4" />
                </span>
                <span>{state.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    active ? "bg-white/20 text-teal-200" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {stateBoardCount} {stateBoardCount === 1 ? "board" : "boards"} · {stateExams.length} {stateExams.length === 1 ? "exam" : "exams"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setShowStateManager(!showStateManager)}
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition shadow-xs ${
            showStateManager
              ? "border-slate-300 bg-slate-100 text-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <IconSettings className="h-3.5 w-3.5" />
          <span>{showStateManager ? "Close State Settings" : "State Settings"}</span>
        </button>
      </div>

      {/* State Manager Collapsible Panel */}
      {showStateManager && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <StateManager
            states={states.map((state) => ({
              ...state,
              categoryCount: categories.filter((category) => category.stateId === state.id).length,
            }))}
          />
        </div>
      )}

      {/* Recruiting Boards in Active State */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recruiting Boards in {selectedState?.name ?? "this state"}
            </h2>
            <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
              {stateCategories.length} {stateCategories.length === 1 ? "Board" : "Boards"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAddBoard(!showAddBoard);
                if (showAddExam) setShowAddExam(false);
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition shadow-xs ${
                showAddBoard
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              {showAddBoard ? (
                <>
                  <IconClose className="h-3.5 w-3.5" />
                  <span>Close Board Form</span>
                </>
              ) : (
                <>
                  <IconPlus className="h-3.5 w-3.5" />
                  <span>Add Recruiting Board</span>
                </>
              )}
            </button>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  setShowAddExam(!showAddExam);
                  if (showAddBoard) setShowAddBoard(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition shadow-xs ${
                  showAddExam
                    ? "border-teal-900 bg-teal-900 text-white"
                    : "border-teal-700 bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                {showAddExam ? (
                  <>
                    <IconClose className="h-3.5 w-3.5" />
                    <span>Close Exam Form</span>
                  </>
                ) : (
                  <>
                    <IconPlus className="h-3.5 w-3.5" />
                    <span>Add Exam in {selectedCategory.name}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Inline Add Board Form */}
        {showAddBoard && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">Add Recruiting Board</h3>
                <p className="text-xs text-slate-500">e.g. TGPSC, APPSC, DSC, Police Recruitment Board</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBoard(false)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
            <CreateExamForm
              states={states.map((state) => ({ id: state.id, name: state.name, code: state.code }))}
              initialStateId={resolvedStateId}
              existingCategories={categories.map((category) => ({
                id: category.id,
                stateId: category.stateId,
                name: category.name,
              }))}
            />
          </div>
        )}

        {/* Inline Add Exam Form */}
        {showAddExam && selectedCategory && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between border-b border-teal-200/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-teal-950 sm:text-base">
                  Add Exam under {selectedCategory.name}
                </h3>
                <p className="text-xs text-teal-700">
                  Configure the exam name, optional specialisations, and papers together.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExam(false)}
                className="rounded-lg border border-teal-300 px-2.5 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-100"
              >
                Close
              </button>
            </div>
            <CreateGroupForm
              key={selectedCategory.id}
              categories={stateCategories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              existingExams={exams.map((exam) => ({
                id: exam.id,
                categoryId: exam.categoryId,
                name: exam.name,
                slug: exam.slug,
              }))}
              initialCategoryId={selectedCategory.id}
            />
          </div>
        )}

        {/* Boards Grid Cards */}
        {stateCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
            No Recruiting Boards in this state yet. Click &quot;Add Recruiting Board&quot; above to create one.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stateCategories.map((category) => {
              const categoryExams = exams.filter((exam) => exam.categoryId === category.id);
              const active = resolvedCategoryId === category.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSearch("");
                  }}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition-all ${
                    active
                      ? "border-teal-600 bg-teal-50/70 shadow-xs ring-1 ring-teal-600"
                      : "border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                      active ? "bg-slate-900 text-teal-300" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ExamSymbol name={category.name} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-sm font-bold text-slate-900 leading-snug break-words">
                        {category.name}
                      </strong>
                      <Status active={category.isActive} compact />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {categoryExams.length} {categoryExams.length === 1 ? "Exam" : "Exams"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Board & Exam Architecture Explorer */}
      {selectedCategory && (
        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          {/* Header Banner & Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">
                  {selectedState?.name} › Recruiting Board
                </span>
                <h3 className="text-xl font-bold text-slate-900">{selectedCategory.name}</h3>
              </div>
              <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-mono text-xs font-medium text-slate-600 shadow-xs">
                /{selectedCategory.slug} · Display #{selectedCategory.displayOrder}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Field */}
              <div className="relative w-60 sm:w-64">
                <IconSearch className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Filter exams in ${selectedCategory.name}...`}
                  className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-teal-500 focus:outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <Link
                href={`/admin/exams/${selectedCategory.id}/edit`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
              >
                Edit Board
              </Link>
              <DeleteExamButton examId={selectedCategory.id} examName={selectedCategory.name} />
            </div>
          </div>

          {/* Exams List Container */}
          <div className="space-y-3 p-5 sm:p-6 bg-[#fbfcfc]">
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-semibold text-slate-500">
              <span>
                Showing {visibleExams.length} of {exams.filter((e) => e.categoryId === selectedCategory.id).length} exams in {selectedCategory.name}
              </span>
              <span className="text-slate-400">Click any exam below to inspect papers and subjects</span>
            </div>

            {visibleExams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <h4 className="text-sm font-bold text-slate-900">No matching exams</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {search
                    ? "Try adjusting your search keywords."
                    : "Click '+ Add Exam' above to configure your first exam."}
                </p>
              </div>
            ) : (
              visibleExams.map((exam) => (
                <ExamBranch
                  key={exam.id}
                  exam={exam}
                  categoryId={selectedCategory.id}
                  specializations={specializations.filter((item) => item.examId === exam.id)}
                  papers={papers.filter((paper) => paper.examId === exam.id)}
                  subjects={subjects}
                  defaultOpen={false}
                />
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function ExamBranch({
  exam,
  categoryId,
  specializations,
  papers,
  subjects,
  defaultOpen = false,
}: {
  exam: Exam;
  categoryId: string;
  specializations: Specialization[];
  papers: Paper[];
  subjects: Subject[];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [expandedSpecializations, setExpandedSpecializations] = useState<Record<string, boolean>>({});
  const [directPapersOpen, setDirectPapersOpen] = useState(false);

  const examSubjects = subjects.filter((subject) =>
    papers.some((paper) => paper.id === subject.paperId),
  );
  const directPapers = papers.filter((paper) => !paper.specializationId);

  const toggleSpecialization = (id: string) => {
    setExpandedSpecializations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    specializations.forEach((s) => {
      allExpanded[s.id] = true;
    });
    setExpandedSpecializations(allExpanded);
    setDirectPapersOpen(true);
  };

  const collapseAll = () => {
    setExpandedSpecializations({});
    setDirectPapersOpen(false);
  };

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition open:border-teal-200/80 open:shadow-xs"
    >
      <summary className="cursor-pointer list-none bg-white px-5 py-4 transition hover:bg-slate-50/60 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Status active={exam.isActive} compact />
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                Display #{exam.displayOrder}
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold text-slate-900">{exam.name}</h3>
            <p className="mt-0.5 font-mono text-xs text-slate-400">/{exam.slug}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            {specializations.length > 0 && (
              <StructureCount value={specializations.length} label="Specialisations" tone="amber" />
            )}
            <StructureCount value={papers.length} label="Papers" tone="blue" />
            <StructureCount value={examSubjects.length} label="Subjects" tone="teal" />
            <span className="ml-1 inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 transition group-open:bg-teal-50 group-open:text-teal-900 group-open:border-teal-200">
              <span>{isOpen ? "Hide Structure" : "View Structure"}</span>
              {isOpen ? (
                <IconChevronUp className="h-3.5 w-3.5" />
              ) : (
                <IconChevronDown className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
        </div>
      </summary>

      {/* Expanded Hierarchy Breakdown */}
      <div className="space-y-4 border-t border-slate-100 bg-[#f8fbfb] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Exam Hierarchy & Workspace
            </p>
            <p className="text-xs text-slate-500">
              Manage specialisations, papers, and assigned subjects for {exam.name}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(specializations.length > 0 || directPapers.length > 0) && (
              <div className="mr-2 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50"
                >
                  Collapse all
                </button>
              </div>
            )}

            <Link
              href={`/admin/groups/${exam.id}/edit`}
              className="inline-flex items-center gap-1 rounded-xl bg-teal-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-900"
            >
              <span>Open Exam Workspace</span>
            </Link>

            <DeleteGroupButton groupId={exam.id} groupName={exam.name} />
          </div>
        </div>

        {/* Direct / Common Papers Section */}
        {directPapers.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setDirectPapersOpen(!directPapersOpen)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setDirectPapersOpen(!directPapersOpen);
                }
              }}
              className="flex cursor-pointer select-none items-center justify-between gap-3 bg-slate-50/70 p-3.5 transition hover:bg-slate-100/60"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200/70 text-slate-700">
                  <IconFileText className="h-4 w-4" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Common Examination Papers</h4>
                  <p className="text-xs text-slate-500">
                    Papers taken by all candidates of this exam ({directPapers.length}{" "}
                    {directPapers.length === 1 ? "Paper" : "Papers"})
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-xs">
                <span>{directPapersOpen ? "Hide Papers" : `Show Papers (${directPapers.length})`}</span>
                {directPapersOpen ? (
                  <IconChevronUp className="h-3 w-3" />
                ) : (
                  <IconChevronDown className="h-3 w-3" />
                )}
              </span>
            </div>

            {directPapersOpen && (
              <div className="grid gap-2.5 border-t border-slate-100 bg-[#fafafa] p-4">
                {directPapers.map((paper) => (
                  <PaperBranch
                    key={paper.id}
                    paper={paper}
                    categoryId={categoryId}
                    examId={exam.id}
                    specializationId={null}
                    subjects={subjects.filter((subject) => subject.paperId === paper.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Specialisations & Streams Section */}
        {specializations.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Exam Streams & Specialisations ({specializations.length})
            </h4>

            {specializations.map((specialization) => {
              const specializationPapers = papers.filter(
                (paper) => paper.specializationId === specialization.id,
              );
              const specSubjects = subjects.filter((subject) =>
                specializationPapers.some((paper) => paper.id === subject.paperId),
              );
              const isExpanded = !!expandedSpecializations[specialization.id];

              return (
                <div
                  key={specialization.id}
                  className="overflow-hidden rounded-2xl border border-teal-100 bg-white shadow-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-teal-100/60 bg-teal-50/30 p-3.5">
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleSpecialization(specialization.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleSpecialization(specialization.id);
                        }
                      }}
                      className="flex min-w-[200px] flex-1 cursor-pointer select-none items-center gap-3"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-800">
                        <IconStar className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{specialization.name}</h4>
                          <Status active={specialization.isActive} compact />
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {specializationPapers.length} {specializationPapers.length === 1 ? "Paper" : "Papers"} ·{" "}
                          {specSubjects.length} {specSubjects.length === 1 ? "Subject" : "Subjects"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSpecialization(specialization.id);
                        }}
                        className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                          isExpanded
                            ? "bg-teal-800 text-white hover:bg-teal-900"
                            : "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100"
                        }`}
                      >
                        <span>{isExpanded ? "Hide Papers" : `Show Papers (${specializationPapers.length})`}</span>
                        {isExpanded ? (
                          <IconChevronUp className="h-3 w-3" />
                        ) : (
                          <IconChevronDown className="h-3 w-3" />
                        )}
                      </button>

                      <div onClick={(e) => e.stopPropagation()}>
                        <DeleteSpecializationButton
                          specializationId={specialization.id}
                          name={specialization.name}
                        />
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-2.5 border-t border-teal-50 bg-[#fbfdfd] p-4">
                      {specializationPapers.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-xs text-slate-500">
                          No papers in this specialisation yet. Open the Exam workspace to add one.
                        </p>
                      ) : (
                        specializationPapers.map((paper) => (
                          <PaperBranch
                            key={paper.id}
                            paper={paper}
                            categoryId={categoryId}
                            examId={exam.id}
                            specializationId={specialization.id}
                            subjects={subjects.filter((subject) => subject.paperId === paper.id)}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {papers.length === 0 && specializations.length === 0 && (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
            This Exam has no Papers or Specialisations yet. Open its workspace to configure test papers.
          </div>
        )}
      </div>
    </details>
  );
}

function PaperBranch({
  paper,
  categoryId,
  examId,
  specializationId,
  subjects,
}: {
  paper: Paper;
  categoryId: string;
  examId: string;
  specializationId: string | null;
  subjects: Subject[];
}) {
  const [showSubjects, setShowSubjects] = useState(false);
  const subjectsHref = `/admin/subjects?category=${categoryId}&exam=${examId}&specialization=${specializationId ?? ""}&paper=${paper.id}`;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="text-sm font-bold text-slate-900">{paper.name}</h5>
              <Status active={paper.isActive} compact />
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={subjectsHref}
            className="inline-flex items-center gap-1 rounded-lg bg-teal-800 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-900"
          >
            <IconPlus className="h-3 w-3" />
            <span>Add Subjects</span>
          </Link>

          {subjects.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSubjects(!showSubjects)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              <span>{showSubjects ? "Hide Subjects" : `Show Subjects (${subjects.length})`}</span>
              {showSubjects ? (
                <IconChevronUp className="h-3 w-3" />
              ) : (
                <IconChevronDown className="h-3 w-3" />
              )}
            </button>
          )}

          <Link
            href={`/admin/papers/${paper.id}/edit?fromExam=${examId}`}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-50"
          >
            Edit Paper
          </Link>

          <DeletePaperButton paperId={paper.id} paperName={paper.name} />
        </div>
      </div>

      {showSubjects && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Assigned Subjects
            </span>
            <Link
              href={subjectsHref}
              className="text-xs font-semibold text-teal-800 hover:underline"
            >
              Manage Subjects in workspace →
            </Link>
          </div>

          {subjects.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400 italic">No Subjects added to this paper yet.</p>
          ) : (
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5 transition hover:bg-slate-100/70"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      #{subject.displayOrder ?? "-"}
                    </span>
                    <span className="text-xs font-semibold text-slate-800 leading-snug break-words">
                      {subject.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={`/admin/subjects/${subject.id}/edit?category=${categoryId}&exam=${examId}&specialization=${specializationId ?? ""}&paper=${paper.id}`}
                      className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-teal-800 hover:bg-teal-50"
                    >
                      Edit
                    </Link>
                    <DeleteSubjectButton subjectId={subject.id} subjectName={subject.name} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function StructureCount({
  value,
  label,
  tone = "slate",
}: {
  value: number;
  label: string;
  tone?: "amber" | "blue" | "teal" | "slate";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-900 border-amber-200/80",
    blue: "bg-sky-50 text-sky-900 border-sky-200/80",
    teal: "bg-teal-50 text-teal-900 border-teal-200/80",
    slate: "bg-slate-100 text-slate-700 border-slate-200/80",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}>
      <strong className="font-bold text-slate-900">{value}</strong>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </span>
  );
}

function Status({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return (
    <span
      className={`rounded-full font-semibold ${
        compact ? "px-2 py-0.2 text-[10px]" : "px-2.5 py-0.5 text-xs"
      } ${
        active
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
