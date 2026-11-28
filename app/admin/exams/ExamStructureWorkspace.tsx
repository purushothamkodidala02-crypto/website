"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeletePaperButton } from "@/app/admin/papers/DeletePaperButton";
import { DeleteSpecializationButton } from "@/app/admin/specializations/DeleteSpecializationButton";
import { DeleteSubjectButton } from "@/app/admin/subjects/DeleteSubjectButton";
import { DeleteGroupButton } from "@/app/admin/groups/DeleteGroupButton";
import { ExamSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { DeleteExamButton } from "./DeleteExamButton";

const StateManager = dynamic(
  () => import("./StateManager").then((mod) => mod.StateManager),
  { loading: () => <PanelLoading label="Loading state settings…" /> },
);

const CreateExamForm = dynamic(
  () => import("./CreateExamForm").then((mod) => mod.CreateExamForm),
  { loading: () => <PanelLoading label="Loading recruiting board form…" /> },
);

const CreateGroupForm = dynamic(
  () => import("@/app/admin/groups/CreateGroupForm").then((mod) => mod.CreateGroupForm),
  { loading: () => <PanelLoading label="Loading exam creation form…" /> },
);

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

type StatusFilter = "all" | "active" | "inactive";

function plural(count: number, singular: string, pluralWord = `${singular}s`) {
  return `${count.toLocaleString("en-IN")} ${count === 1 ? singular : pluralWord}`;
}

function PanelLoading({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white p-5 text-xs font-semibold text-slate-600 shadow-xs">
      <progress aria-label={label} className="loading-spinner loading-spinner-sm" />
      <span>{label}</span>
    </div>
  );
}

function IconSettings({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconSearch({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function IconPlus({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconChevronRight({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}

function handleTabKeyDown<T extends { id: string }>(
  event: React.KeyboardEvent<HTMLDivElement>,
  items: T[],
  currentId: string,
  onSelect: (item: T) => void,
) {
  if (items.length <= 1) return;
  const currentIndex = Math.max(0, items.findIndex((item) => item.id === currentId));
  let nextIndex = -1;

  if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % items.length;
  else if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + items.length) % items.length;
  else if (event.key === "Home") nextIndex = 0;
  else if (event.key === "End") nextIndex = items.length - 1;
  else return;

  event.preventDefault();
  const nextItem = items[nextIndex];
  if (!nextItem) return;
  onSelect(nextItem);
  const tabs = event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]');
  tabs[nextIndex]?.focus();
}

export function ExamStructureWorkspace({
  states,
  categories,
  exams,
  specializations,
  papers,
  subjects,
  initialStateSlug,
  initialBoardSlug,
  initialSearch,
}: {
  states: ExamState[];
  categories: Category[];
  exams: Exam[];
  specializations: Specialization[];
  papers: Paper[];
  subjects: Subject[];
  initialStateSlug?: string;
  initialBoardSlug?: string;
  initialSearch?: string;
}) {
  // O(1) indexed taxonomy lookups to avoid O(N^2) scans during renders and search
  const indexes = useMemo(() => {
    const stateById = new Map<string, ExamState>();
    for (const state of states) stateById.set(state.id, state);

    const categoriesByStateId = new Map<string, Category[]>();
    const categoryById = new Map<string, Category>();
    for (const category of categories) {
      categoryById.set(category.id, category);
      const list = categoriesByStateId.get(category.stateId) ?? [];
      list.push(category);
      categoriesByStateId.set(category.stateId, list);
    }

    const examsByCategoryId = new Map<string, Exam[]>();
    const examById = new Map<string, Exam>();
    for (const exam of exams) {
      examById.set(exam.id, exam);
      const list = examsByCategoryId.get(exam.categoryId) ?? [];
      list.push(exam);
      examsByCategoryId.set(exam.categoryId, list);
    }

    const specsByExamId = new Map<string, Specialization[]>();
    for (const spec of specializations) {
      const list = specsByExamId.get(spec.examId) ?? [];
      list.push(spec);
      specsByExamId.set(spec.examId, list);
    }

    const subjectsByPaperId = new Map<string, Subject[]>();
    for (const subject of subjects) {
      const list = subjectsByPaperId.get(subject.paperId) ?? [];
      list.push(subject);
      subjectsByPaperId.set(subject.paperId, list);
    }

    const papersByExamId = new Map<string, Paper[]>();
    const directPapersByExamId = new Map<string, Paper[]>();
    const papersBySpecId = new Map<string, Paper[]>();
    const examSubjectCountMap = new Map<string, number>();
    const specSubjectCountMap = new Map<string, number>();

    for (const paper of papers) {
      const examPapers = papersByExamId.get(paper.examId) ?? [];
      examPapers.push(paper);
      papersByExamId.set(paper.examId, examPapers);

      const subjectCount = (subjectsByPaperId.get(paper.id) ?? []).length;
      examSubjectCountMap.set(paper.examId, (examSubjectCountMap.get(paper.examId) ?? 0) + subjectCount);

      if (paper.specializationId) {
        const specPapers = papersBySpecId.get(paper.specializationId) ?? [];
        specPapers.push(paper);
        papersBySpecId.set(paper.specializationId, specPapers);
        specSubjectCountMap.set(
          paper.specializationId,
          (specSubjectCountMap.get(paper.specializationId) ?? 0) + subjectCount,
        );
      } else {
        const directPapers = directPapersByExamId.get(paper.examId) ?? [];
        directPapers.push(paper);
        directPapersByExamId.set(paper.examId, directPapers);
      }
    }

    return {
      stateById,
      categoriesByStateId,
      categoryById,
      examsByCategoryId,
      examById,
      specsByExamId,
      papersByExamId,
      directPapersByExamId,
      papersBySpecId,
      subjectsByPaperId,
      examSubjectCountMap,
      specSubjectCountMap,
    };
  }, [states, categories, exams, specializations, papers, subjects]);

  const initialMatchedState = useMemo(() => {
    if (initialStateSlug) {
      const bySlug = states.find((s) => s.slug === initialStateSlug);
      if (bySlug) return bySlug;
    }
    return states[0];
  }, [initialStateSlug, states]);

  const [selectedStateId, setSelectedStateId] = useState(initialMatchedState?.id ?? "");
  const [boardByState, setBoardByState] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    if (initialMatchedState && initialBoardSlug) {
      const matchedBoard = categories.find(
        (c) => c.stateId === initialMatchedState.id && c.slug === initialBoardSlug,
      );
      if (matchedBoard) {
        map[initialMatchedState.id] = matchedBoard.id;
      }
    }
    return map;
  });

  const [search, setSearch] = useState(initialSearch ?? "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [showAddExam, setShowAddExam] = useState(false);
  const [showStateManager, setShowStateManager] = useState(false);
  const [expandedExamIds, setExpandedExamIds] = useState<Record<string, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const boardTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const resolvedStateId = indexes.stateById.has(selectedStateId)
    ? selectedStateId
    : (states[0]?.id ?? "");
  const selectedState = indexes.stateById.get(resolvedStateId);
  const stateCategories = indexes.categoriesByStateId.get(resolvedStateId) ?? [];

  const desiredBoardId = boardByState[resolvedStateId];
  const resolvedCategoryId = stateCategories.some((category) => category.id === desiredBoardId)
    ? desiredBoardId
    : (stateCategories[0]?.id ?? "");
  const selectedCategory = indexes.categoryById.get(resolvedCategoryId);

  const syncUrlParams = useCallback(
    (stateSlug?: string, boardSlug?: string) => {
      if (typeof window === "undefined") return;
      const params = new URLSearchParams(window.location.search);
      if (stateSlug) params.set("state", stateSlug);
      else params.delete("state");
      if (boardSlug) params.set("board", boardSlug);
      else params.delete("board");
      const qs = params.toString();
      const target = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      window.history.replaceState(null, "", target);
    },
    [],
  );

  const handleSelectState = useCallback(
    (state: ExamState) => {
      setSelectedStateId(state.id);
      const boards = indexes.categoriesByStateId.get(state.id) ?? [];
      const rememberedId = boardByState[state.id];
      const nextBoard = boards.find((b) => b.id === rememberedId) ?? boards[0];
      syncUrlParams(state.slug, nextBoard?.slug);
    },
    [boardByState, indexes.categoriesByStateId, syncUrlParams],
  );

  const handleSelectBoard = useCallback(
    (category: Category) => {
      setBoardByState((prev) => ({ ...prev, [category.stateId]: category.id }));
      const st = indexes.stateById.get(category.stateId);
      syncUrlParams(st?.slug, category.slug);
    },
    [indexes.stateById, syncUrlParams],
  );

  // Keep selected board tab visible inside horizontal scroller
  useEffect(() => {
    const activeTab = resolvedCategoryId ? boardTabRefs.current[resolvedCategoryId] : null;
    activeTab?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [resolvedCategoryId]);

  const query = search.trim().toLowerCase();
  const isSearchingGlobally = query.length > 0;

  // Board-scoped exams when browsing normally
  const boardExams = useMemo(() => {
    if (!selectedCategory) return [];
    const list = indexes.examsByCategoryId.get(selectedCategory.id) ?? [];
    if (statusFilter === "all") return list;
    return list.filter((exam) => (statusFilter === "active" ? exam.isActive : !exam.isActive));
  }, [indexes.examsByCategoryId, selectedCategory, statusFilter]);

  // Global cross-catalogue filter when user types in search bar
  const globalSearchMatches = useMemo(() => {
    if (!query) return { matchingBoards: [] as Category[], examMatches: [] as Array<{ exam: Exam; category: Category; state?: ExamState; matchedHints: string[] }> };

    const matchingBoards = categories.filter((cat) =>
      `${cat.name} ${cat.slug}`.toLowerCase().includes(query),
    );

    const examMatches: Array<{ exam: Exam; category: Category; state?: ExamState; matchedHints: string[] }> = [];
    for (const exam of exams) {
      if (statusFilter === "active" && !exam.isActive) continue;
      if (statusFilter === "inactive" && exam.isActive) continue;

      const category = indexes.categoryById.get(exam.categoryId);
      if (!category) continue;
      const state = indexes.stateById.get(category.stateId);

      const examSpecs = indexes.specsByExamId.get(exam.id) ?? [];
      const examPapers = indexes.papersByExamId.get(exam.id) ?? [];

      const matchedHints: string[] = [];
      for (const spec of examSpecs) {
        if (spec.name.toLowerCase().includes(query)) matchedHints.push(spec.name);
      }
      for (const paper of examPapers) {
        if (paper.name.toLowerCase().includes(query)) matchedHints.push(paper.name);
        for (const subject of indexes.subjectsByPaperId.get(paper.id) ?? []) {
          if (subject.name.toLowerCase().includes(query)) matchedHints.push(subject.name);
        }
      }

      const directMatch =
        `${exam.name} ${exam.slug} ${category.name} ${state?.name ?? ""}`.toLowerCase().includes(query);

      if (directMatch || matchedHints.length > 0) {
        examMatches.push({
          exam,
          category,
          state,
          matchedHints: [...new Set(matchedHints)].slice(0, 4),
        });
      }
    }

    return { matchingBoards, examMatches };
  }, [categories, exams, indexes, query, statusFilter]);

  const activeExamList = isSearchingGlobally
    ? globalSearchMatches.examMatches.map((m) => m.exam)
    : boardExams;
  const allActiveExamsExpanded =
    activeExamList.length > 0 && activeExamList.every((exam) => Boolean(expandedExamIds[exam.id]));

  const toggleAllExams = () => {
    if (allActiveExamsExpanded) {
      setExpandedExamIds((prev) => {
        const next = { ...prev };
        for (const exam of activeExamList) delete next[exam.id];
        return next;
      });
    } else {
      setExpandedExamIds((prev) => {
        const next = { ...prev };
        for (const exam of activeExamList) next[exam.id] = true;
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Compact Header & Primary Actions */}
      <header className="flex flex-col gap-3 border-b border-teal-100/90 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Exam Catalogue
          </h1>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {plural(states.length, "State")} &middot; {plural(categories.length, "Board")} &middot;{" "}
            {plural(exams.length, "Exam")} &middot; {plural(papers.length, "Paper")} &middot;{" "}
            {plural(subjects.length, "Subject")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowAddBoard((prev) => !prev);
              setShowAddExam(false);
              setShowStateManager(false);
            }}
            aria-expanded={showAddBoard}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition ${
              showAddBoard
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
            }`}
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>{showAddBoard ? "Close Board Form" : "Add Board"}</span>
          </button>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => {
                setShowAddExam((prev) => !prev);
                setShowAddBoard(false);
                setShowStateManager(false);
              }}
              aria-expanded={showAddExam}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold shadow-xs transition ${
                showAddExam
                  ? "bg-teal-950 text-white"
                  : "bg-teal-700 text-white hover:bg-teal-800"
              }`}
            >
              <IconPlus className="h-3.5 w-3.5" />
              <span>{showAddExam ? "Close Exam Form" : `Add Exam (${selectedCategory.name})`}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowStateManager((prev) => !prev);
              setShowAddBoard(false);
              setShowAddExam(false);
            }}
            aria-expanded={showStateManager}
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold shadow-2xs transition ${
              showStateManager
                ? "border-teal-300 bg-teal-50 text-teal-950"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <IconSettings />
            <span>{showStateManager ? "Hide Regions" : "Regions"}</span>
          </button>
        </div>
      </header>

      {/* Lazy Drawers: State Settings / Add Board / Add Exam */}
      {showStateManager && (
        <StateManager
          states={states.map((state) => ({
            ...state,
            categoryCount: (indexes.categoriesByStateId.get(state.id) ?? []).length,
          }))}
        />
      )}

      {showAddBoard && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">Add Recruiting Board</h2>
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
        </section>
      )}

      {showAddExam && selectedCategory && (
        <section className="rounded-2xl border border-teal-200 bg-teal-50/40 p-5 shadow-xs sm:p-6">
          <div className="mb-4 flex items-center justify-between border-b border-teal-200/80 pb-3">
            <h2 className="text-sm font-bold text-teal-950 sm:text-base">
              Add Exam in {selectedCategory.name}
            </h2>
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
        </section>
      )}

      {/* Fast Search & Status Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && search) {
                event.preventDefault();
                setSearch("");
              }
            }}
            aria-label="Search boards, exams, papers, or subjects"
            placeholder="Quick find any board, exam, paper, or subject…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-16 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-100"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
            >
              Clear
            </button>
          )}
        </div>

        <div
          role="group"
          aria-label="Filter by active status"
          className="inline-flex shrink-0 items-center self-start rounded-xl border border-slate-200 bg-white p-1 shadow-2xs sm:self-auto"
        >
          {(
            [
              { id: "all", label: "All" },
              { id: "active", label: "Active" },
              { id: "inactive", label: "Hidden" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              aria-pressed={statusFilter === opt.id}
              className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                statusFilter === opt.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isSearchingGlobally ? (
        /* Instant Global Search Results Across All States & Boards */
        <section className="overflow-hidden rounded-2xl border border-teal-200/80 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-100 bg-teal-50/40 px-4 py-3 sm:px-5">
            <p className="text-xs font-bold text-slate-800">
              {plural(globalSearchMatches.examMatches.length, "exam")} matching &ldquo;{search.trim()}&rdquo; across all boards
            </p>
            {globalSearchMatches.examMatches.length > 0 && (
              <button
                type="button"
                onClick={toggleAllExams}
                aria-expanded={allActiveExamsExpanded}
                className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                {allActiveExamsExpanded ? "Collapse all" : "Expand all"}
              </button>
            )}
          </div>

          {globalSearchMatches.matchingBoards.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50/60 px-4 py-2.5 sm:px-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Boards:
              </span>
              {globalSearchMatches.matchingBoards.map((board) => (
                <button
                  key={board.id}
                  type="button"
                  onClick={() => {
                    setSelectedStateId(board.stateId);
                    handleSelectBoard(board);
                    setSearch("");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs font-bold text-teal-900 hover:bg-teal-50"
                >
                  <span>{board.name}</span>
                  <span className="text-[10px] font-semibold text-slate-500">
                    ({indexes.stateById.get(board.stateId)?.code})
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-2.5 bg-[#fbfcfc] p-4 sm:p-5">
            {globalSearchMatches.examMatches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                <p className="text-sm font-bold text-slate-900">No matching exams</p>
                <p className="mt-1 text-xs text-slate-500">
                  No board, exam, paper, or subject matched &ldquo;{search.trim()}&rdquo;.
                </p>
              </div>
            ) : (
              globalSearchMatches.examMatches.map(({ exam, category, state, matchedHints }) => (
                <ExamBranch
                  key={exam.id}
                  exam={exam}
                  categoryId={category.id}
                  contextBadge={`${state?.code ?? ""} · ${category.name}`}
                  matchedHints={matchedHints}
                  specializations={indexes.specsByExamId.get(exam.id) ?? []}
                  papers={indexes.papersByExamId.get(exam.id) ?? []}
                  directPapers={indexes.directPapersByExamId.get(exam.id) ?? []}
                  papersBySpecId={indexes.papersBySpecId}
                  subjectsByPaperId={indexes.subjectsByPaperId}
                  totalSubjects={indexes.examSubjectCountMap.get(exam.id) ?? 0}
                  specSubjectCountMap={indexes.specSubjectCountMap}
                  isOpen={Boolean(expandedExamIds[exam.id])}
                  onToggle={() =>
                    setExpandedExamIds((prev) => ({ ...prev, [exam.id]: !prev[exam.id] }))
                  }
                  onJumpToBoard={() => {
                    setSelectedStateId(category.stateId);
                    handleSelectBoard(category);
                    setSearch("");
                    setExpandedExamIds((prev) => ({ ...prev, [exam.id]: true }));
                  }}
                />
              ))
            )}
          </div>
        </section>
      ) : (
        /* Structured Region Tabs -> Single-Row Board Tabs -> Instant Exam Explorer */
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
            {/* Row 1: Single-line State / Region Tabs */}
            <div className="border-b border-slate-100 bg-slate-50/70 px-3 py-2 sm:px-4">
              <div
                role="tablist"
                aria-label="States and regions"
                onKeyDown={(e) => handleTabKeyDown(e, states, resolvedStateId, handleSelectState)}
                className="admin-tablist admin-tablist-no-underline items-center gap-1.5"
              >
                {states.map((state) => {
                  const active = state.id === resolvedStateId;

                  return (
                    <button
                      key={state.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      tabIndex={active ? 0 : -1}
                      onClick={() => handleSelectState(state)}
                      className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold transition ${
                        active
                          ? "border-teal-700 bg-white text-teal-950 shadow-2xs"
                          : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/70 hover:text-slate-900"
                      }`}
                    >
                      <StateSymbol
                        slug={state.slug}
                        className={`h-3.5 w-3.5 shrink-0 ${active ? "text-teal-700" : "text-slate-400"}`}
                      />
                      <span>{state.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Row 2: Compact Single-Row Recruiting Board Tabs */}
            <div className="px-3 py-2.5 sm:px-4">
              {stateCategories.length === 0 ? (
                <p className="py-2 text-xs font-medium text-slate-500">
                  No Recruiting Boards in {selectedState?.name ?? "this region"} yet.
                </p>
              ) : (
                <div
                  role="tablist"
                  aria-label={`Recruiting boards in ${selectedState?.name ?? "selected state"}`}
                  onKeyDown={(e) => handleTabKeyDown(e, stateCategories, resolvedCategoryId, handleSelectBoard)}
                  className="admin-tablist admin-tablist-no-underline items-center gap-2"
                >
                  {stateCategories.map((category) => {
                    const active = resolvedCategoryId === category.id;

                    return (
                      <button
                        key={category.id}
                        ref={(el) => {
                          boardTabRefs.current[category.id] = el;
                        }}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        tabIndex={active ? 0 : -1}
                        onClick={() => handleSelectBoard(category)}
                        className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold transition ${
                          active
                            ? "border-teal-700 bg-teal-50/90 text-teal-950 shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <ExamSymbol
                          name={category.name}
                          className={`h-3.5 w-3.5 shrink-0 ${active ? "text-teal-800" : "text-slate-500"}`}
                        />
                        <span>{category.name}</span>
                        {!category.isActive && (
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Hidden
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Active Board Exam Explorer */}
          {selectedCategory && (
            <section
              role="tabpanel"
              aria-label={`${selectedCategory.name} exams`}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <h2 className="text-base font-black text-slate-900 sm:text-lg">
                    {selectedCategory.name}
                  </h2>
                  <span className="whitespace-nowrap rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-slate-600">
                    /{selectedCategory.slug}
                  </span>
                  <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Order #{selectedCategory.displayOrder}
                  </span>
                  <Status active={selectedCategory.isActive} compact />
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {boardExams.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleAllExams}
                      aria-expanded={allActiveExamsExpanded}
                      className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                    >
                      {allActiveExamsExpanded ? "Collapse all" : "Expand all"}
                    </button>
                  )}

                  <Link
                    href={`/admin/exams/${selectedCategory.id}/edit`}
                    prefetch={false}
                    className="whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                  >
                    Edit Board
                  </Link>

                  <DeleteExamButton examId={selectedCategory.id} examName={selectedCategory.name} />
                </div>
              </div>

              <div className="space-y-2.5 bg-[#fbfcfc] p-4 sm:p-5">
                {boardExams.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <p className="text-sm font-bold text-slate-900">No exams in this view</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {statusFilter !== "all"
                        ? "Switch status filter to All or add a new exam."
                        : "Use Add Exam above to add an exam under this board."}
                    </p>
                  </div>
                ) : (
                  boardExams.map((exam) => (
                    <ExamBranch
                      key={exam.id}
                      exam={exam}
                      categoryId={selectedCategory.id}
                      specializations={indexes.specsByExamId.get(exam.id) ?? []}
                      papers={indexes.papersByExamId.get(exam.id) ?? []}
                      directPapers={indexes.directPapersByExamId.get(exam.id) ?? []}
                      papersBySpecId={indexes.papersBySpecId}
                      subjectsByPaperId={indexes.subjectsByPaperId}
                      totalSubjects={indexes.examSubjectCountMap.get(exam.id) ?? 0}
                      specSubjectCountMap={indexes.specSubjectCountMap}
                      isOpen={Boolean(expandedExamIds[exam.id])}
                      onToggle={() =>
                        setExpandedExamIds((prev) => ({ ...prev, [exam.id]: !prev[exam.id] }))
                      }
                    />
                  ))
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ExamBranch({
  exam,
  categoryId,
  specializations,
  papers,
  directPapers,
  papersBySpecId,
  subjectsByPaperId,
  totalSubjects,
  specSubjectCountMap,
  isOpen,
  onToggle,
  contextBadge,
  matchedHints,
  onJumpToBoard,
}: {
  exam: Exam;
  categoryId: string;
  specializations: Specialization[];
  papers: Paper[];
  directPapers: Paper[];
  papersBySpecId: Map<string, Paper[]>;
  subjectsByPaperId: Map<string, Subject[]>;
  totalSubjects: number;
  specSubjectCountMap: Map<string, number>;
  isOpen: boolean;
  onToggle: () => void;
  contextBadge?: string;
  matchedHints?: string[];
  onJumpToBoard?: () => void;
}) {
  const [expandedSpecializations, setExpandedSpecializations] = useState<Record<string, boolean>>({});
  const [expandedPaperSubjects, setExpandedPaperSubjects] = useState<Record<string, boolean>>({});

  const allPapers = papers;
  const allExpandedInside =
    (specializations.length === 0 || specializations.every((s) => expandedSpecializations[s.id])) &&
    (allPapers.length === 0 || allPapers.every((p) => expandedPaperSubjects[p.id]));

  const toggleAllInside = () => {
    if (allExpandedInside) {
      setExpandedSpecializations({});
      setExpandedPaperSubjects({});
    } else {
      const nextSpecs: Record<string, boolean> = {};
      for (const spec of specializations) nextSpecs[spec.id] = true;
      const nextPapers: Record<string, boolean> = {};
      for (const paper of allPapers) nextPapers[paper.id] = true;
      setExpandedSpecializations(nextSpecs);
      setExpandedPaperSubjects(nextPapers);
    }
  };

  return (
    <article
      className={`exam-branch-deferred overflow-hidden rounded-2xl border bg-white transition ${
        isOpen ? "border-teal-300 shadow-xs" : "border-slate-200/90 hover:border-slate-300"
      }`}
    >
      {/* Accordion Header (heading wraps toggle button cleanly per WCAG accordion semantics) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <h3 className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              className="group flex w-full items-start gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-lg"
            >
              <span
                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-slate-600 transition ${
                  isOpen
                    ? "rotate-90 border-teal-200 bg-teal-50 text-teal-800"
                    : "border-slate-200 bg-slate-50 group-hover:bg-slate-100"
                }`}
              >
                <IconChevronRight className="h-3.5 w-3.5" />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-950 sm:text-base break-words">
                    {exam.name}
                  </span>
                  <Status active={exam.isActive} compact />
                  {contextBadge && (
                    <span className="whitespace-nowrap rounded bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200/70">
                      {contextBadge}
                    </span>
                  )}
                </span>

                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
                  <span className="font-mono text-[11px] text-slate-400">/{exam.slug}</span>
                  <span aria-hidden="true" className="text-slate-300">&middot;</span>
                  {specializations.length > 0 && (
                    <>
                      <span className="whitespace-nowrap font-semibold text-amber-800">
                        {plural(specializations.length, "Specialisation")}
                      </span>
                      <span aria-hidden="true" className="text-slate-300">&middot;</span>
                    </>
                  )}
                  <span className="whitespace-nowrap font-semibold text-sky-800">
                    {plural(papers.length, "Paper")}
                  </span>
                  <span aria-hidden="true" className="text-slate-300">&middot;</span>
                  <span className="whitespace-nowrap font-semibold text-teal-800">
                    {plural(totalSubjects, "Subject")}
                  </span>
                </span>

                {matchedHints && matchedHints.length > 0 && (
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {matchedHints.map((hint) => (
                      <span
                        key={hint}
                        className="rounded border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900"
                      >
                        {hint}
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 pl-8 sm:pl-0">
          {onJumpToBoard && (
            <button
              type="button"
              onClick={onJumpToBoard}
              className="whitespace-nowrap rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-900 hover:bg-teal-100"
            >
              Open board
            </button>
          )}

          <Link
            href={`/admin/groups/${exam.id}/edit`}
            prefetch={false}
            className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit Exam
          </Link>
        </div>
      </div>

      {/* Lazy-Mounted Hierarchy Details */}
      {isOpen && (
        <div className="space-y-3 border-t border-slate-100 bg-[#f8fbfb] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {(specializations.length > 0 || allPapers.length > 0) && (
                <button
                  type="button"
                  onClick={toggleAllInside}
                  aria-expanded={allExpandedInside}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
                >
                  {allExpandedInside ? "Collapse papers & subjects" : "Expand all papers & subjects"}
                </button>
              )}
              <Link
                href={`/admin/groups/${exam.id}/edit`}
                prefetch={false}
                className="whitespace-nowrap rounded-lg bg-teal-800 px-3 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-teal-900"
              >
                Manage Papers &amp; SEO
              </Link>
            </div>

            <DeleteGroupButton groupId={exam.id} groupName={exam.name} />
          </div>

          {/* Direct / Common Papers rendered immediately (no redundant extra click!) */}
          {directPapers.length > 0 && (
            <div className="space-y-2">
              {specializations.length > 0 && (
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Common Papers ({directPapers.length})
                </p>
              )}
              <div className="grid gap-2">
                {directPapers.map((paper) => (
                  <PaperBranch
                    key={paper.id}
                    paper={paper}
                    categoryId={categoryId}
                    examId={exam.id}
                    specializationId={null}
                    subjects={subjectsByPaperId.get(paper.id) ?? []}
                    showSubjects={Boolean(expandedPaperSubjects[paper.id])}
                    onToggleSubjects={() =>
                      setExpandedPaperSubjects((prev) => ({
                        ...prev,
                        [paper.id]: !prev[paper.id],
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* Specialisations / Streams */}
          {specializations.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {plural(specializations.length, "Specialisation")}
              </p>

              {specializations.map((specialization) => {
                const specPapers = papersBySpecId.get(specialization.id) ?? [];
                const specSubjectsCount = specSubjectCountMap.get(specialization.id) ?? 0;
                const specOpen = Boolean(expandedSpecializations[specialization.id]);

                return (
                  <div
                    key={specialization.id}
                    className="overflow-hidden rounded-xl border border-teal-100 bg-white shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 bg-teal-50/35 px-3.5 py-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSpecializations((prev) => ({
                            ...prev,
                            [specialization.id]: !prev[specialization.id],
                          }))
                        }
                        aria-expanded={specOpen}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <IconChevronRight
                          className={`h-3.5 w-3.5 shrink-0 text-teal-800 transition ${
                            specOpen ? "rotate-90" : ""
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 break-words">
                              {specialization.name}
                            </span>
                            <Status active={specialization.isActive} compact />
                          </div>
                          <p className="text-xs text-slate-500">
                            {plural(specPapers.length, "Paper")} &middot;{" "}
                            {plural(specSubjectsCount, "Subject")}
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedSpecializations((prev) => ({
                              ...prev,
                              [specialization.id]: !prev[specialization.id],
                            }))
                          }
                          aria-expanded={specOpen}
                          className={`whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                            specOpen
                              ? "bg-teal-800 text-white"
                              : "border border-teal-200 bg-white text-teal-900 hover:bg-teal-50"
                          }`}
                        >
                          {specOpen ? "Hide Papers" : `Papers (${specPapers.length})`}
                        </button>

                        <DeleteSpecializationButton
                          specializationId={specialization.id}
                          name={specialization.name}
                        />
                      </div>
                    </div>

                    {specOpen && (
                      <div className="space-y-2 border-t border-teal-100 bg-[#fbfdfd] p-3">
                        {specPapers.length === 0 ? (
                          <p className="rounded-lg border border-dashed border-slate-200 bg-white p-3 text-xs text-slate-500">
                            No papers in this specialisation yet.
                          </p>
                        ) : (
                          specPapers.map((paper) => (
                            <PaperBranch
                              key={paper.id}
                              paper={paper}
                              categoryId={categoryId}
                              examId={exam.id}
                              specializationId={specialization.id}
                              subjects={subjectsByPaperId.get(paper.id) ?? []}
                              showSubjects={Boolean(expandedPaperSubjects[paper.id])}
                              onToggleSubjects={() =>
                                setExpandedPaperSubjects((prev) => ({
                                  ...prev,
                                  [paper.id]: !prev[paper.id],
                                }))
                              }
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
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900">
              No Papers or Specialisations yet. Click <strong>Manage Papers &amp; SEO</strong> above to add them.
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function PaperBranch({
  paper,
  categoryId,
  examId,
  specializationId,
  subjects,
  showSubjects,
  onToggleSubjects,
}: {
  paper: Paper;
  categoryId: string;
  examId: string;
  specializationId: string | null;
  subjects: Subject[];
  showSubjects: boolean;
  onToggleSubjects: () => void;
}) {
  const subjectsHref = `/admin/subjects?category=${categoryId}&exam=${examId}&specialization=${specializationId ?? ""}&paper=${paper.id}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 break-words">{paper.name}</h4>
            <Status active={paper.isActive} compact />
            <span className="whitespace-nowrap text-xs font-medium text-slate-500">
              {plural(subjects.length, "Subject")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {subjects.length > 0 && (
            <button
              type="button"
              onClick={onToggleSubjects}
              aria-expanded={showSubjects}
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                showSubjects
                  ? "border-teal-700 bg-teal-50 text-teal-900"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span>{showSubjects ? "Hide Subjects" : `Subjects (${subjects.length})`}</span>
            </button>
          )}

          <Link
            href={subjectsHref}
            prefetch={false}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-teal-800 px-2.5 py-1 text-xs font-semibold text-white hover:bg-teal-900"
          >
            <IconPlus className="h-3 w-3" />
            <span>Add Subjects</span>
          </Link>

          <Link
            href={`/admin/papers/${paper.id}/edit?fromExam=${examId}`}
            prefetch={false}
            className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold text-teal-800 hover:bg-teal-50"
          >
            Edit Paper
          </Link>

          <DeletePaperButton paperId={paper.id} paperName={paper.name} />
        </div>
      </div>

      {showSubjects && subjects.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-2.5">
          <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="shrink-0 rounded bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                    #{subject.displayOrder ?? "-"}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 leading-snug break-words">
                    {subject.name}
                  </span>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <Link
                    href={`/admin/subjects/${subject.id}/edit?category=${categoryId}&exam=${examId}&specialization=${specializationId ?? ""}&paper=${paper.id}`}
                    prefetch={false}
                    className="rounded px-1.5 py-0.5 text-[11px] font-semibold text-teal-800 hover:bg-teal-50"
                  >
                    Edit
                  </Link>
                  <DeleteSubjectButton subjectId={subject.id} subjectName={subject.name} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Status({ active, compact = false }: { active: boolean; compact?: boolean }) {
  return (
    <span
      className={`whitespace-nowrap rounded-full font-semibold ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
      } ${
        active
          ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {active ? "Active" : "Hidden"}
    </span>
  );
}
