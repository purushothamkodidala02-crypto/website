"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  scanQuestionTextDuplicates,
  deleteUnassignedQuestion,
  deleteBulkUnassignedDuplicates,
  type DuplicateTextGroup,
} from "./similarity-actions";

type TestRecord = {
  id: string;
  title: string;
  status: string;
  paper_id: string;
  subject_id: string | null;
  series_number: number | string | null;
  updated_at: string;
};

type AssignmentRecord = {
  mock_test_id: string;
  question_id: string;
};

type PaperRecord = {
  id: string;
  exam_group_id: string;
  specialization_id: string | null;
  name: string;
  display_order: number;
};

type ExamRecord = {
  id: string;
  name: string;
};

type SpecializationRecord = {
  id: string;
  exam_group_id: string;
  name: string;
  slug: string;
};

type SubjectRecord = {
  id: string;
  name: string;
};

type OverlapClassification =
  | "common_specialization"
  | "subject_practice"
  | "same_series"
  | "cross_exam";

type OverlapDetail = {
  targetTestId: string;
  targetTestTitle: string;
  sharedCount: number;
  percentage: number;
  classification: OverlapClassification;
  explanation: string;
  targetExamName: string;
  targetSpecializationName?: string;
};

type TestAnalysis = {
  test: TestRecord;
  examName: string;
  paperName: string;
  specializationName?: string;
  subjectName?: string;
  totalQuestions: number;
  isSubjectTest: boolean;
  overlaps: OverlapDetail[];
  commonSpecializationCount: number;
  practiceReuseCount: number;
  sameSeriesCount: number;
};

