"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import {
  getMockTestNotificationPreviewAction,
  sendMockTestNotificationAction,
} from "./notification-actions";
import type { MockTestNotificationPreview } from "@/lib/notifications/mock-test-alerts";

type NotifyStudentsModalProps = {
  mockTestId: string;
  mockTestTitle: string;
  hasNotificationHistory?: boolean;
  lastNotifiedAt?: string | null;
  notificationCount?: number;
};

export function NotifyStudentsModal({
  mockTestId,
  mockTestTitle,
  hasNotificationHistory,
  lastNotifiedAt,
  notificationCount,
}: NotifyStudentsModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [preview, setPreview] = useState<MockTestNotificationPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  async function handleOpen() {
    setIsOpen(true);
    setLoadingPreview(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await getMockTestNotificationPreviewAction(mockTestId);
    setLoadingPreview(false);

    if (result.success && result.preview) {
      setPreview(result.preview);
    } else {
      setErrorMessage(result.message ?? "Could not load audience preview.");
    }
  }

  function handleClose() {
    if (sending) return;
    setIsOpen(false);
    if (successMessage) {
      router.refresh();
    }
  }

  async function handleSend() {
    if (!preview || preview.recipientCount === 0) return;
    setSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await sendMockTestNotificationAction(mockTestId);
    setSending(false);

    if (result.success) {
      setSuccessMessage(result.message);
    } else {
      setErrorMessage(result.message ?? "Failed to send notifications.");
    }
  }

  const formattedLastDate = lastNotifiedAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "numeric",
      }).format(new Date(lastNotifiedAt))
    : null;

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
          hasNotificationHistory
            ? "border border-teal-200 bg-teal-50/50 text-teal-800 hover:bg-teal-100/70"
            : "border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100"
        }`}
        title={
          hasNotificationHistory
            ? `Notified ${notificationCount ?? 0} students on ${formattedLastDate}`
            : "Email previous test-takers about this new test"
        }
      >
        <span>📢</span>
        <span>
          {hasNotificationHistory
            ? `Notified (${notificationCount ?? 0})`
            : "Notify Students"}
        </span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-teal-700">
                  Email Alert
                </span>
                <h2 className="text-xl font-bold text-slate-950">
                  Notify Previous Test-Takers
                </h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500 font-medium">Test to announce:</p>
                <p className="font-bold text-slate-900 mt-0.5">{mockTestTitle}</p>
              </div>

              {loadingPreview && (
                <div className="py-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Finding eligible students who previously attempted this exam…
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">
                  ✅ {successMessage}
                </div>
              )}

              {preview && !loadingPreview && !successMessage && (
                <>
                  <div className="rounded-xl border border-teal-100 bg-teal-50/70 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Target Audience
                    </p>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {preview.recipientCount}{" "}
                      <span className="text-sm font-normal text-slate-600">
                        students eligible
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Students who previously took or started any test in{" "}
                      <strong>{preview.examName}</strong> on Varadhi Prep and have a confirmed email.
                    </p>

                    {preview.recipients && preview.recipients.length > 0 && (
                      <div className="mt-3 border-t border-teal-100 pt-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-[11px] font-bold text-teal-950 uppercase tracking-wider">
                            Student Email List ({preview.recipients.length})
                          </p>
                          {preview.recipients.length > 5 && (
                            <input
                              type="text"
                              placeholder="Search student or email…"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="rounded-lg border border-teal-200 bg-white px-2.5 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
                            />
                          )}
                        </div>

                        <div className="max-h-44 overflow-y-auto rounded-lg border border-teal-200/60 bg-white divide-y divide-slate-100 shadow-2xs">
                          {(searchQuery.trim()
                            ? preview.recipients.filter(
                                (r) =>
                                  r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  r.email.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                            : preview.recipients
                          ).map((student) => (
                            <div
                              key={student.email}
                              className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50"
                            >
                              <div className="truncate pr-2">
                                <p className="font-bold text-slate-900 truncate">
                                  {student.name}
                                </p>
                                <p className="font-mono text-[11px] text-slate-500 truncate">
                                  {student.email}
                                </p>
                              </div>
                              <span className="shrink-0 rounded bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                                Exam Student
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {preview.alreadyNotifiedAt && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      ⚠️ <strong>Note:</strong> This test was already announced on{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }).format(new Date(preview.alreadyNotifiedAt))}{" "}
                      to {preview.previousSendCount} students.
                    </div>
                  )}

                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
                    <p className="font-bold text-slate-700">Email Subject Preview:</p>
                    <p className="mt-1 text-slate-900 font-mono text-[11px] bg-slate-50 p-2 rounded-md border border-slate-100">
                      🎯 New Mock Test Live: {preview.examName} - {preview.mockTestTitle} | Varadhi Prep
                    </p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      Includes details: {preview.durationMinutes} mins, {preview.questionCount} questions, and direct test attempt link.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={sending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {successMessage ? "Done" : "Cancel"}
              </button>

              {!successMessage && (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    sending ||
                    loadingPreview ||
                    !preview ||
                    preview.recipientCount === 0
                  }
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PendingButtonContent pending={sending} pendingLabel="Sending emails…">
                    {preview && preview.recipientCount > 0
                      ? `Send Email to ${preview.recipientCount} Students`
                      : "Send Notifications"}
                  </PendingButtonContent>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
