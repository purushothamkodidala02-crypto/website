"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LocationFilters,
  type LocationCategory,
  type LocationExam,
  type LocationFilterValue,
  type LocationPaper,
  type LocationSpecialization,
} from "@/components/admin/LocationFilters";
import type { MockTestStatus } from "@/types/mock-test";
import { MockSymbol, StateSymbol } from "@/components/exams/CatalogSymbols";
import { studentFacingMockTestTitle } from "@/lib/exam-catalog";
import { mockTestUrl } from "@/lib/public-urls";
import { MockTestManagementButtons } from "./MockTestManagementButtons";
import { NotifyStudentsModal } from "./NotifyStudentsModal";
import { syncAllMockTestTitles } from "./manage-actions";

type ExistingMockTest = {
  id: string;
  stateId: string;
  stateName: string;
  stateCode: string;
  stateSlug: string;
  categoryId: string;
  examId: string;
  specializationId: string;
  paperId: string;
  examName: string;
  examSlug: string;
  paperSlug: string;
  paperName: string;
  paperLabel: string;
  seriesNumber: number;
  title: string;
  slug: string;
  durationMinutes: number;
  scope: "paper" | "subject";
  subjectName: string | null;
  status: MockTestStatus;
  questionCount: number;
  targetQuestionCount: number;
  usableQuestionCount: number;
  totalMarks: number;
  attemptCount: number;
  adminAttemptCount?: number;
  replacesMockTestId: string | null;
  supersededByMockTestId: string | null;
  correctedVersionStatus: MockTestStatus | null;
  lastNotifiedAt?: string | null;
  notificationCount?: number;
};

const emptyLocation: LocationFilterValue = { categoryId: "", examId: "", specializationId: "", paperId: "", subjectId: "" };

const statusDetails: Record<MockTestStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "border border-amber-200/80 bg-amber-50/60 text-amber-800" },
  published: { label: "Published", className: "border border-emerald-200/80 bg-emerald-50/60 text-emerald-800" },
  archived: { label: "Hidden", className: "border border-slate-200/80 bg-slate-100/70 text-slate-600" },
};

