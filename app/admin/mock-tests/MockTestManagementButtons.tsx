"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MockTestStatus } from "@/types/mock-test";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import {
  archiveMockTest,
  clearAdminMockTestAttemptsAction,
  clearAllMockTestAttemptsAction,
  createCorrectedMockTestVersion,
  deleteDraftMockTest,
  permanentlyDeleteMockTest,
  publishMockTest,
  republishArchivedMockTest,
  restoreMockTestAsDraft,
} from "./manage-actions";
import { getMockTestNotificationPreviewAction } from "./notification-actions";

export function MockTestManagementButtons({
  mockTestId,
  mockTestTitle,
  status,
  ready,
  hasAttempts,
  hasCorrectedVersion,
  supersededByMockTestId,
  correctedVersionStatus,
  canRepublish,
  adminAttemptCount = 0,
}: {
  mockTestId: string;
  mockTestTitle: string;
  status: MockTestStatus;
  ready: boolean;
  hasAttempts: boolean;
  hasCorrectedVersion: boolean;
  supersededByMockTestId?: string | null;
  correctedVersionStatus?: MockTestStatus | null;
  canRepublish: boolean;
  adminAttemptCount?: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [replacementId, setReplacementId] = useState<string | null>(null);

  // Publish with email alert modal state
  const [publishAction, setPublishAction] = useState<"publish" | "republish" | null>(null);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAudience, setPreviewAudience] = useState<{ count: number; examName: string } | null>(null);

  async function openPublishDialog(action: "publish" | "republish") {
    if (pending) return;
    setPublishAction(action);
    setNotifyStudents(true);
    setPreviewLoading(true);
    setPreviewAudience(null);
    setMessage("");

    const res = await getMockTestNotificationPreviewAction(mockTestId);
    setPreviewLoading(false);
    if (res.success && res.preview) {
      setPreviewAudience({
        count: res.preview.recipientCount,
        examName: res.preview.examName,
      });
    }
  }

  async function confirmPublish() {
    if (!publishAction || pending) return;
    const action = publishAction;
    setPending(true);
    setMessage("");

    try {
      const result =
        action === "publish"
          ? await publishMockTest(mockTestId, { notifyStudents })
          : await republishArchivedMockTest(mockTestId, { notifyStudents });

      setPublishAction(null);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    } catch (err) {
      setPublishAction(null);
      setMessage(err instanceof Error ? err.message : "An unexpected error occurred while publishing.");
    } finally {
      setPending(false);
    }
  }

  async function run(
    action: "hide" | "restore" | "delete" | "correct" | "permanent-delete" | "clear-admin-attempts" | "clear-all-attempts"
  ) {
    if (pending) return;
    const confirmations = {
      hide: `Hide “${mockTestTitle}”?\n\nNew attempts will stop, but existing results remain safe.`,
      restore: `Restore “${mockTestTitle}” as a draft?`,
      delete: `Delete draft “${mockTestTitle}”?\n\nThe original questions remain in the Question Bank.`,
      correct: `Create a corrected version of ${mockTestTitle}?\n\nThe attempted version is kept for result history. A new editable draft with the same student-facing name and independent question copies will be created.`,
      "permanent-delete": `Permanently delete ${mockTestTitle}?\n\nAll student attempts, scores, answers and review history for this test will be erased. This cannot be undone.`,
      "clear-admin-attempts": `Clear your admin test attempt(s) from “${mockTestTitle}”?\n\nThis removes only attempts made by your admin account so the test can be modified or restored as a draft cleanly.`,
      "clear-all-attempts": `Clear all test attempts from “${mockTestTitle}” and restore it as an editable draft?\n\nThis removes previous attempts so you can upload or replace questions with your Excel file.`,
    };

    if (!window.confirm(confirmations[action])) return;

    const permanentConfirmation =
      action === "permanent-delete"
        ? window.prompt(
            "Type DELETE to permanently erase this mock test and all of its student history."
          )
        : null;

    if (action === "permanent-delete" && permanentConfirmation !== "DELETE") {
      setMessage("Permanent deletion was cancelled. Type DELETE exactly to confirm.");
      return;
    }

    setPending(true);
    setMessage("");

    const result =
      action === "hide"
        ? await archiveMockTest(mockTestId)
        : action === "restore"
        ? await restoreMockTestAsDraft(mockTestId)
        : action === "correct"
        ? await createCorrectedMockTestVersion(mockTestId)
        : action === "permanent-delete"
        ? await permanentlyDeleteMockTest(mockTestId, permanentConfirmation ?? "")
        : action === "clear-admin-attempts"
        ? await clearAdminMockTestAttemptsAction(mockTestId)
        : action === "clear-all-attempts"
        ? await clearAllMockTestAttemptsAction(mockTestId)
        : await deleteDraftMockTest(mockTestId);

    if (!result.success) {
      setMessage(result.message);
      setReplacementId(result.replacementId ?? null);
      setPending(false);
      return;
    }

    if (result.replacementId) {
      router.push(`/admin/mock-tests/${result.replacementId}/questions`);
      return;
    }

    setPending(false);
    router.refresh();
  }

  const correct =
    hasAttempts && !hasCorrectedVersion ? (
      <ActionButton
        pending={pending}
        onClick={() => run("correct")}
        label="Create corrected version"
        fullWidthMobile={true}
        className="border border-slate-200 bg-white text-slate-700 hover:border-indigo-300/80 hover:bg-indigo-50/50 hover:text-indigo-800"
      />
    ) : null;

  const permanentDelete = hasAttempts ? (
    <ActionButton
      pending={pending}
      onClick={() => run("permanent-delete")}
      label="Delete permanently"
      fullWidthMobile={true}
      className="border border-slate-200 bg-white text-slate-600 hover:border-rose-300/80 hover:bg-rose-50/50 hover:text-rose-700"
    />
  ) : null;

  const clearAllAttemptsBtn =
    hasAttempts ? (
      <ActionButton
        pending={pending}
        onClick={() => run("clear-all-attempts")}
        label="Clear attempts & restore draft"
        className="border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 hover:text-amber-950"
      />
    ) : null;

  const clearAdminBtn =
    adminAttemptCount > 0 ? (
      <ActionButton
        pending={pending}
        onClick={() => run("clear-admin-attempts")}
        label="Clear my attempt"
        className="border border-slate-200 bg-white text-slate-700 hover:border-amber-300/80 hover:bg-amber-50/50 hover:text-amber-800"
      />
    ) : null;

  return (
    <>
      {status === "published" && (
        <>
          <ActionButton
            pending={pending}
            onClick={() => run("hide")}
            label="Hide"
            className="border border-slate-200 bg-white text-slate-700 hover:border-amber-300/80 hover:bg-amber-50/50 hover:text-amber-800"
          />
          <ActionButton
            pending={pending}
            onClick={() => run("restore")}
            label="Restore as draft"
            className="border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          />
          {clearAdminBtn}
          {clearAllAttemptsBtn}
          {correct}
        </>
      )}

      {status === "archived" && (
        <>
          {canRepublish && (
            <ActionButton
              pending={pending}
              disabled={!ready}
              onClick={() => openPublishDialog("republish")}
              label={ready ? "Publish again" : "Not ready"}
              className="border border-emerald-700/90 bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900"
            />
          )}
          {correctedVersionStatus === "published" ? (
            supersededByMockTestId && (
              <Link
                href={`/admin/mock-tests/${supersededByMockTestId}/edit`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 px-3 py-2 text-xs font-semibold text-indigo-800 shadow-2xs transition"
              >
                Manage live test ↗
              </Link>
            )
          ) : correctedVersionStatus === "draft" ? (
            supersededByMockTestId && (
              <Link
                href={`/admin/mock-tests/${supersededByMockTestId}/questions`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 hover:border-indigo-300 px-3 py-2 text-xs font-semibold text-indigo-800 shadow-2xs transition"
              >
                Edit corrected draft ↗
              </Link>
            )
          ) : (
            <ActionButton
              pending={pending}
              onClick={() => run("restore")}
              label="Restore as draft"
              className="border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            />
          )}
          {clearAdminBtn}
          {correctedVersionStatus !== "published" && clearAllAttemptsBtn}
          {correct}
          {permanentDelete}
        </>
      )}

      {status === "draft" && (
        <>
          <ActionButton
            pending={pending}
            disabled={!ready}
            onClick={() => openPublishDialog("publish")}
            label={ready ? "Publish" : "Not ready"}
            className="border border-emerald-700/90 bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900"
          />
          {clearAdminBtn}
          {!hasAttempts ? (
            <ActionButton
              pending={pending}
              onClick={() => run("delete")}
              label="Delete"
              className="border border-slate-200 bg-white text-slate-600 hover:border-rose-300/80 hover:bg-rose-50/50 hover:text-rose-700"
            />
          ) : (
            <>
              {clearAllAttemptsBtn}
              {correct}
              {permanentDelete}
            </>
          )}
        </>
      )}

      {message && (
        <div className="col-span-2 sm:basis-full py-1">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 shadow-xs">
            <p aria-live="polite">{message}</p>
            {replacementId && (
              <Link
                href={`/admin/mock-tests/${replacementId}/edit`}
                className="inline-flex items-center gap-1 rounded-md border border-red-300 bg-white px-2 py-0.5 text-xs font-bold text-red-800 hover:bg-red-50 hover:border-red-400"
              >
                Open active test ↗
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Publish Dialog with Send Mail Option */}
      {publishAction !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                  {publishAction === "publish" ? "Publish Mock Test" : "Republish Mock Test"}
                </p>
                <h3 className="text-xl font-bold text-slate-950 mt-0.5">
                  Publish “{mockTestTitle}”?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !pending && setPublishAction(null)}
                disabled={pending}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-sm text-slate-600">
              This mock test will become live and accessible to students immediately on Varadhi Prep.
            </p>

            {/* Email Notification Option */}
            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/70 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyStudents}
                  onChange={(e) => setNotifyStudents(e.target.checked)}
                  disabled={pending}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 disabled:opacity-50"
                />
                <div>
                  <span className="text-sm font-bold text-slate-950">
                    📧 Send email alert to previous test-takers
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    {previewLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-teal-800">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                        Checking eligible students who previously attempted this exam…
                      </span>
                    ) : previewAudience && previewAudience.count > 0 ? (
                      <>
                        Found <strong>{previewAudience.count} student{previewAudience.count === 1 ? "" : "s"}</strong> who previously practiced <strong>{previewAudience.examName}</strong> tests. They will receive an email notifying them that a new mock test is live!
                      </>
                    ) : (
                      "Students who previously took or registered for tests in this exam will receive a notification email with a direct link to practice."
                    )}
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => !pending && setPublishAction(null)}
                disabled={pending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmPublish}
                disabled={pending}
                className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50"
              >
                <PendingButtonContent pending={pending} pendingLabel="Publishing…">
                  {notifyStudents && previewAudience && previewAudience.count > 0
                    ? `Publish & Email ${previewAudience.count} Students`
                    : "Publish Mock Test"}
                </PendingButtonContent>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ActionButton({
  pending,
  disabled = false,
  onClick,
  label,
  className,
  fullWidthMobile = false,
}: {
  pending: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  className: string;
  fullWidthMobile?: boolean;
}) {
  const [clicked, setClicked] = useState(false);

  useEffect(() => {
    if (!pending) {
      setClicked(false);
    }
  }, [pending]);

  const isBusy = pending || clicked;

  const handleClick = () => {
    if (isBusy || disabled) return;
    setClicked(true);
    onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy || disabled}
      aria-busy={isBusy}
      className={`w-full sm:w-auto inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold shadow-2xs transition disabled:cursor-not-allowed disabled:opacity-45 ${
        fullWidthMobile ? "col-span-2 sm:col-span-1" : ""
      } ${className}`}
    >
      <PendingButtonContent pending={isBusy} pendingLabel="Working…">
        {label}
      </PendingButtonContent>
    </button>
  );
}
