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
  isDraft?: boolean;
  hasNotificationHistory?: boolean;
  lastNotifiedAt?: string | null;
  notificationCount?: number;
};

export function NotifyStudentsModal({
  mockTestId,
  mockTestTitle,
  isDraft,
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
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [customEmailsInput, setCustomEmailsInput] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validCustomEmails = Array.from(
    new Set(
      customEmailsInput
        .split(/[\s,;\n\r]+/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => emailRegex.test(e) && !selectedEmails.has(e))
    )
  );

  async function handleOpen() {
    setIsOpen(true);
    setLoadingPreview(true);
    setErrorMessage("");
    setSuccessMessage("");
    setCustomEmailsInput("");

    const result = await getMockTestNotificationPreviewAction(mockTestId);
    setLoadingPreview(false);

    if (result.success && result.preview) {
      setPreview(result.preview);
      setSelectedEmails(new Set(result.preview.recipients.map((r) => r.email.toLowerCase())));
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

  function toggleStudent(email: string) {
    const normalized = email.toLowerCase();
    setSelectedEmails((prev) => {
      const next = new Set(prev);
      if (next.has(normalized)) {
        next.delete(normalized);
      } else {
        next.add(normalized);
      }
      return next;
    });
  }

  function selectAllStudents(select: boolean) {
    if (!preview) return;
    if (select) {
      setSelectedEmails(new Set(preview.recipients.map((r) => r.email.toLowerCase())));
    } else {
      setSelectedEmails(new Set());
    }
  }

  const totalRecipients = selectedEmails.size + validCustomEmails.length;

  async function handleSend() {
    if (totalRecipients === 0) return;
    setSending(true);
    setErrorMessage("");
    setSuccessMessage("");

    const result = await sendMockTestNotificationAction(mockTestId, {
      selectedEmails: Array.from(selectedEmails),
      customEmails: validCustomEmails,
    });
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
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
        title={
          hasNotificationHistory
            ? `Notified ${notificationCount ?? 0} students on ${formattedLastDate}`
            : isDraft
            ? "Check which students previously attempted this exam"
            : "Email previous test-takers about this new test"
        }
      >
        <span>
          {hasNotificationHistory
            ? `Notified (${notificationCount ?? 0})`
            : isDraft
            ? "Check students"
            : "Notify students"}
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
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                        Target Audience
                      </p>
                      <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-900">
                        {totalRecipients} selected
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-black text-slate-950">
                      {totalRecipients}{" "}
                      <span className="text-sm font-normal text-slate-600">
                        total {totalRecipients === 1 ? "recipient" : "recipients"}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Select specific previous test-takers below and/or enter any user email addresses manually.
                    </p>

                    {preview.recipients && preview.recipients.length > 0 && (
                      <div className="mt-3 border-t border-teal-100 pt-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] font-bold text-teal-950 uppercase tracking-wider">
                              Eligible Students ({selectedEmails.size}/{preview.recipients.length})
                            </p>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              onClick={() => selectAllStudents(true)}
                              className="text-[11px] font-semibold text-teal-700 hover:underline"
                            >
                              Select all
                            </button>
                            <span className="text-slate-300">|</span>
                            <button
                              type="button"
                              onClick={() => selectAllStudents(false)}
                              className="text-[11px] font-semibold text-slate-500 hover:underline"
                            >
                              Deselect all
                            </button>
                          </div>

                          {preview.recipients.length > 4 && (
                            <input
                              type="text"
                              placeholder="Search list…"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="rounded-lg border border-teal-200 bg-white px-2 py-0.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none"
                            />
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto rounded-lg border border-teal-200/60 bg-white divide-y divide-slate-100 shadow-2xs">
                          {(searchQuery.trim()
                            ? preview.recipients.filter(
                                (r) =>
                                  r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  r.email.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                            : preview.recipients
                          ).map((student) => {
                            const isSelected = selectedEmails.has(student.email.toLowerCase());
                            return (
                              <label
                                key={student.email}
                                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-xs transition ${
                                  isSelected ? "bg-teal-50/40 hover:bg-teal-50/80" : "hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate pr-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleStudent(student.email)}
                                    className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                  />
                                  <div className="truncate">
                                    <p className="font-bold text-slate-900 truncate">
                                      {student.name}
                                    </p>
                                    <p className="font-mono text-[11px] text-slate-500 truncate">
                                      {student.email}
                                    </p>
                                  </div>
                                </div>
                                <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                  {isSelected ? "Selected" : "Excluded"}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom User Email Entry Section */}
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="custom-user-emails"
                        className="text-xs font-bold text-slate-900 uppercase tracking-wider"
                      >
                        ✉️ Enter Specific User Email(s)
                      </label>
                      {validCustomEmails.length > 0 && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          {validCustomEmails.length} custom {validCustomEmails.length === 1 ? "email" : "emails"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Want to send to a specific student or user? Type or paste their email addresses below (separate multiple emails with commas, spaces, or new lines):
                    </p>
                    <textarea
                      id="custom-user-emails"
                      rows={2}
                      placeholder="e.g. student@gmail.com, candidate@yahoo.com"
                      value={customEmailsInput}
                      onChange={(e) => setCustomEmailsInput(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-600"
                    />

                    {validCustomEmails.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {validCustomEmails.map((email) => (
                          <span
                            key={email}
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/80"
                          >
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const remaining = validCustomEmails.filter((e) => e !== email);
                                setCustomEmailsInput(remaining.join(", "));
                              }}
                              className="text-teal-600 hover:text-teal-950 font-bold ml-0.5"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
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
                    totalRecipients === 0
                  }
                  className="rounded-xl bg-teal-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <PendingButtonContent pending={sending} pendingLabel="Sending emails…">
                    {totalRecipients > 0
                      ? `Send Email to ${totalRecipients} ${totalRecipients === 1 ? "Recipient" : "Recipients"}`
                      : "Select or Enter Recipient Emails"}
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
