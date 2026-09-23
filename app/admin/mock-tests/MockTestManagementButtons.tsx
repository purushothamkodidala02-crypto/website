"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockTestStatus } from "@/types/mock-test";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import {
  archiveMockTest,
  clearAdminMockTestAttemptsAction,
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
  canRepublish,
  adminAttemptCount = 0,
}: {
  mockTestId: string;
  mockTestTitle: string;
  status: MockTestStatus;
  ready: boolean;
  hasAttempts: boolean;
  hasCorrectedVersion: boolean;
  canRepublish: boolean;
  adminAttemptCount?: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  // Publish with email alert modal state
  const [publishAction, setPublishAction] = useState<"publish" | "republish" | null>(null);
  const [notifyStudents, setNotifyStudents] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewAudience, setPreviewAudience] = useState<{ count: number; examName: string } | null>(null);

  async function openPublishDialog(action: "publish" | "republish") {
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
    if (!publishAction) return;
    const action = publishAction;
    setPublishAction(null);
    setPending(true);
    setMessage("");

    const result =
      action === "publish"
        ? await publishMockTest(mockTestId, { notifyStudents })
        : await republishArchivedMockTest(mockTestId, { notifyStudents });

    setPending(false);
    if (!result.success) {
      setMessage(result.message);
      return;
    }
    router.refresh();
  }

  async function run(
    action: "hide" | "restore" | "delete" | "correct" | "permanent-delete" | "clear-admin-attempts"
  ) {
    const confirmations = {
      hide: `Hide “${mockTestTitle}”?\n\nNew attempts will stop, but existing results remain safe.`,
      restore: `Restore “${mockTestTitle}” as a draft?`,
      delete: `Delete draft “${mockTestTitle}”?\n\nThe original questions remain in the Question Bank.`,
      correct: `Create a corrected version of ${mockTestTitle}?\n\nThe attempted version is kept for result history. A new editable draft with the same student-facing name and independent question copies will be created.`,
      "permanent-delete": `Permanently delete ${mockTestTitle}?\n\nAll student attempts, scores, answers and review history for this test will be erased. This cannot be undone.`,
      "clear-admin-attempts": `Clear your admin test attempt(s) from “${mockTestTitle}”?\n\nThis removes only attempts made by your admin account so the test can be modified or restored as a draft cleanly.`,
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
        : await deleteDraftMockTest(mockTestId);

    if (!result.success) {
      setMessage(result.message);
      setPending(false);
      return;
    }

    if (action === "correct" && result.replacementId) {
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
        className="text-teal-800 hover:bg-teal-50"
      />
    ) : null;

  const permanentDelete = hasAttempts ? (
    <ActionButton
      pending={pending}
      onClick={() => run("permanent-delete")}
      label="Delete permanently"
      className="text-red-700 hover:bg-red-50"
    />
  ) : null;

  const clearAdminBtn =
    adminAttemptCount > 0 ? (
      <ActionButton
        pending={pending}
        onClick={() => run("clear-admin-attempts")}
        label="Clear my attempt"
        className="text-amber-800 hover:bg-amber-50"
      />
    ) : null;

  return (
    <>
      {status === "published" && (
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            pending={pending}
            onClick={() => run("hide")}
            label="Hide"
            className="text-amber-800 hover:bg-amber-50"
          />
          {clearAdminBtn}
          {correct}
        </div>
      )}

      {status === "archived" && (
        <div className="flex flex-wrap items-center gap-2">
          {canRepublish && (
            <ActionButton
              pending={pending}
              disabled={!ready}
              onClick={() => openPublishDialog("republish")}
              label={ready ? "Publish again" : "Not ready"}
              className="bg-teal-700 text-white hover:bg-teal-800"
            />
          )}
          {!hasAttempts && (
            <ActionButton
              pending={pending}
              onClick={() => run("restore")}
              label="Restore as draft"
              className="text-teal-700 hover:bg-teal-50"
            />
          )}
          {clearAdminBtn}
          {correct}
          {permanentDelete}
        </div>
      )}

      {status === "draft" && (
        <div className="flex flex-wrap items-center gap-2">
          <ActionButton
            pending={pending}
            disabled={!ready}
            onClick={() => openPublishDialog("publish")}
            label={ready ? "Publish" : "Not ready"}
            className="bg-teal-700 text-white hover:bg-teal-800"
          />
          {clearAdminBtn}
          {!hasAttempts ? (
            <ActionButton
              pending={pending}
              onClick={() => run("delete")}
              label="Delete"
              className="text-red-700 hover:bg-red-50"
            />
          ) : (
            <>
              {correct}
              {permanentDelete}
            </>
          )}
        </div>
      )}

      {message && (
        <p aria-live="polite" className="mt-2 w-full text-right text-xs font-semibold text-red-700">
          {message}
        </p>
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
                onClick={() => setPublishAction(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
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
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600"
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
                onClick={() => setPublishAction(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
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
}: {
  pending: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending || disabled}
      aria-busy={pending}
      className={`rounded-lg px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      <PendingButtonContent pending={pending} pendingLabel="Working…">
        {label}
      </PendingButtonContent>
    </button>
  );
}