export function QuestionSimilarityScanner({
  tests,
  assignments,
  papers,
  exams,
  specializations,
  subjects,
}: {
  tests: TestRecord[];
  assignments: AssignmentRecord[];
  papers: PaperRecord[];
  exams: ExamRecord[];
  specializations: SpecializationRecord[];
  subjects: SubjectRecord[];
}) {
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [comparisonScope, setComparisonScope] = useState<
    "same_paper" | "same_exam" | "all"
  >("same_paper");
  const [filterMode, setFilterMode] = useState<
    "all" | "warnings" | "common_syllabus" | "practice_reuse" | "unique_only"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Text duplicate scanner state
  const [textScannerOpen, setTextScannerOpen] = useState(false);
  const [scanningText, setScanningText] = useState(false);
  const [scannedTextResult, setScannedTextResult] = useState<{
    total: number;
    groups: DuplicateTextGroup[];
  } | null>(null);
  const [expandedOptionGroups, setExpandedOptionGroups] = useState<Set<string>>(new Set());
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [textDuplicateFilter, setTextDuplicateFilter] = useState<
    "all" | "same_paper" | "exact_only" | "different_options"
  >("same_paper");

  // Lookup maps
  const examMap = useMemo(() => new Map(exams.map((e) => [e.id, e.name])), [exams]);
  const paperMap = useMemo(() => new Map(papers.map((p) => [p.id, p])), [papers]);
  const specMap = useMemo(
    () => new Map(specializations.map((s) => [s.id, s.name])),
    [specializations],
  );
  const subjectMap = useMemo(
    () => new Map(subjects.map((s) => [s.id, s.name])),
    [subjects],
  );

  // Test ID -> Question IDs set
  const testQuestionsMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const a of assignments) {
      const set = map.get(a.mock_test_id) ?? new Set<string>();
      set.add(a.question_id);
      map.set(a.mock_test_id, set);
    }
    return map;
  }, [assignments]);

  // Compute test analysis matrix
  const analyzedTests = useMemo(() => {
    const results: TestAnalysis[] = [];

    for (const test of tests) {
      const paper = paperMap.get(test.paper_id);
      const examName = paper ? examMap.get(paper.exam_group_id) ?? "Unknown Exam" : "Unknown Exam";
      const specializationName = paper?.specialization_id
        ? specMap.get(paper.specialization_id)
        : undefined;
      const subjectName = test.subject_id ? subjectMap.get(test.subject_id) : undefined;
      const questions = testQuestionsMap.get(test.id) ?? new Set<string>();
      const totalQuestions = questions.size;
      const isSubjectTest = Boolean(test.subject_id);

      const overlaps: OverlapDetail[] = [];
      let commonSpecializationCount = 0;
      let practiceReuseCount = 0;
      let sameSeriesCount = 0;

      if (totalQuestions > 0) {
        for (const otherTest of tests) {
          if (otherTest.id === test.id) continue;

          // Scope filtering: focus strictly on same paper series or same exam if selected
          if (comparisonScope === "same_paper") {
            // Only compare tests within the exact same paper series (e.g. Mock 1 vs Mock 2)
            if (otherTest.paper_id !== test.paper_id) continue;
          } else if (comparisonScope === "same_exam") {
            const otherPaper = paperMap.get(otherTest.paper_id);
            if (!paper || !otherPaper || paper.exam_group_id !== otherPaper.exam_group_id) {
              continue;
            }
          }

          const otherPaper = paperMap.get(otherTest.paper_id);
          const otherExamName = otherPaper
            ? examMap.get(otherPaper.exam_group_id) ?? "Unknown Exam"
            : "Unknown Exam";
          const otherSpecializationName = otherPaper?.specialization_id
            ? specMap.get(otherPaper.specialization_id)
            : undefined;
          const otherQuestions = testQuestionsMap.get(otherTest.id) ?? new Set<string>();

          // Count shared question IDs
          let shared = 0;
          for (const qId of questions) {
            if (otherQuestions.has(qId)) {
              shared += 1;
            }
          }

          if (shared > 0) {
            const percentage = Math.round((shared / totalQuestions) * 100);
            const otherIsSubjectTest = Boolean(otherTest.subject_id);

            // Classification Logic
            let classification: OverlapClassification;
            let explanation: string;

            if (isSubjectTest !== otherIsSubjectTest) {
              // One is subject test, one is full paper test
              classification = "subject_practice";
              explanation =
                "Subject-wise practice test questions reused in full paper test (Expected for student revision).";
              practiceReuseCount += shared;
            } else if (
              paper &&
              otherPaper &&
              paper.exam_group_id === otherPaper.exam_group_id &&
              paper.specialization_id !== otherPaper.specialization_id &&
              (paper.specialization_id || otherPaper.specialization_id)
            ) {
              // Different specializations of the SAME exam (e.g. TG TET Paper 2 Maths/Science vs Social)
              classification = "common_specialization";
              explanation = `Shared common syllabus questions across specializations (e.g., CDP, Languages in TET). Normal and syllabus-aligned.`;
              commonSpecializationCount += shared;
            } else if (
              paper &&
              otherPaper &&
              paper.id === otherPaper.id &&
              !isSubjectTest &&
              !otherIsSubjectTest
            ) {
              // Same paper and same specialization (e.g. Grand Test 1 vs Grand Test 2)
              classification = "same_series";
              explanation = `Repeated questions within the same paper test series. Students taking both tests will see repeated questions.`;
              sameSeriesCount += shared;
            } else {
              classification = "cross_exam";
              explanation = `Questions shared between general mock tests.`;
            }

            overlaps.push({
              targetTestId: otherTest.id,
              targetTestTitle: otherTest.title,
              sharedCount: shared,
              percentage,
              classification,
              explanation,
              targetExamName: otherExamName,
              targetSpecializationName: otherSpecializationName,
            });
          }
        }
      }

      // Sort overlaps: warnings first, then by shared count descending
      overlaps.sort((a, b) => {
        if (a.classification === "same_series" && b.classification !== "same_series") return -1;
        if (b.classification === "same_series" && a.classification !== "same_series") return 1;
        return b.sharedCount - a.sharedCount;
      });

      results.push({
        test,
        examName,
        paperName: paper?.name ?? "Unknown Paper",
        specializationName,
        subjectName,
        totalQuestions,
        isSubjectTest,
        overlaps,
        commonSpecializationCount,
        practiceReuseCount,
        sameSeriesCount,
      });
    }

    return results;
  }, [tests, paperMap, examMap, specMap, subjectMap, testQuestionsMap, comparisonScope]);

  // Overall metrics
  const totalAnalyzedTests = analyzedTests.length;
  const testsWithSameSeriesWarnings = analyzedTests.filter((t) => t.sameSeriesCount > 0);
  const testsWithCommonSyllabus = analyzedTests.filter((t) => t.commonSpecializationCount > 0);
  const testsWithPracticeReuse = analyzedTests.filter((t) => t.practiceReuseCount > 0);

  // Filtered view
  const filteredTests = useMemo(() => {
    return analyzedTests.filter((item) => {
      const paper = paperMap.get(item.test.paper_id);
      if (selectedExamId !== "all" && paper?.exam_group_id !== selectedExamId) {
        return false;
      }

      if (filterMode === "warnings" && item.sameSeriesCount === 0) return false;
      if (filterMode === "common_syllabus" && item.commonSpecializationCount === 0) return false;
      if (filterMode === "practice_reuse" && item.practiceReuseCount === 0) return false;
      if (filterMode === "unique_only" && item.overlaps.length > 0) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.test.title.toLowerCase().includes(q);
        const matchExam = item.examName.toLowerCase().includes(q);
        const matchSpec = (item.specializationName ?? "").toLowerCase().includes(q);
        if (!matchTitle && !matchExam && !matchSpec) return false;
      }

      return true;
    });
  }, [analyzedTests, selectedExamId, filterMode, searchQuery, paperMap]);

  // Handle run text duplicate scanner
  const handleRunTextScan = async () => {
    setScanningText(true);
    setTextScannerOpen(true);
    setActionNotice(null);
    try {
      const res = await scanQuestionTextDuplicates();
      if (res.success) {
        setScannedTextResult({
          total: res.totalQuestionsScanned,
          groups: res.duplicateGroups,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanningText(false);
    }
  };

  const toggleOptionDetails = (key: string) => {
    setExpandedOptionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleItemDetails = (itemId: string) => {
    setExpandedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const handleDeleteUnassigned = async (questionId: string, groupKey: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this unassigned duplicate question?\n\nActive questions assigned to mock tests will NOT be touched."
      )
    ) {
      return;
    }

    setDeletingId(questionId);
    setActionNotice(null);
    try {
      const res = await deleteUnassignedQuestion(questionId);
      if (res.success) {
        setActionNotice({ type: "success", text: res.message });
        setScannedTextResult((prev) => {
          if (!prev) return null;
          const nextGroups = prev.groups
            .map((g) => {
              if (g.normalizedKey !== groupKey) return g;
              const nextItems = g.items.filter((i) => i.id !== questionId);
              return {
                ...g,
                count: nextItems.length,
                items: nextItems,
              };
            })
            .filter((g) => g.count > 1);

          return {
            total: prev.total - 1,
            groups: nextGroups,
          };
        });
      } else {
        setActionNotice({ type: "error", text: res.message });
      }
    } catch (e) {
      setActionNotice({ type: "error", text: "Failed to delete question." });
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAllUnassigned = async () => {
    if (!scannedTextResult) return;
    const allUnassignedIds: string[] = [];
    for (const g of scannedTextResult.groups) {
      for (const item of g.items) {
        if (item.assignedTests.length === 0) {
          allUnassignedIds.push(item.id);
        }
      }
    }

    if (!allUnassignedIds.length) return;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete all ${allUnassignedIds.length} unassigned duplicate questions?\n\nAll active questions currently assigned to mock tests will be kept safe.`
      )
    ) {
      return;
    }

    setBulkDeleting(true);
    setActionNotice(null);
    try {
      const res = await deleteBulkUnassignedDuplicates(allUnassignedIds);
      if (res.success) {
        setActionNotice({ type: "success", text: res.message });
        const unassignedSet = new Set(allUnassignedIds);
        setScannedTextResult((prev) => {
          if (!prev) return null;
          const nextGroups = prev.groups
            .map((g) => {
              const nextItems = g.items.filter((i) => !unassignedSet.has(i.id));
              return {
                ...g,
                count: nextItems.length,
                items: nextItems,
              };
            })
            .filter((g) => g.count > 1);

          return {
            total: prev.total - res.deletedCount,
            groups: nextGroups,
          };
        });
      } else {
        setActionNotice({ type: "error", text: res.message });
      }
    } catch (e) {
      setActionNotice({ type: "error", text: "Failed to perform bulk cleanup." });
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-800">
              Exam Intelligence
            </p>
          </div>
          <h2 className="mt-2 text-2xl font-black text-slate-950">
            Question Similarity & Overlap Scanner
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Automatically distinguishes intentional multi-stream overlaps (e.g. TG TET CDP & Languages) and subject practice reuse from accidental duplicates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunTextScan}
            disabled={scanningText}
            className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/70 px-4 py-2.5 text-xs font-bold text-teal-900 shadow-sm transition hover:bg-teal-100 disabled:opacity-60"
          >
            {scanningText ? (
              <>
                <svg className="h-3.5 w-3.5 animate-spin text-teal-800" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Scanning Question Bank…
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Scan Question Bank for Duplicates
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Tests Analyzed</p>
          <p className="mt-1.5 text-2xl font-black text-slate-900">{totalAnalyzedTests}</p>
          <span className="mt-1 inline-block text-xs font-semibold text-slate-600">Across all active papers</span>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Shared Specialisations</p>
          <p className="mt-1.5 text-2xl font-black text-emerald-900">{testsWithCommonSyllabus.length} tests</p>
          <span className="mt-1 inline-block text-xs font-bold text-emerald-700">✅ Intentional Common Syllabus</span>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Subject Practice Reuses</p>
          <p className="mt-1.5 text-2xl font-black text-blue-900">{testsWithPracticeReuse.length} tests</p>
          <span className="mt-1 inline-block text-xs font-bold text-blue-700">✅ Subject to Paper Practice</span>
        </div>

        <div className={`rounded-2xl border p-4 ${testsWithSameSeriesWarnings.length > 0 ? "border-amber-200 bg-amber-50/60" : "border-emerald-100 bg-emerald-50/50"}`}>
          <p className={`text-[11px] font-bold uppercase tracking-wider ${testsWithSameSeriesWarnings.length > 0 ? "text-amber-800" : "text-emerald-800"}`}>
            Same-Series Overlaps
          </p>
          <p className={`mt-1.5 text-2xl font-black ${testsWithSameSeriesWarnings.length > 0 ? "text-amber-900" : "text-emerald-900"}`}>
            {testsWithSameSeriesWarnings.length} {testsWithSameSeriesWarnings.length === 1 ? "test" : "tests"}
          </p>
          <span className={`mt-1 inline-block text-xs font-bold ${testsWithSameSeriesWarnings.length > 0 ? "text-amber-800" : "text-emerald-700"}`}>
            {testsWithSameSeriesWarnings.length > 0 ? "⚠️ Review Test 1 vs Test 2" : "✨ All Papers Clean"}
          </span>
        </div>
      </div>

      {/* Comparison Scope Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-teal-200/80 bg-teal-50/60 p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-900">
            Comparison Scope:
          </span>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-teal-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setComparisonScope("same_paper")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                comparisonScope === "same_paper"
                  ? "bg-teal-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🎯 Same Paper Series (Mock 1 vs Mock 2)
            </button>
            <button
              type="button"
              onClick={() => setComparisonScope("same_exam")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                comparisonScope === "same_exam"
                  ? "bg-teal-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🏛️ Same Exam (All Papers)
            </button>
            <button
              type="button"
              onClick={() => setComparisonScope("all")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                comparisonScope === "all"
                  ? "bg-teal-800 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              🌐 All Exams (Cross-Exam)
            </button>
          </div>
        </div>

        <p className="text-xs text-teal-900 font-medium">
          {comparisonScope === "same_paper" && (
            <span>Filtering strictly to mock tests of the <strong>same exam and same paper</strong> to catch repeated questions between test series.</span>
          )}
          {comparisonScope === "same_exam" && (
            <span>Comparing mock tests across different papers and specialisations within the <strong>same exam</strong>.</span>
          )}
          {comparisonScope === "all" && (
            <span>Comparing mock tests across <strong>all exams</strong> in the question bank.</span>
          )}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="similarity-exam-select" className="sr-only">Filter by Exam</label>
          <select
            id="similarity-exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm focus:border-teal-500 focus:outline-none"
          >
            <option value="all">All Exams ({exams.length})</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name}
              </option>
            ))}
          </select>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterMode === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              All Tests
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("warnings")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterMode === "warnings" ? "bg-amber-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              ⚠️ Warnings ({testsWithSameSeriesWarnings.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("common_syllabus")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterMode === "common_syllabus" ? "bg-emerald-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              ✅ Specialisations ({testsWithCommonSyllabus.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("practice_reuse")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${filterMode === "practice_reuse" ? "bg-blue-700 text-white" : "bg-white text-slate-600 hover:bg-slate-100"}`}
            >
              ✅ Practice Reuse ({testsWithPracticeReuse.length})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search test or exam…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-teal-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Tests Analysis List */}
      <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-white">
        {filteredTests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No mock tests match the selected filters.
          </div>
        ) : (
          filteredTests.map((item) => {
            const isExpanded = expandedTestId === item.test.id;
            const hasOverlaps = item.overlaps.length > 0;

            return (
              <div key={item.test.id} className="p-4 transition hover:bg-slate-50/40 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-700">
                        {item.examName}
                      </span>
                      {item.specializationName && (
                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                          {item.specializationName}
                        </span>
                      )}
                      {item.isSubjectTest ? (
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800">
                          Subject: {item.subjectName ?? "Subject Practice"}
                        </span>
                      ) : (
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          Full Paper
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-400">
                        {item.totalQuestions} Questions
                      </span>
                    </div>

                    <h3 className="mt-1 text-base font-bold text-slate-900">
                      {item.test.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Paper: {item.paperName}
                      {item.test.series_number && ` · Series #${item.test.series_number}`}
                    </p>
                  </div>

                  {/* Overlap Status Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.sameSeriesCount > 0 && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                        ⚠️ {item.sameSeriesCount} Qs Same-Series
                      </span>
                    )}

                    {item.commonSpecializationCount > 0 && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                        ✅ {item.commonSpecializationCount} Qs Shared Common
                      </span>
                    )}

                    {item.practiceReuseCount > 0 && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">
                        ✅ {item.practiceReuseCount} Qs Practice Reuse
                      </span>
                    )}

                    {!hasOverlaps && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                        {comparisonScope === "same_paper" ? "✨ 100% Unique in Paper Series" : "✨ 100% Unique"}
                      </span>
                    )}

                    {hasOverlaps && (
                      <button
                        type="button"
                        onClick={() => setExpandedTestId(isExpanded ? null : item.test.id)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        {isExpanded ? "Hide Overlaps ▲" : `View Overlaps (${item.overlaps.length}) ▼`}
                      </button>
                    )}

                    <Link
                      href={`/admin/mock-tests/${item.test.id}/edit`}
                      className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100"
                    >
                      Edit Test
                    </Link>
                  </div>
                </div>

                {/* Expanded Overlaps Breakdown */}
                {isExpanded && hasOverlaps && (
                  <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Tests sharing questions with &ldquo;{item.test.title}&rdquo;
                    </p>
                    <div className="mt-3 space-y-2.5">
                      {item.overlaps.map((overlap) => {
                        const isWarning = overlap.classification === "same_series";
                        const isCommon = overlap.classification === "common_specialization";
                        const isPractice = overlap.classification === "subject_practice";

                        return (
                          <div
                            key={overlap.targetTestId}
                            className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                              isWarning
                                ? "border-amber-200 bg-amber-50/50 text-amber-950"
                                : isCommon
                                ? "border-emerald-200 bg-emerald-50/40 text-emerald-950"
                                : isPractice
                                ? "border-blue-200 bg-blue-50/40 text-blue-950"
                                : "border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                    isWarning
                                      ? "bg-amber-200 text-amber-900"
                                      : isCommon
                                      ? "bg-emerald-200 text-emerald-900"
                                      : isPractice
                                      ? "bg-blue-200 text-blue-900"
                                      : "bg-slate-200 text-slate-800"
                                  }`}
                                >
                                  {isWarning
                                    ? "⚠️ Same-Series Overlap"
                                    : isCommon
                                    ? "✅ Common Specialisation (TG TET Syllabus)"
                                    : isPractice
                                    ? "✅ Practice Reuse (Subject to Paper)"
                                    : "General Overlap"}
                                </span>
                                {overlap.targetSpecializationName && (
                                  <span className="text-xs font-semibold text-slate-600">
                                    Specialisation: {overlap.targetSpecializationName}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-sm font-bold text-slate-900">
                                {overlap.targetTestTitle}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-600">
                                {overlap.explanation}
                              </p>
                            </div>

                            <div className="text-right">
                              <strong className="block text-base font-black">
                                {overlap.sharedCount} questions
                              </strong>
                              <span className="text-xs font-semibold text-slate-500">
                                {overlap.percentage}% of test
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Duplicate Question Text Scanner Modal */}
      {textScannerOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Question Bank Integrity
                </p>
                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Duplicate Question Text Scanner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setTextScannerOpen(false)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close dialog"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {scanningText ? (
                <div className="py-12 text-center">
                  <svg className="mx-auto h-8 w-8 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <p className="mt-3 text-sm font-bold text-slate-700">
                    Scanning active questions in the Question Bank…
                  </p>
                </div>
              ) : scannedTextResult ? (
                <div className="space-y-4">
                  {actionNotice && (
                    <div
                      className={`rounded-2xl p-4 text-xs font-bold ${
                        actionNotice.type === "success"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border border-red-200 bg-red-50 text-red-900"
                      }`}
                    >
                      {actionNotice.text}
                    </div>
                  )}

                  {(() => {
                    const totalUnassigned = scannedTextResult.groups.reduce(
                      (sum, g) =>
                        sum + g.items.filter((i) => i.assignedTests.length === 0).length,
                      0,
                    );

                    const exactDuplicatesCount = scannedTextResult.groups.filter(
                      (g) => g.hasIdenticalOptions,
                    ).length;
                    const differentOptionsCount = scannedTextResult.groups.filter(
                      (g) => !g.hasIdenticalOptions,
                    ).length;

                    const samePaperConflictsCount = scannedTextResult.groups.filter(
                      (g) => g.isSamePaperConflict,
                    ).length;

                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                          <div className="text-xs font-semibold text-slate-700">
                            Scanned <strong>{scannedTextResult.total}</strong> active questions. Found{" "}
                            <strong>{scannedTextResult.groups.length}</strong> matching question text{" "}
                            {scannedTextResult.groups.length === 1 ? "group" : "groups"}.
                            {samePaperConflictsCount > 0 && (
                              <span className="ml-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-900">
                                🚨 {samePaperConflictsCount} repeated in the same exam paper (e.g. Mock 1 & Mock 2)!
                              </span>
                            )}
                            {totalUnassigned > 0 && (
                              <span className="ml-1 text-amber-900 font-bold">
                                ({totalUnassigned} unassigned copies can be safely deleted).
                              </span>
                            )}
                          </div>

                          {totalUnassigned > 0 && (
                            <button
                              type="button"
                              onClick={handleDeleteAllUnassigned}
                              disabled={bulkDeleting}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                            >
                              {bulkDeleting ? "Cleaning up…" : `🗑️ Delete All ${totalUnassigned} Unassigned Duplicates`}
                            </button>
                          )}
                        </div>

                        {/* Filter Tabs: Same Paper Conflicts vs 100% Identical vs All */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTextDuplicateFilter("all")}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              textDuplicateFilter === "all"
                                ? "bg-slate-900 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            All Matches ({scannedTextResult.groups.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextDuplicateFilter("same_paper")}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              textDuplicateFilter === "same_paper"
                                ? "bg-rose-700 text-white shadow-sm"
                                : "border border-rose-300 bg-rose-50 text-rose-900 hover:bg-rose-100"
                            }`}
                          >
                            <span>🚨 Same-Paper Duplicates (Mock 1 & Mock 2)</span>
                            <span className="rounded-full bg-black/15 px-1.5 py-0.2 text-[10px] font-black">
                              {samePaperConflictsCount}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextDuplicateFilter("exact_only")}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              textDuplicateFilter === "exact_only"
                                ? "bg-red-700 text-white"
                                : "border border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
                            }`}
                          >
                            <span>⚠️ 100% True Duplicates (Same Options)</span>
                            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                              {exactDuplicatesCount}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTextDuplicateFilter("different_options")}
                            className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                              textDuplicateFilter === "different_options"
                                ? "bg-indigo-700 text-white"
                                : "border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                            }`}
                          >
                            <span>💡 Same Instruction, Different Options</span>
                            <span className="rounded-full bg-black/10 px-1.5 py-0.2 text-[10px]">
                              {differentOptionsCount}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {scannedTextResult.groups.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                        ✓
                      </div>
                      <h4 className="text-base font-bold text-slate-900">
                        No Duplicate Texts Found!
                      </h4>
                      <p className="mt-1 text-xs text-slate-500">
                        Every question in the Question Bank has distinct wording.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scannedTextResult.groups
                        .filter((g) => {
                          if (textDuplicateFilter === "same_paper") return g.isSamePaperConflict;
                          if (textDuplicateFilter === "exact_only") return g.hasIdenticalOptions;
                          if (textDuplicateFilter === "different_options") return !g.hasIdenticalOptions;
                          return true;
                        })
                        .map((group, idx) => {
                        const isGroupOptionsExpanded = expandedOptionGroups.has(group.normalizedKey);
                        const sample = group.items[0];

                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl border p-4 sm:p-5 ${
                              group.isSamePaperConflict
                                ? "border-rose-300 bg-rose-50/30 ring-1 ring-rose-200"
                                : group.hasIdenticalOptions
                                ? "border-amber-200/90 bg-amber-50/25"
                                : "border-indigo-100 bg-indigo-50/20"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                                    group.isSamePaperConflict
                                      ? "bg-rose-600 text-white"
                                      : group.hasIdenticalOptions
                                      ? "bg-amber-100 text-amber-900"
                                      : "bg-indigo-100 text-indigo-900"
                                  }`}
                                >
                                  {group.count} Records
                                </span>
                                {group.isSamePaperConflict && (
                                  <span className="rounded-md bg-rose-200 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-rose-950">
                                    🚨 Conflict: Repeated in Same Exam Paper (e.g. Mock 1 & Mock 2)
                                  </span>
                                )}
                                {group.hasIdenticalOptions ? (
                                  <span className="rounded-md bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-800">
                                    ⚠️ 100% Identical Questions & Options
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                                    💡 Same Prompt with Different Options (Legitimate Unique Questions)
                                  </span>
                                )}
                                <span className="text-xs font-semibold text-slate-500">
                                  Subject: {group.subjectNames.join(", ")}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleOptionDetails(group.normalizedKey)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                              >
                                {isGroupOptionsExpanded ? "▲ Hide Comparison" : "👁️ Compare All Copies' Options ▼"}
                              </button>
                            </div>

                            <p className="mt-2 text-sm font-semibold text-slate-900">
                              &ldquo;{group.questionTextSample}&rdquo;
                            </p>

                            {/* Question & Options Comparison Viewer */}
                            {isGroupOptionsExpanded && (
                              <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                                    Comparing All {group.items.length} Copies Side-by-Side:
                                  </span>
                                  <span className="text-[11px] text-slate-400">
                                    Verify whether the options, answers, or explanations differ
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  {group.items.map((item, itemIdx) => (
                                    <div
                                      key={item.id}
                                      className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200 pb-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                                            Copy #{itemIdx + 1}
                                          </span>
                                          <span className="font-mono text-[10px] text-slate-400">
                                            ID: {item.id.slice(0, 8)}…
                                          </span>
                                        </div>
                                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                          {item.subjectName}
                                        </span>
                                      </div>

                                      <div className="mt-2 flex-1 space-y-2">
                                        <div>
                                          <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Question:
                                          </span>
                                          <p className="font-semibold text-slate-900">{item.questionText}</p>
                                          {item.questionTextTe && (
                                            <p className="mt-0.5 font-medium text-slate-600">{item.questionTextTe}</p>
                                          )}
                                        </div>

                                        <div className="border-t border-slate-200/60 pt-2">
                                          <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Options & Answer:
                                          </span>
                                          <div className="mt-1 space-y-1">
                                            {(["A", "B", "C", "D"] as const).map((letter) => {
                                              const isCorrect = item.correctAnswer?.toUpperCase() === letter;
                                              const optEn =
                                                letter === "A"
                                                  ? item.optionA
                                                  : letter === "B"
                                                  ? item.optionB
                                                  : letter === "C"
                                                  ? item.optionC
                                                  : item.optionD;
                                              const optTe =
                                                letter === "A"
                                                  ? item.optionATe
                                                  : letter === "B"
                                                  ? item.optionBTe
                                                  : letter === "C"
                                                  ? item.optionCTe
                                                  : item.optionDTe;

                                              return (
                                                <div
                                                  key={letter}
                                                  className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
                                                    isCorrect
                                                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-bold"
                                                      : "border-slate-200 bg-white text-slate-700"
                                                  }`}
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-bold text-[11px]">Option {letter}</span>
                                                    {isCorrect && (
                                                      <span className="rounded bg-emerald-200 px-1.5 py-0.2 text-[9px] font-black uppercase text-emerald-900">
                                                        ✓ Correct
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[11px]">{optEn}</p>
                                                  {optTe && (
                                                    <p className="text-[10px] font-normal text-slate-500">{optTe}</p>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {(item.explanation || item.explanationTe) && (
                                          <div className="rounded-lg border border-amber-100 bg-amber-50/70 p-2 text-[10px] text-amber-950">
                                            <span className="font-bold uppercase text-amber-800">Explanation:</span>
                                            {item.explanation && <p className="mt-0.5">{item.explanation}</p>}
                                            {item.explanationTe && <p className="mt-0.5 text-amber-900">{item.explanationTe}</p>}
                                          </div>
                                        )}
                                      </div>

                                      <div className="mt-3 border-t border-slate-200 pt-2">
                                        {item.assignedTests.length > 0 ? (
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Assigned In:</span>
                                            <div className="flex flex-wrap gap-1">
                                              {item.assignedTests.map((t) => (
                                                <span
                                                  key={t.id}
                                                  className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-900 border border-emerald-200"
                                                >
                                                  {t.examName} · {t.paperName}: <strong>{t.title}</strong>
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-amber-800 font-medium">
                                              Unassigned (Safe to delete)
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteUnassigned(item.id, group.normalizedKey)}
                                              disabled={deletingId === item.id || bulkDeleting}
                                              className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                            >
                                              {deletingId === item.id ? "Deleting…" : "🗑️ Delete Copy"}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Copies Summary List */}
                            <div className="mt-3 divide-y divide-amber-100 rounded-xl border border-amber-100 bg-white text-xs">
                              {group.items.map((item, itemIdx) => {
                                const isItemExpanded = expandedItemIds.has(item.id);

                                return (
                                  <div key={item.id} className="p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                                            #{itemIdx + 1}
                                          </span>
                                          <span className="font-mono text-[10px] font-bold text-slate-400">
                                            ID: {item.id.slice(0, 8)}…
                                          </span>
                                          <span className="font-medium text-slate-700">
                                            Subject: {item.subjectName}
                                          </span>
                                          <span className="text-[10px] text-slate-400">
                                            Added: {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                          </span>
                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                          {item.assignedTests.length > 0 ? (
                                            item.assignedTests.map((t) => (
                                              <span
                                                key={t.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-900 border border-emerald-200"
                                              >
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                <span className="text-slate-500 font-medium">{t.examName} · {t.paperName}:</span>
                                                <span>{t.title}</span>
                                              </span>
                                            ))
                                          ) : (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-100/70 px-2 py-0.5 text-xs font-semibold text-amber-900">
                                              Not assigned to any test (Extra Copy)
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleItemDetails(item.id)}
                                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                                        >
                                          {isItemExpanded ? "▲ Hide Options" : "👁️ Options"}
                                        </button>

                                        {item.assignedTests.length === 0 ? (
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteUnassigned(item.id, group.normalizedKey)}
                                            disabled={deletingId === item.id || bulkDeleting}
                                            className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                                          >
                                            {deletingId === item.id ? "Deleting…" : "🗑️ Delete Unused Copy"}
                                          </button>
                                        ) : (
                                          <span className="text-[11px] font-bold text-emerald-800">
                                            🛡️ Kept & Protected
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Individual copy option preview dropdown */}
                                    {isItemExpanded && (
                                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                          {(["A", "B", "C", "D"] as const).map((letter) => {
                                            const isCorrect = item.correctAnswer?.toUpperCase() === letter;
                                            const optEn =
                                              letter === "A"
                                                ? item.optionA
                                                : letter === "B"
                                                ? item.optionB
                                                : letter === "C"
                                                ? item.optionC
                                                : item.optionD;
                                            const optTe =
                                              letter === "A"
                                                ? item.optionATe
                                                : letter === "B"
                                                ? item.optionBTe
                                                : letter === "C"
                                                ? item.optionCTe
                                                : item.optionDTe;

                                            return (
                                              <div
                                                key={letter}
                                                className={`rounded-lg border p-2 text-xs ${
                                                  isCorrect
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-bold"
                                                    : "border-slate-200 bg-white text-slate-700"
                                                }`}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="font-black text-[11px]">Option {letter}</span>
                                                  {isCorrect && (
                                                    <span className="rounded bg-emerald-200 px-1.5 py-0.2 text-[9px] font-black uppercase text-emerald-900">
                                                      ✓ Correct
                                                    </span>
                                                  )}
                                                </div>
                                                <p className="mt-0.5 text-xs">{optEn}</p>
                                                {optTe && (
                                                  <p className="mt-0.5 text-[10px] text-slate-500">{optTe}</p>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {(item.explanation || item.explanationTe) && (
                                          <div className="mt-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-[10px] text-amber-950">
                                            <span className="font-bold uppercase text-amber-800">Explanation:</span>
                                            {item.explanation && <p className="mt-0.5">{item.explanation}</p>}
                                            {item.explanationTe && <p className="mt-0.5 text-amber-900">{item.explanationTe}</p>}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex justify-end border-t border-slate-100 p-4">
              <button
                type="button"
                onClick={() => setTextScannerOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
