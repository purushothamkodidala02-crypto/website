"use client";

import Link from "next/link";
import { useState } from "react";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    stateCategories[0]?.id ?? "",
  );
  const [search, setSearch] = useState("");
  const resolvedCategoryId = stateCategories.some(
    (category) => category.id === selectedCategoryId,
  )
    ? selectedCategoryId
    : (stateCategories[0]?.id ?? "");
  const selectedCategory = stateCategories.find(
    (category) => category.id === resolvedCategoryId,
  );
  const query = search.trim().toLowerCase();
  const visibleExams = exams.filter(
    (exam) =>
      exam.categoryId === resolvedCategoryId &&
      (!query || `${exam.name} ${exam.slug}`.toLowerCase().includes(query)),
  );

  return (
    <div className="space-y-5">
      {/* State / Region Pill Selector & Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2">
            Location:
          </span>
          {states.map((state) => {
            const active = state.id === resolvedStateId;
            const stateExams = exams.filter((exam) =>
              categories.some((c) => c.id === exam.categoryId && c.stateId === state.id)
            );
            const stateBoardCount = stateCategoriesFor(categories, state.id).length;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => {
                  setSelectedStateId(state.id);
                  setSelectedCategoryId(
                    categories.find((category) => category.stateId === state.id)?.id ?? ""
                  );
                  setSearch("");
                }}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-slate-950 text-white shadow-md shadow-slate-950/20 ring-1 ring-slate-800"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                }`}
              >
                <span className={`grid h-4 w-4 place-items-center ${active ? "text-teal-300" : "text-slate-500"}`}>
                  <StateSymbol slug={state.slug} className="h-4 w-4" />
                </span>
                <span>{state.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                    active ? "bg-white/20 text-teal-200" : "bg-slate-200 text-slate-600"
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
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
            showStateManager
              ? "bg-slate-200 text-slate-900 border-slate-300"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          <span>⚙️</span>
          <span>{showStateManager ? "Close State Settings" : "State Settings"}</span>
        </button>
      </div>

      {/* State Manager Collapsible Panel */}
      {showStateManager && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md animate-in fade-in">
          <StateManager
            states={states.map((state) => ({
              ...state,
              categoryCount: categories.filter((category) => category.stateId === state.id).length,
            }))}
          />
        </div>
      )}

      {/* Recruiting Boards Header and Action Buttons */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-600">
              Recruiting Boards in {selectedState?.name ?? "this state"}
            </h2>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
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
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border shadow-sm ${
                showAddBoard
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {showAddBoard ? "✕ Close Board Form" : "+ Add Recruiting Board"}
            </button>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  setShowAddExam(!showAddExam);
                  if (showAddBoard) setShowAddBoard(false);
                }}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition border shadow-sm ${
                  showAddExam
                    ? "bg-teal-900 text-white border-teal-900"
                    : "bg-teal-700 text-white border-teal-800 hover:bg-teal-800"
                }`}
              >
                {showAddExam ? "✕ Close Exam Form" : `+ Add Exam in ${selectedCategory.name}`}
              </button>
            )}
          </div>
        </div>

        {/* Inline Add Board Form */}
        {showAddBoard && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-md animate-in fade-in">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-950 text-sm sm:text-base">+ Add Recruiting Board</h3>
                <p className="text-xs text-slate-500">e.g. TGPSC, APPSC, DSC, Police Recruitment Board</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddBoard(false)}
                className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                ✕ Close
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
          <div className="overflow-hidden rounded-2xl border border-teal-200 bg-teal-50/40 p-5 sm:p-6 shadow-md animate-in fade-in">
            <div className="mb-4 flex items-center justify-between border-b border-teal-200 pb-3">
              <div>
                <h3 className="font-bold text-teal-950 text-sm sm:text-base">
                  + Add Exam under {selectedCategory.name}
                </h3>
                <p className="text-xs text-teal-700">
                  Configure the exam name, optional specialisations, and papers together.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddExam(false)}
                className="rounded-lg border border-teal-300 px-2.5 py-1 text-xs font-bold text-teal-800 hover:bg-teal-100"
              >
                ✕ Close
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
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No Recruiting Boards in this state yet. Click &quot;+ Add Recruiting Board&quot; above to create one.
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
                      ? "border-teal-500 bg-teal-50/70 shadow-md shadow-teal-950/5 ring-2 ring-teal-500/80"
                      : "border-slate-200/90 bg-white hover:border-teal-300 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition ${
                      active ? "bg-slate-950 text-teal-300" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    <ExamSymbol name={category.name} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <strong className="truncate font-black text-slate-950 text-sm">
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

      {/* Selected Board & Exams Container */}
      {selectedCategory && (
        <section className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm">
          {/* Board Header Banner & Search */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-white px-6 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-700">
                  Selected Board
                </span>
                <h3 className="text-xl font-black text-slate-950">{selectedCategory.name}</h3>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-600 border border-slate-200">
                {selectedCategory.slug} · Order #{selectedCategory.displayOrder}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-60 sm:w-72">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Filter exams in ${selectedCategory.name}...`}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-normal placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-sm"
                />
                <span className="absolute left-3 top-2.5 text-xs text-slate-400">🔍</span>
              </div>
              <Link
                href={`/admin/exams/${selectedCategory.id}/edit`}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                Edit Board
              </Link>
              <DeleteExamButton
                examId={selectedCategory.id}
                examName={selectedCategory.name}
              />
            </div>
          </div>

          {/* Exams List */}
          <div className="p-5 sm:p-6 space-y-3.5 bg-[#fbfcfc]">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-semibold px-1">
              <span>
                Showing {visibleExams.length} of {exams.filter((e) => e.categoryId === selectedCategory.id).length} exams in {selectedCategory.name}
              </span>
              <span className="text-slate-400 italic">Click an exam to expand its specialisations and papers</span>
            </div>

            {visibleExams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <h4 className="font-black text-slate-900 text-base">No matching exams</h4>
                <p className="mt-1 text-xs text-slate-500">
                  {search ? "Try different search keywords" : "Click '+ Add Exam' above to create your first exam."}
                </p>
              </div>
            ) : (
              visibleExams.map((exam) => (
                <ExamBranch
                  key={exam.id}
                  exam={exam}
                  categoryId={selectedCategory.id}
                  specializations={specializations.filter(
                    (item) => item.examId === exam.id,
                  )}
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
    specializations.forEach((s) => { allExpanded[s.id] = true; });
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
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white open:border-teal-200 open:shadow-md"
    >
      <summary className="cursor-pointer list-none bg-gradient-to-r from-white to-slate-50 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Status active={exam.isActive} />
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                Order {exam.displayOrder}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-black text-slate-950">{exam.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{exam.slug}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <StructureCount value={specializations.length} label="Specialisations" tone="amber" />
            <StructureCount value={papers.length} label="Papers" tone="blue" />
            <StructureCount value={examSubjects.length} label="Subjects" tone="teal" />
            <span className="ml-1 grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-600 transition-transform group-open:rotate-180 group-open:bg-teal-50 group-open:text-teal-800">
             ⌄
            </span>
          </div>
        </div>
      </summary>

      <div className="border-t border-teal-100 bg-[#f8fbfb] p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <p className="text-sm font-semibold text-slate-700">
              Exam workspace & structure
            </p>
            <p className="text-xs text-slate-500">
              Explore specialisations, papers, and subject display orders below.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(specializations.length > 0 || directPapers.length > 0) && (
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Expand all
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  Collapse all
                </button>
              </div>
            )}
            <Link
              href={`/admin/groups/${exam.id}/edit`}
              className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-bold text-white hover:bg-teal-800"
            >
              Open Exam workspace
            </Link>
            <DeleteGroupButton groupId={exam.id} groupName={exam.name} />
          </div>
        </div>

        {directPapers.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div 
              onClick={() => setDirectPapersOpen(!directPapersOpen)}
              className="flex items-center justify-between gap-3 p-4 bg-slate-50 cursor-pointer select-none hover:bg-slate-100 transition"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-200 text-xs font-bold text-slate-700">
                  📄
                </span>
                <div>
                  <h4 className="font-black text-slate-900 text-sm">Direct / Common Papers</h4>
                  <p className="text-xs text-slate-500">Papers that belong to the whole Exam ({directPapers.length} {directPapers.length === 1 ? "Paper" : "Papers"})</p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
              >
                {directPapersOpen ? "Hide Papers ▴" : `Show Papers (${directPapers.length}) ▾`}
              </button>
            </div>
            {directPapersOpen && (
              <div className="p-4 border-t border-slate-100 grid gap-3 bg-[#fafafa]">
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

        {specializations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Specialisations ({specializations.length})
              </h4>
            </div>

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
                  className="rounded-2xl border border-teal-100 bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-teal-50/70 via-white to-white border-b border-teal-100/60">
                    <div 
                      onClick={() => toggleSpecialization(specialization.id)}
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-[200px]"
                    >
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-100 text-teal-900 text-xs font-bold">
                        ★
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-950 text-base">{specialization.name}</h4>
                          <Status active={specialization.isActive} compact />
                        </div>
                        <p className="mt-0.5 text-xs font-semibold text-slate-500">
                          {specializationPapers.length} {specializationPapers.length === 1 ? "Paper" : "Papers"} · {specSubjects.length} {specSubjects.length === 1 ? "Subject" : "Subjects"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSpecialization(specialization.id)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                          isExpanded 
                            ? "bg-teal-700 text-white hover:bg-teal-800" 
                            : "border border-teal-200 bg-teal-50 text-teal-900 hover:bg-teal-100"
                        }`}
                      >
                        {isExpanded ? "Hide Papers ▴" : `Show Papers (${specializationPapers.length}) ▾`}
                      </button>
                      <DeleteSpecializationButton
                        specializationId={specialization.id}
                        name={specialization.name}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 border-t border-teal-50 bg-[#fbfdfd] space-y-3">
                      {specializationPapers.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-500">
                          No Papers in this Specialisation yet. Open the Exam workspace to add one.
                        </p>
                      ) : (
                        specializationPapers.map((paper) => (
                          <PaperBranch
                            key={paper.id}
                            paper={paper}
                            categoryId={categoryId}
                            examId={exam.id}
                            specializationId={specialization.id}
                            subjects={subjects.filter(
                              (subject) => subject.paperId === paper.id,
                            )}
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
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            This Exam has no Papers or Specialisations yet. Open its workspace and add the first Paper.
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
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h5 className="font-black text-slate-950 text-sm">{paper.name}</h5>
              <Status active={paper.isActive} compact />
            </div>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">
              {subjects.length} {subjects.length === 1 ? "Subject" : "Subjects"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={subjectsHref}
            className="rounded-lg bg-teal-700 px-2.5 py-1 text-xs font-bold text-white hover:bg-teal-800 shadow-sm"
          >
            + Add Subjects
          </Link>
          {subjects.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSubjects(!showSubjects)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              {showSubjects ? "Hide Subjects ▴" : `Show Subjects (${subjects.length}) ▾`}
            </button>
          )}
          <Link
            href={`/admin/papers/${paper.id}/edit?fromExam=${examId}`}
            className="rounded-lg px-2.5 py-1 text-xs font-bold text-teal-700 hover:bg-teal-50"
          >
            Edit Paper
          </Link>
          <DeletePaperButton paperId={paper.id} paperName={paper.name} />
        </div>
      </div>

      {showSubjects && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              Assigned Subjects
            </span>
            <Link
              href={subjectsHref}
              className="rounded-lg bg-slate-950 px-2.5 py-1 text-xs font-bold text-white hover:bg-slate-800"
            >
              + Add or manage Subjects
            </Link>
          </div>
          {subjects.length === 0 ? (
            <p className="mt-2 text-xs text-slate-500 italic">No Subjects added to this paper yet.</p>
          ) : (
            <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-2 hover:bg-slate-100/70 transition"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      #{subject.displayOrder ?? "-"}
                    </span>
                    <span className="truncate text-xs font-bold text-slate-800" title={subject.name}>
                      {subject.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Link
                      href={`/admin/subjects/${subject.id}/edit?category=${categoryId}&exam=${examId}&specialization=${specializationId ?? ""}&paper=${paper.id}`}
                      className="rounded px-1.5 py-0.5 text-[11px] font-bold text-teal-700 hover:bg-teal-50 hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteSubjectButton
                      subjectId={subject.id}
                      subjectName={subject.name}
                    />
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
    <span className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
      <strong className="text-slate-950 font-black">{value}</strong>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
    </span>
  );
}

function Status({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return (
    <span
      className={`rounded-full font-bold ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} ${
        active
          ? "bg-emerald-100 text-emerald-800"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}