export function ExistingMockTestsTable({ states, categories, exams, specializations, papers, tests, initialStateId, initialLocation, initialSearch, initialStatus, initialScope = "all" }: {
  states: Array<{ id: string; name: string; code: string; slug: string }>;
  categories: Array<LocationCategory & { stateId: string }>;
  exams: LocationExam[];
  specializations: LocationSpecialization[];
  papers: LocationPaper[];
  tests: ExistingMockTest[];
  initialStateId: string;
  initialLocation: LocationFilterValue;
  initialSearch: string;
  initialStatus: MockTestStatus | "all";
  initialScope?: "all" | "paper" | "subject";
}) {
  const [stateId, setStateId] = useState(initialStateId);
  const [location, setLocation] = useState(initialLocation);
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState<MockTestStatus | "all">(initialStatus);
  const [scope, setScope] = useState<"all" | "paper" | "subject">(initialScope);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncTitles = async () => {
    if (!window.confirm("Standardize all mock test titles in the database to match the canonical format? This will update any legacy titles.")) {
      return;
    }
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncAllMockTestTitles();
      setSyncMessage(res.message);
      router.refresh();
    } catch (err: unknown) {
      setSyncMessage(err instanceof Error ? err.message : "An error occurred while synchronizing titles.");
    } finally {
      setIsSyncing(false);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tests.filter((test) =>
      (!stateId || test.stateId === stateId) &&
      (!location.categoryId || test.categoryId === location.categoryId) &&
      (!location.examId || test.examId === location.examId) &&
      (!location.specializationId || test.specializationId === location.specializationId) &&
      (!location.paperId || test.paperId === location.paperId) &&
      (status === "all" || test.status === status) &&
      (scope === "all" || test.scope === scope) &&
      (!query || `${test.title} ${test.slug} ${test.examName} ${test.paperName} ${test.subjectName ?? ""}`.toLowerCase().includes(query)),
    );
  }, [location, search, stateId, status, scope, tests]);

  const counts = {
    all: tests.length,
    draft: tests.filter((test) => test.status === "draft").length,
    published: tests.filter((test) => test.status === "published").length,
    archived: tests.filter((test) => test.status === "archived").length,
  };

  const mockTestAdminUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (stateId) params.set("state", stateId);
    if (location.categoryId) params.set("category", location.categoryId);
    if (location.examId) params.set("exam", location.examId);
    if (location.specializationId) params.set("specialization", location.specializationId);
    if (location.paperId) params.set("paper", location.paperId);
    if (status !== "all") params.set("status", status);
    if (scope !== "all") params.set("scope", scope);
    if (search.trim()) params.set("q", search.trim().slice(0, 100));
    const query = params.toString();
    return query ? `/admin/mock-tests?${query}` : "/admin/mock-tests";
  }, [location, search, stateId, status, scope]);

  const router = useRouter();

  const prevInitialStateRef = useRef(initialStateId);
  const prevInitialLocationRef = useRef(initialLocation);

  useEffect(() => {
    prevInitialStateRef.current = initialStateId;
    prevInitialLocationRef.current = initialLocation;
  }, [initialStateId, initialLocation]);

  const [prevInitials, setPrevInitials] = useState({
    stateId: initialStateId,
    location: initialLocation,
    search: initialSearch,
    status: initialStatus,
    scope: initialScope,
  });

  if (
    prevInitials.stateId !== initialStateId ||
    prevInitials.location.categoryId !== initialLocation.categoryId ||
    prevInitials.location.examId !== initialLocation.examId ||
    prevInitials.location.specializationId !== initialLocation.specializationId ||
    prevInitials.location.paperId !== initialLocation.paperId ||
    prevInitials.search !== initialSearch ||
    prevInitials.status !== initialStatus ||
    prevInitials.scope !== initialScope
  ) {
    setPrevInitials({
      stateId: initialStateId,
      location: initialLocation,
      search: initialSearch,
      status: initialStatus,
      scope: initialScope,
    });
    setStateId(initialStateId);
    setLocation(initialLocation);
    setSearch(initialSearch);
    setStatus(initialStatus);
    setScope(initialScope);
  }

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlState = searchParams.get("state") || "";
      const urlCategory = searchParams.get("category") || "";
      const urlExam = searchParams.get("exam") || "";
      const urlSpecialization = searchParams.get("specialization") || "";
      const urlPaper = searchParams.get("paper") || "";
      const urlStatus = (searchParams.get("status") as MockTestStatus) || "all";
      const urlScope = (searchParams.get("scope") as "all" | "paper" | "subject") || "all";
      const urlQ = searchParams.get("q") || "";

      setStateId(urlState);
      setLocation({
        categoryId: urlCategory,
        examId: urlExam,
        specializationId: urlSpecialization,
        paperId: urlPaper,
        subjectId: "",
      });
      setStatus(["draft", "published", "archived"].includes(urlStatus) ? urlStatus : "all");
      setScope(["paper", "subject"].includes(urlScope) ? urlScope : "all");
      setSearch(urlQ);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.history.replaceState(null, "", mockTestAdminUrl);
    }, 200);
    return () => clearTimeout(timer);
  }, [mockTestAdminUrl]);

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const filterKey = `${stateId}:${location.categoryId}:${location.examId}:${location.specializationId}:${location.paperId}:${search}:${status}:${scope}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);

  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedTests = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
      {/* Header & Status Segmented Tabs */}
      <div className="border-b border-slate-200/80 bg-slate-50/50 px-5 py-5 sm:px-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-700">
              <span>Test Directory</span>
            </div>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              All Mock Tests
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Filter by examination hierarchy, manage question assignments, and control student access.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleSyncTitles}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
              title="Update all mock test titles in the database to the canonical standard format"
            >
              <span>⚙</span>
              <span>{isSyncing ? "Syncing titles…" : "Standardize all test titles"}</span>
            </button>
          </div>
        </div>

        {syncMessage && (
          <p className="mt-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs font-semibold text-teal-900">
            {syncMessage}
          </p>
        )}

        {/* Clean Status Tabs */}
        <div className="mt-5 flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-200/60 border border-slate-200">
          {([
            ["all", "All Tests", counts.all],
            ["published", "Published", counts.published],
            ["draft", "Drafts", counts.draft],
            ["archived", "Hidden", counts.archived],
          ] as const).map(([value, label, count]) => {
            const isActive = status === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <span>{label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] font-bold ${
                    isActive
                      ? "bg-slate-100 text-slate-800"
                      : "bg-slate-200/80 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="border-b border-slate-200/80 bg-white px-5 py-5 sm:px-7 space-y-4">
        {/* State Selection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 mr-1">State:</span>
          <button
            type="button"
            onClick={() => {
              setStateId("");
              setLocation(emptyLocation);
            }}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              !stateId
                ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-2xs"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            All States
          </button>
          {states.map((state) => {
            const isSelected = stateId === state.id;
            return (
              <button
                key={state.id}
                type="button"
                onClick={() => {
                  setStateId(state.id);
                  setLocation(emptyLocation);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "border-slate-900 bg-slate-900 text-white font-semibold shadow-2xs"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <StateSymbol slug={state.slug} className="h-3.5 w-3.5" />
                <span>{state.code}</span>
                <span className="text-slate-400">·</span>
                <span>{state.name}</span>
              </button>
            );
          })}
        </div>

        {/* Location Cascades */}
        <LocationFilters
          categories={categories.filter((category) => !stateId || category.stateId === stateId)}
          exams={exams}
          specializations={specializations}
          papers={papers}
          value={location}
          onChange={setLocation}
        />

        {/* Search & Scope Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by test title, exam name, paper, or subject..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-100"
            />
          </div>
          <div className="w-full sm:w-56 shrink-0">
            <select
              value={scope}
              onChange={(event) => setScope(event.target.value as "all" | "paper" | "subject")}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none transition focus:border-teal-600 focus:ring-1 focus:ring-teal-100"
            >
              <option value="all">All scopes (Paper &amp; Subject)</option>
              <option value="paper">Paper-wise only</option>
              <option value="subject">Subject-wise only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <MockSymbol className="h-6 w-6" />
          </div>
          <h3 className="mt-3 font-semibold text-slate-900">No mock tests found</h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            No mock tests match the selected filters or search query. Try resetting your search or state filters.
          </p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {paginatedTests.map((test) => {
              const unavailableCount = test.questionCount - test.usableQuestionCount;
              const ready = test.questionCount === test.targetQuestionCount && unavailableCount === 0;
              const statusDetail = statusDetails[test.status];
              const isTG = test.stateCode.toUpperCase() === "TG";

              return (
                <article
                  key={test.id}
                  className="p-5 sm:p-6 transition hover:bg-slate-50/60"
                >
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                        {test.stateCode}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {test.examName} · {test.paperName}
                        {test.subjectName && ` · ${test.subjectName}`}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {test.scope === "paper" ? "Paper-wise" : "Subject-wise"}
                      </span>
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        Series #{test.seriesNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {test.supersededByMockTestId && (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                          Correction in progress
                        </span>
                      )}
                      {test.replacesMockTestId && (
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-700">
                          Corrected version
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${statusDetail.className}`}
                      >
                        {statusDetail.label}
                      </span>
                    </div>
                  </div>

                  {/* Test Title & Description */}
                  <div className="mt-2.5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {studentFacingMockTestTitle({
                        examName: test.examName,
                        paperLabel: test.paperLabel,
                        seriesNumber: test.seriesNumber,
                        subjectName: test.subjectName,
                      })}
                    </h3>
                  </div>

                  {/* Clean Metric Indicators Strip */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Questions:</span>
                      <span className="font-semibold text-slate-700">
                        {test.questionCount} / {test.targetQuestionCount} target
                      </span>
                      {unavailableCount > 0 && (
                        <span className="text-rose-600 font-medium">
                          ({unavailableCount} unavailable)
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-slate-400">Marks:</span>
                      <span className="font-semibold text-slate-800">
                        {test.totalMarks.toFixed(2).replace(/\.00$/, "")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-slate-400">Duration:</span>
                      <span className="font-semibold text-slate-800">
                        {test.durationMinutes} mins
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-slate-400">Attempts:</span>
                      <span className="font-semibold text-slate-800">
                        {test.adminAttemptCount && test.attemptCount === 0
                          ? `0 (${test.adminAttemptCount} admin test)`
                          : test.attemptCount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="text-slate-400">Notification:</span>
                      <span className="font-semibold text-slate-700">
                        {test.lastNotifiedAt
                          ? `Sent (${test.notificationCount})`
                          : "Not sent"}
                      </span>
                    </div>
                  </div>

                  {/* Incomplete / Warning Notice */}
                  {!ready && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-medium text-slate-700">
                      {unavailableCount > 0
                        ? `${unavailableCount} assigned question${
                            unavailableCount === 1 ? " is" : "s are"
                          } unavailable. Fix the questions before publishing.`
                        : `${test.questionCount} of ${test.targetQuestionCount} questions are assigned. The exact target is required before publishing.`}
                    </div>
                  )}

                  {/* Clean Action Toolbar */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5">
                    <Link
                      href={`/admin/mock-tests/${test.id}/edit?returnTo=${encodeURIComponent(mockTestAdminUrl)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs transition"
                    >
                      Manage test
                    </Link>

                    <Link
                      href={`/admin/mock-tests/${test.id}/questions?returnTo=${encodeURIComponent(mockTestAdminUrl)}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition"
                    >
                      Questions ({test.questionCount})
                    </Link>

                    {test.status === "published" && (
                      <Link
                        href={mockTestUrl(
                          test.stateSlug,
                          test.examSlug,
                          test.paperSlug,
                          test.slug
                        )}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition"
                      >
                        View live ↗
                      </Link>
                    )}

                    <MockTestManagementButtons
                      mockTestId={test.id}
                      mockTestTitle={test.title}
                      status={test.status}
                      ready={ready}
                      hasAttempts={test.attemptCount > 0}
                      hasCorrectedVersion={Boolean(test.supersededByMockTestId)}
                      canRepublish={
                        !test.supersededByMockTestId ||
                        test.correctedVersionStatus === "draft"
                      }
                      adminAttemptCount={test.adminAttemptCount}
                    />

                    <NotifyStudentsModal
                      mockTestId={test.id}
                      mockTestTitle={studentFacingMockTestTitle({
                        examName: test.examName,
                        paperLabel: test.paperLabel,
                        seriesNumber: test.seriesNumber,
                        subjectName: test.subjectName,
                      })}
                      isDraft={test.status === "draft"}
                      hasNotificationHistory={Boolean(test.lastNotifiedAt)}
                      lastNotifiedAt={test.lastNotifiedAt}
                      notificationCount={test.notificationCount}
                    />
                  </div>
                </article>
              );
            })}
          </div>

          {/* Clean Pagination Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 sm:px-7">
            <p className="text-xs sm:text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {(currentPage - 1) * pageSize + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-900">
                {Math.min(currentPage * pageSize, filtered.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>{" "}
              mock tests
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  ← Previous
                </button>
                <span className="px-2 text-xs font-semibold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
