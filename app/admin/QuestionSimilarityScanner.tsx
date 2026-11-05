"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  scanQuestionTextDuplicates,
  deleteUnassignedQuestion,
  deleteBulkUnassignedDuplicates,
  type DuplicateQuestionItem,
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

// Reusable SVG icons for professional, human-crafted design
function IconShield({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function IconAlertTriangle({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

function IconCheck({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

function IconCopy({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
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

function IconTrash({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function IconRefresh({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
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

function IconExternalLink({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

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
  // Top-level tabs: Test Series Audit vs Question Bank Deduplication
  const [activeTab, setActiveTab] = useState<"test_audit" | "deduplication">("test_audit");

  // Filter states
  const [selectedExamId, setSelectedExamId] = useState<string>("all");
  const [selectedPaperId, setSelectedPaperId] = useState<string>("all");
  const [comparisonScope, setComparisonScope] = useState<"same_paper" | "same_exam" | "all">("same_paper");
  const [filterMode, setFilterMode] = useState<"all" | "warnings" | "common_syllabus" | "practice_reuse" | "unique_only">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  // Text duplicate scanner state
  const [scanningText, setScanningText] = useState(false);
  const [scannedTextResult, setScannedTextResult] = useState<{
    total: number;
    groups: DuplicateTextGroup[];
    scopeLabel?: string;
  } | null>(null);
  const [expandedOptionGroups, setExpandedOptionGroups] = useState<Set<string>>(new Set());
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());
  const [textDuplicateFilter, setTextDuplicateFilter] = useState<"all" | "same_paper" | "exact_only" | "different_options">("same_paper");

  // Deletion and confirmation modal state (replaces window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "single" | "bulk";
    questionId?: string;
    groupKey?: string;
    questionText?: string;
    count?: number;
  }>({ isOpen: false, type: "single" });
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Lookup maps
  const examMap = useMemo(() => new Map(exams.map((e) => [e.id, e.name])), [exams]);
  const paperMap = useMemo(() => new Map(papers.map((p) => [p.id, p])), [papers]);
  const specMap = useMemo(() => new Map(specializations.map((s) => [s.id, s.name])), [specializations]);
  const subjectMap = useMemo(() => new Map(subjects.map((s) => [s.id, s.name])), [subjects]);

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
      const specializationName = paper?.specialization_id ? specMap.get(paper.specialization_id) : undefined;
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

          // Scope filtering
          if (comparisonScope === "same_paper") {
            if (otherTest.paper_id !== test.paper_id) continue;
          } else if (comparisonScope === "same_exam") {
            const otherPaper = paperMap.get(otherTest.paper_id);
            if (!paper || !otherPaper || paper.exam_group_id !== otherPaper.exam_group_id) {
              continue;
            }
          }

          const otherPaper = paperMap.get(otherTest.paper_id);
          const otherExamName = otherPaper ? examMap.get(otherPaper.exam_group_id) ?? "Unknown Exam" : "Unknown Exam";
          const otherSpecializationName = otherPaper?.specialization_id ? specMap.get(otherPaper.specialization_id) : undefined;
          const otherQuestions = testQuestionsMap.get(otherTest.id) ?? new Set<string>();

          let shared = 0;
          for (const qId of questions) {
            if (otherQuestions.has(qId)) {
              shared += 1;
            }
          }

          if (shared > 0) {
            const percentage = Math.round((shared / totalQuestions) * 100);
            const otherIsSubjectTest = Boolean(otherTest.subject_id);

            let classification: OverlapClassification;
            let explanation: string;

            if (isSubjectTest !== otherIsSubjectTest) {
              classification = "subject_practice";
              explanation = "Subject practice test questions reused in full paper test (Normal revision practice).";
              practiceReuseCount += shared;
            } else if (
              paper &&
              otherPaper &&
              paper.exam_group_id === otherPaper.exam_group_id &&
              paper.specialization_id !== otherPaper.specialization_id &&
              (paper.specialization_id || otherPaper.specialization_id)
            ) {
              classification = "common_specialization";
              explanation = "Curriculum-aligned common syllabus shared across streams (e.g., CDP and Languages in TET).";
              commonSpecializationCount += shared;
            } else if (paper && otherPaper && paper.id === otherPaper.id) {
              classification = "same_series";
              explanation = `Repeated questions within the same paper series (${test.title} vs ${otherTest.title}). Students taking both tests will see duplicated questions.`;
              sameSeriesCount += shared;
            } else {
              classification = "cross_exam";
              explanation = "Questions shared between separate exam mock tests.";
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

  const examPapers = useMemo(() => {
    if (selectedExamId === "all") return papers;
    return papers.filter((p) => p.exam_group_id === selectedExamId);
  }, [papers, selectedExamId]);

  // Filtered view
  const filteredTests = useMemo(() => {
    return analyzedTests.filter((item) => {
      const paper = paperMap.get(item.test.paper_id);
      if (selectedExamId !== "all" && paper?.exam_group_id !== selectedExamId) {
        return false;
      }
      if (selectedPaperId !== "all" && item.test.paper_id !== selectedPaperId) {
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
  }, [analyzedTests, selectedExamId, selectedPaperId, filterMode, searchQuery, paperMap]);

  const currentScopeLabel = useMemo(() => {
    if (selectedPaperId !== "all") {
      const p = paperMap.get(selectedPaperId);
      const e = p ? examMap.get(p.exam_group_id) : undefined;
      return e ? `${e} · ${p?.name}` : (p?.name ?? "Selected Paper");
    }
    if (selectedExamId !== "all") {
      return `${examMap.get(selectedExamId) ?? "Selected Exam"} (All Papers)`;
    }
    return "All Exams & Papers";
  }, [selectedExamId, selectedPaperId, paperMap, examMap]);

  // Handle run text duplicate scanner
  const handleRunTextScan = async (overrideScope?: {
    examGroupId?: string;
    paperId?: string;
    scopeLabel?: string;
  }) => {
    setScanningText(true);
    setActionNotice(null);
    const scopeToRun = overrideScope
      ? {
          examGroupId: overrideScope.examGroupId,
          paperId: overrideScope.paperId,
        }
      : {
          examGroupId: selectedExamId !== "all" ? selectedExamId : undefined,
          paperId: selectedPaperId !== "all" ? selectedPaperId : undefined,
        };
    const label = overrideScope?.scopeLabel ?? currentScopeLabel;
    try {
      const res = await scanQuestionTextDuplicates(scopeToRun);
      if (res.success) {
        setScannedTextResult({
          total: res.totalQuestionsScanned,
          groups: res.duplicateGroups,
          scopeLabel: label,
        });
        setActiveTab("deduplication");
      } else {
        setActionNotice({ type: "error", text: res.message ?? "Scan failed to execute." });
      }
    } catch (e) {
      console.error(e);
      setActionNotice({ type: "error", text: "An error occurred while scanning questions." });
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

  // Safe deletion handlers via custom modal
  const handleConfirmExecuteDeletion = async () => {
    if (!confirmModal.isOpen) return;
    setIsDeleting(true);
    setActionNotice(null);

    try {
      if (confirmModal.type === "single" && confirmModal.questionId && confirmModal.groupKey) {
        const qId = confirmModal.questionId;
        const gKey = confirmModal.groupKey;
        const res = await deleteUnassignedQuestion(qId);
        if (res.success) {
          setActionNotice({ type: "success", text: res.message });
          setScannedTextResult((prev) => {
            if (!prev) return null;
            const nextGroups = prev.groups
              .map((g) => {
                if (g.normalizedKey !== gKey) return g;
                const nextItems = g.items.filter((i) => i.id !== qId);
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
              scopeLabel: prev.scopeLabel,
            };
          });
        } else {
          setActionNotice({ type: "error", text: res.message });
        }
      } else if (confirmModal.type === "bulk" && scannedTextResult) {
        const allUnassignedIds: string[] = [];
        for (const g of scannedTextResult.groups) {
          for (const item of g.items) {
            if (item.assignedTests.length === 0) {
              allUnassignedIds.push(item.id);
            }
          }
        }
        if (allUnassignedIds.length > 0) {
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
                scopeLabel: prev.scopeLabel,
              };
            });
          } else {
            setActionNotice({ type: "error", text: res.message });
          }
        }
      }
    } catch {
      setActionNotice({ type: "error", text: "Failed to execute delete operation." });
    } finally {
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, type: "single" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Metric Cards Banner */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Status Card */}
        <div
          className={`rounded-2xl border p-4 transition ${
            testsWithSameSeriesWarnings.length > 0
              ? "border-rose-200 bg-rose-50/50"
              : "border-slate-200/80 bg-white"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Series Collision Status
            </p>
            {testsWithSameSeriesWarnings.length > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                <IconAlertTriangle className="h-3 w-3" />
              </span>
            ) : (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <IconCheck className="h-3 w-3" />
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-2xl font-bold tracking-tight ${
              testsWithSameSeriesWarnings.length > 0 ? "text-rose-950" : "text-slate-900"
            }`}
          >
            {testsWithSameSeriesWarnings.length > 0
              ? `${testsWithSameSeriesWarnings.length} Same-Series Overlaps`
              : "Zero Series Collisions"}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {testsWithSameSeriesWarnings.length > 0
              ? "Repeated questions found between Mock 1 & Mock 2"
              : "All mock test series contain distinct questions"}
          </p>
        </div>

        {/* Valid Curriculum Overlaps Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Curriculum Aligned
            </p>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-50 text-teal-700">
              <IconShield className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {testsWithCommonSyllabus.length} Tests
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Intentional common syllabus across streams (e.g. TET CDP)
          </p>
        </div>

        {/* Subject Practice Reuses Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Practice Reuses
            </p>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-sky-700">
              <IconLayers className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {testsWithPracticeReuse.length} Tests
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Subject-wise questions reused in full paper tests
          </p>
        </div>

        {/* Total Audited Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Audited
            </p>
            <span className="text-xs font-semibold text-slate-400">Indexed</span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {totalAnalyzedTests} Tests
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Active papers across {exams.length} exam categories
          </p>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold ${
            actionNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === "success" ? (
              <IconCheck className="h-4 w-4 text-emerald-700" />
            ) : (
              <IconAlertTriangle className="h-4 w-4 text-rose-700" />
            )}
            <span>{actionNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-slate-500 hover:text-slate-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Tabbed Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "test_audit"}
              onClick={() => setActiveTab("test_audit")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "test_audit"
                  ? "bg-teal-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <IconLayers className="h-4 w-4" />
              <span>Mock Test Overlap Matrix</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "test_audit" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {filteredTests.length}
              </span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "deduplication"}
              onClick={() => {
                setActiveTab("deduplication");
                if (!scannedTextResult && !scanningText) {
                  handleRunTextScan();
                }
              }}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                activeTab === "deduplication"
                  ? "bg-teal-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <IconCopy className="h-4 w-4" />
              <span>Question Bank Deduplication</span>
              {scannedTextResult && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === "deduplication"
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {scannedTextResult.groups.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "deduplication" && (
              <button
                type="button"
                onClick={() => handleRunTextScan()}
                disabled={scanningText}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
              >
                <IconRefresh className={`h-3.5 w-3.5 ${scanningText ? "animate-spin" : ""}`} />
                <span>Re-scan Scope</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* TAB 1: MOCK TEST OVERLAP MATRIX                             */}
        {/* ============================================================ */}
        {activeTab === "test_audit" && (
          <div className="p-6">
            {/* Scope & Filtering Bar */}
            <div className="space-y-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Audit Scope:
                  </span>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
                    <button
                      type="button"
                      onClick={() => setComparisonScope("same_paper")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        comparisonScope === "same_paper"
                          ? "bg-teal-800 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Same Paper Series (Recommended)
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonScope("same_exam")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        comparisonScope === "same_exam"
                          ? "bg-teal-800 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Same Exam Streams
                    </button>
                    <button
                      type="button"
                      onClick={() => setComparisonScope("all")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        comparisonScope === "all"
                          ? "bg-teal-800 text-white"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      All Exams
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  {comparisonScope === "same_paper" &&
                    "Comparing mock tests within the exact same paper series to catch repeated questions between test numbers."}
                  {comparisonScope === "same_exam" &&
                    "Evaluating mock tests across papers and specializations within the same exam category."}
                  {comparisonScope === "all" &&
                    "Cross-referencing mock tests across the entire platform repository."}
                </div>
              </div>

              {/* Exam, Paper, Filter Buttons & Search */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    id="similarity-exam-select"
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      setSelectedPaperId("all");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="all">All Exams ({exams.length})</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>

                  {selectedExamId !== "all" && examPapers.length > 0 && (
                    <select
                      id="similarity-paper-select"
                      value={selectedPaperId}
                      onChange={(e) => setSelectedPaperId(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none"
                    >
                      <option value="all">All Papers ({examPapers.length})</option>
                      {examPapers.map((paper) => (
                        <option key={paper.id} value={paper.id}>
                          {paper.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="h-4 w-px bg-slate-200" />

                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFilterMode("all")}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        filterMode === "all"
                          ? "bg-slate-900 text-white"
                          : "bg-white text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      All Tests
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("warnings")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        filterMode === "warnings"
                          ? "bg-rose-700 text-white"
                          : "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
                      }`}
                    >
                      <span>Series Collisions</span>
                      <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                        {testsWithSameSeriesWarnings.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("common_syllabus")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        filterMode === "common_syllabus"
                          ? "bg-teal-800 text-white"
                          : "border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100"
                      }`}
                    >
                      <span>Curriculum Aligned</span>
                      <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                        {testsWithCommonSyllabus.length}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterMode("practice_reuse")}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        filterMode === "practice_reuse"
                          ? "bg-sky-800 text-white"
                          : "border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
                      }`}
                    >
                      <span>Practice Reuses</span>
                      <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                        {testsWithPracticeReuse.length}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Search Field */}
                <div className="relative w-full sm:w-60">
                  <IconSearch className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search test or exam…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 shadow-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white">
              {filteredTests.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-sm font-semibold text-slate-800">No mock tests found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Try adjusting the scope filters or clear your search term.
                  </p>
                </div>
              ) : (
                filteredTests.map((item) => {
                  const isExpanded = expandedTestId === item.test.id;
                  const hasOverlaps = item.overlaps.length > 0;

                  return (
                    <div key={item.test.id} className="p-4 transition hover:bg-slate-50/50 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                              {item.examName}
                            </span>
                            {item.specializationName && (
                              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
                                {item.specializationName}
                              </span>
                            )}
                            {item.isSubjectTest ? (
                              <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-800 border border-purple-200/60">
                                Subject: {item.subjectName ?? "Subject Practice"}
                              </span>
                            ) : (
                              <span className="rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 border border-sky-200/60">
                                Full Paper
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {item.totalQuestions} Questions
                            </span>
                          </div>

                          <h3 className="mt-1.5 text-base font-bold text-slate-900">
                            {item.test.title}
                          </h3>
                          <p className="text-xs text-slate-500">
                            Paper: {item.paperName}
                            {item.test.series_number && ` · Series #${item.test.series_number}`}
                          </p>
                        </div>

                        {/* Status Badges & Controls */}
                        <div className="flex flex-wrap items-center gap-2">
                          {item.sameSeriesCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-800">
                              <IconAlertTriangle className="h-3 w-3 text-rose-600" />
                              <span>{item.sameSeriesCount} Qs Series Collision</span>
                            </span>
                          )}

                          {item.commonSpecializationCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                              <IconShield className="h-3 w-3 text-teal-600" />
                              <span>{item.commonSpecializationCount} Qs Common Syllabus</span>
                            </span>
                          )}

                          {item.practiceReuseCount > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                              <IconLayers className="h-3 w-3 text-sky-600" />
                              <span>{item.practiceReuseCount} Qs Practice Reuse</span>
                            </span>
                          )}

                          {!hasOverlaps && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                              <IconCheck className="h-3 w-3 text-emerald-600" />
                              <span>100% Unique Content</span>
                            </span>
                          )}

                          {hasOverlaps && (
                            <button
                              type="button"
                              onClick={() => setExpandedTestId(isExpanded ? null : item.test.id)}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                            >
                              <span>{isExpanded ? "Hide Details" : `Inspect Overlaps (${item.overlaps.length})`}</span>
                              {isExpanded ? (
                                <IconChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <IconChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          <Link
                            href={`/admin/mock-tests/${item.test.id}/edit`}
                            className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-100"
                          >
                            <span>Edit Test</span>
                            <IconExternalLink className="h-3 w-3 opacity-70" />
                          </Link>
                        </div>
                      </div>

                      {/* Expanded Overlaps Breakdown */}
                      {isExpanded && hasOverlaps && (
                        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Tests sharing questions with &ldquo;{item.test.title}&rdquo;
                          </p>
                          <div className="mt-3 space-y-2">
                            {item.overlaps.map((overlap) => {
                              const isWarning = overlap.classification === "same_series";
                              const isCommon = overlap.classification === "common_specialization";
                              const isPractice = overlap.classification === "subject_practice";

                              return (
                                <div
                                  key={overlap.targetTestId}
                                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${
                                    isWarning
                                      ? "border-rose-200 bg-rose-50/40 text-rose-950"
                                      : isCommon
                                      ? "border-teal-200 bg-teal-50/40 text-teal-950"
                                      : isPractice
                                      ? "border-sky-200 bg-sky-50/40 text-sky-950"
                                      : "border-slate-200 bg-white text-slate-800"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                                          isWarning
                                            ? "bg-rose-100 text-rose-900 border border-rose-200"
                                            : isCommon
                                            ? "bg-teal-100 text-teal-900 border border-teal-200"
                                            : isPractice
                                            ? "bg-sky-100 text-sky-900 border border-sky-200"
                                            : "bg-slate-200 text-slate-800"
                                        }`}
                                      >
                                        {isWarning
                                          ? "Series Conflict"
                                          : isCommon
                                          ? "Common Specialisation (Syllabus Aligned)"
                                          : isPractice
                                          ? "Subject Practice Reuse"
                                          : "General Overlap"}
                                      </span>
                                      {overlap.targetSpecializationName && (
                                        <span className="text-xs text-slate-500">
                                          Stream: {overlap.targetSpecializationName}
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
                                    <strong className="block text-sm font-bold text-slate-900">
                                      {overlap.sharedCount} questions
                                    </strong>
                                    <span className="text-xs text-slate-500">
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
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: QUESTION BANK DEDUPLICATION WORKSPACE                */}
        {/* ============================================================ */}
        {activeTab === "deduplication" && (
          <div className="p-6">
            {/* Control & Run Audit Header */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Question Bank Content Deduplication
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Scans questions for identical wording, matches option sets, and flags duplicate content across active tests.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedExamId}
                    onChange={(e) => {
                      setSelectedExamId(e.target.value);
                      setSelectedPaperId("all");
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none"
                  >
                    <option value="all">All Exams ({exams.length})</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>

                  {selectedExamId !== "all" && examPapers.length > 0 && (
                    <select
                      value={selectedPaperId}
                      onChange={(e) => setSelectedPaperId(e.target.value)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-xs focus:border-teal-500 focus:outline-none"
                    >
                      <option value="all">All Papers ({examPapers.length})</option>
                      {examPapers.map((paper) => (
                        <option key={paper.id} value={paper.id}>
                          {paper.name}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => handleRunTextScan()}
                    disabled={scanningText}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-900 disabled:opacity-50"
                  >
                    {scanningText ? (
                      <>
                        <IconRefresh className="h-3.5 w-3.5 animate-spin" />
                        <span>Scanning {currentScopeLabel}…</span>
                      </>
                    ) : (
                      <>
                        <IconSearch className="h-3.5 w-3.5" />
                        <span>Run Duplicate Audit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
            {scanningText ? (
              <div className="py-16 text-center">
                <IconRefresh className="mx-auto h-8 w-8 animate-spin text-teal-700" />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Scanning Question Bank for Duplicates…
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Evaluating questions in {currentScopeLabel}. This takes only a few seconds.
                </p>
              </div>
            ) : scannedTextResult ? (
              <div className="mt-6 space-y-4">
                {(() => {
                  const totalUnassigned = scannedTextResult.groups.reduce(
                    (sum, g) => sum + g.items.filter((i) => i.assignedTests.length === 0).length,
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
                    <>
                      {/* Summary Metrics Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
                        <div className="text-xs text-slate-700">
                          Scanned <strong>{scannedTextResult.total}</strong> active questions
                          {scannedTextResult.scopeLabel ? ` in ${scannedTextResult.scopeLabel}` : ""}.
                          Found <strong>{scannedTextResult.groups.length}</strong> duplicate wording groups.
                          {samePaperConflictsCount > 0 && (
                            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800">
                              <IconAlertTriangle className="h-3 w-3" />
                              {samePaperConflictsCount} repeated in same paper series
                            </span>
                          )}
                          {totalUnassigned > 0 && (
                            <span className="ml-2 font-medium text-slate-600">
                              ({totalUnassigned} unassigned copies eligible for cleanup)
                            </span>
                          )}
                        </div>

                        {totalUnassigned > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModal({
                                isOpen: true,
                                type: "bulk",
                                count: totalUnassigned,
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-800 shadow-xs transition hover:bg-rose-100"
                          >
                            <IconTrash className="h-3.5 w-3.5" />
                            <span>Purge All {totalUnassigned} Unassigned Duplicates</span>
                          </button>
                        )}
                      </div>

                      {/* Filter Pills */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setTextDuplicateFilter("all")}
                          className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
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
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            textDuplicateFilter === "same_paper"
                              ? "bg-rose-800 text-white shadow-xs"
                              : "border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100"
                          }`}
                        >
                          <IconAlertTriangle className="h-3 w-3" />
                          <span>Same-Paper Conflicts</span>
                          <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                            {samePaperConflictsCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTextDuplicateFilter("exact_only")}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            textDuplicateFilter === "exact_only"
                              ? "bg-amber-800 text-white"
                              : "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                          }`}
                        >
                          <span>100% Identical Questions & Options</span>
                          <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                            {exactDuplicatesCount}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTextDuplicateFilter("different_options")}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                            textDuplicateFilter === "different_options"
                              ? "bg-indigo-800 text-white"
                              : "border border-indigo-200 bg-indigo-50 text-indigo-800 hover:bg-indigo-100"
                          }`}
                        >
                          <span>Same Prompt, Different Options</span>
                          <span className="rounded-full bg-black/10 px-1.5 text-[10px]">
                            {differentOptionsCount}
                          </span>
                        </button>
                      </div>
                    </>
                  );
                })()}

                {/* Duplicates Listing */}
                {scannedTextResult.groups.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <IconCheck className="h-5 w-5" />
                    </span>
                    <h4 className="mt-3 text-sm font-bold text-slate-900">
                      No Duplicate Questions Found
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      All questions in the active scope have distinct phrasing and options.
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

                        return (
                          <div
                            key={idx}
                            className={`rounded-2xl border p-5 transition ${
                              group.isSamePaperConflict
                                ? "border-rose-200 bg-rose-50/20"
                                : group.hasIdenticalOptions
                                ? "border-amber-200/80 bg-amber-50/20"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800">
                                  {group.count} Records
                                </span>
                                {group.isSamePaperConflict && (
                                  <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-900">
                                    <IconAlertTriangle className="h-3 w-3" />
                                    <span>Same-Paper Conflict (Repeated in Series)</span>
                                  </span>
                                )}
                                {group.hasIdenticalOptions ? (
                                  <span className="rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                                    100% Identical Questions & Options
                                  </span>
                                ) : (
                                  <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-900">
                                    Same Prompt with Alternative Options
                                  </span>
                                )}
                                <span className="text-xs text-slate-500">
                                  Subject: {group.subjectNames.join(", ")}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => toggleOptionDetails(group.normalizedKey)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
                              >
                                <span>{isGroupOptionsExpanded ? "Hide Comparison" : "Compare Copies Side-by-Side"}</span>
                                {isGroupOptionsExpanded ? (
                                  <IconChevronUp className="h-3.5 w-3.5" />
                                ) : (
                                  <IconChevronDown className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Question Text Sample */}
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-slate-900">
                                &ldquo;{group.questionTextSample}&rdquo;
                              </p>
                              {group.questionTextTeSample && (
                                <p className="mt-1 text-xs text-slate-600">
                                  {group.questionTextTeSample}
                                </p>
                              )}
                            </div>

                            {/* Side-by-Side Question & Options Comparison */}
                            {isGroupOptionsExpanded && (
                              <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Comparing All {group.items.length} Copies:
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    Verify whether options, answers, or explanations differ
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                  {group.items.map((item, itemIdx) => (
                                    <div
                                      key={item.id}
                                      className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-xs"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-800">
                                            Copy #{itemIdx + 1}
                                          </span>
                                          <span className="font-mono text-[10px] text-slate-400">
                                            ID: {item.id.slice(0, 8)}…
                                          </span>
                                        </div>
                                        <span className="rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-800 border border-teal-200/60">
                                          {item.subjectName}
                                        </span>
                                      </div>

                                      <div className="mt-2.5 flex-1 space-y-2">
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Question Text:
                                          </span>
                                          <p className="mt-0.5 font-medium text-slate-900">{item.questionText}</p>
                                          {item.questionTextTe && (
                                            <p className="mt-0.5 text-slate-600">{item.questionTextTe}</p>
                                          )}
                                        </div>

                                        <div className="border-t border-slate-200/60 pt-2">
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Options & Answer:
                                          </span>
                                          <div className="mt-1.5 space-y-1">
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
                                                      ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                                                      : "border-slate-200 bg-white text-slate-700"
                                                  }`}
                                                >
                                                  <div className="flex items-center justify-between">
                                                    <span className="font-semibold text-[11px]">Option {letter}</span>
                                                    {isCorrect && (
                                                      <span className="inline-flex items-center gap-0.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                                                        <IconCheck className="h-2.5 w-2.5" />
                                                        <span>Correct</span>
                                                      </span>
                                                    )}
                                                  </div>
                                                  <p className="text-[11px] mt-0.5">{optEn}</p>
                                                  {optTe && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5">{optTe}</p>
                                                  )}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {(item.explanation || item.explanationTe) && (
                                          <div className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] text-slate-700">
                                            <span className="font-bold text-[10px] uppercase text-slate-400">Explanation:</span>
                                            {item.explanation && <p className="mt-0.5">{item.explanation}</p>}
                                            {item.explanationTe && <p className="mt-0.5 text-slate-600">{item.explanationTe}</p>}
                                          </div>
                                        )}
                                      </div>

                                      {/* Assigned Tests vs Safe to Delete Action */}
                                      <div className="mt-3 border-t border-slate-200/80 pt-2.5">
                                        {item.assignedTests.length > 0 ? (
                                          <div className="space-y-1">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                              Assigned in:
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                              {item.assignedTests.map((t) => (
                                                <span
                                                  key={t.id}
                                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-900 border border-emerald-200/80"
                                                >
                                                  <IconShield className="h-2.5 w-2.5 text-emerald-700" />
                                                  <span>
                                                    {t.examName && t.paperName ? `${t.examName} · ${t.paperName}: ` : ""}
                                                    <strong>{t.title}</strong>
                                                  </span>
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] text-amber-800 font-medium">
                                              Unassigned copy (Safe to delete)
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                setConfirmModal({
                                                  isOpen: true,
                                                  type: "single",
                                                  questionId: item.id,
                                                  groupKey: group.normalizedKey,
                                                  questionText: item.questionText,
                                                })
                                              }
                                              className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                              <IconTrash className="h-3 w-3" />
                                              <span>Delete Copy</span>
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
                            <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white text-xs">
                              {group.items.map((item, itemIdx) => {
                                const isItemExpanded = expandedItemIds.has(item.id);

                                return (
                                  <div key={item.id} className="p-3">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-700">
                                            #{itemIdx + 1}
                                          </span>
                                          <span className="font-mono text-[10px] text-slate-400">
                                            ID: {item.id.slice(0, 8)}…
                                          </span>
                                          <span className="font-medium text-slate-700">
                                            {item.subjectName}
                                          </span>
                                          <span className="text-[11px] text-slate-400">
                                            Added {new Date(item.createdAt).toLocaleDateString("en-IN")}
                                          </span>
                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                          {item.assignedTests.length > 0 ? (
                                            item.assignedTests.map((t) => (
                                              <span
                                                key={t.id}
                                                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-900 border border-emerald-200/80"
                                              >
                                                <IconShield className="h-2.5 w-2.5 text-emerald-700" />
                                                {t.examName && t.paperName ? (
                                                  <span className="text-slate-500 font-normal">
                                                    {t.examName} · {t.paperName}:
                                                  </span>
                                                ) : null}
                                                <span>{t.title}</span>
                                              </span>
                                            ))
                                          ) : (
                                            <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-900 border border-amber-200/60">
                                              Unassigned (Safe to delete)
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => toggleItemDetails(item.id)}
                                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                          {isItemExpanded ? "Hide Details" : "Options"}
                                        </button>

                                        {item.assignedTests.length === 0 ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setConfirmModal({
                                                isOpen: true,
                                                type: "single",
                                                questionId: item.id,
                                                groupKey: group.normalizedKey,
                                                questionText: item.questionText,
                                              })
                                            }
                                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                                          >
                                            <IconTrash className="h-3 w-3" />
                                            <span>Delete Copy</span>
                                          </button>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                                            <IconShield className="h-3 w-3 text-emerald-600" />
                                            <span>Protected in Test</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Individual copy dropdown */}
                                    {isItemExpanded && (
                                      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
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
                                                    ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                                                    : "border-slate-200 bg-white text-slate-700"
                                                }`}
                                              >
                                                <div className="flex items-center justify-between">
                                                  <span className="font-semibold text-[11px]">Option {letter}</span>
                                                  {isCorrect && (
                                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-900">
                                                      Correct
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
            ) : (
              <div className="mt-8 rounded-2xl border border-slate-200/80 bg-slate-50/40 p-10 text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100/80 text-teal-800">
                  <IconSearch className="h-6 w-6" />
                </span>
                <h4 className="mt-4 text-base font-bold text-slate-900">
                  Run Question Bank Content Deduplication
                </h4>
                <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-600">
                  Audit active questions to discover duplicate text, check whether options are identical or variable, and safely clean up unused copies.
                </p>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handleRunTextScan()}
                    disabled={scanningText}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-900 disabled:opacity-50"
                  >
                    <IconSearch className="h-4 w-4" />
                    <span>Run Duplicate Audit for {currentScopeLabel}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accessible In-App Deletion Confirmation Modal (No window.confirm) */}
      {confirmModal.isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <IconTrash className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {confirmModal.type === "single"
                    ? "Delete Unassigned Question?"
                    : `Purge ${confirmModal.count} Unassigned Duplicates?`}
                </h3>
                <p className="text-xs text-slate-500">Permanent Question Bank cleanup</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600">
              {confirmModal.type === "single" ? (
                <>
                  <p className="font-semibold text-slate-800">
                    &ldquo;{confirmModal.questionText?.slice(0, 100)}…&rdquo;
                  </p>
                  <p className="mt-2 text-slate-500">
                    This unassigned copy will be permanently deleted. All active questions assigned to mock tests are strictly protected.
                  </p>
                </>
              ) : (
                <p className="text-slate-600">
                  This will safely delete all <strong>{confirmModal.count}</strong> unassigned duplicate questions. Any question with active mock test assignments or student attempt history will be kept completely safe.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setConfirmModal({ isOpen: false, type: "single" })}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmExecuteDeletion}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-800 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <IconRefresh className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <>
                    <IconTrash className="h-3.5 w-3.5" />
                    <span>Confirm & Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
