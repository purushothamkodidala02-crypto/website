"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockTestStatus } from "@/types/mock-test";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { archiveMockTest, createCorrectedMockTestVersion, deleteDraftMockTest, publishMockTest, restoreMockTestAsDraft } from "./manage-actions";

export function MockTestManagementButtons({ mockTestId, mockTestTitle, status, ready, hasAttempts }: { mockTestId: string; mockTestTitle: string; status: MockTestStatus; ready: boolean; hasAttempts: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: "publish" | "hide" | "restore" | "delete" | "correct") {
    const confirmations = {
      publish: `Publish “${mockTestTitle}”?\n\nStudents will be able to find and start this test.`,
      hide: `Hide “${mockTestTitle}”?\n\nNew attempts will stop, but existing results remain safe.`,
      restore: `Restore “${mockTestTitle}” as a draft?`,
      delete: `Delete draft “${mockTestTitle}”?\n\nThe original questions remain in the Question Bank.`,
      correct: `Create a corrected version of ${mockTestTitle}?\n\nThe attempted version is kept for result history. A new editable draft with the same student-facing name and independent question copies will be created.`,
    };
    if (!window.confirm(confirmations[action])) return;
    setPending(true); setMessage("");
    const result = action === "publish" ? await publishMockTest(mockTestId) : action === "hide" ? await archiveMockTest(mockTestId) : action === "restore" ? await restoreMockTestAsDraft(mockTestId) : action === "correct" ? await createCorrectedMockTestVersion(mockTestId) : await deleteDraftMockTest(mockTestId);
    if (!result.success) { setMessage(result.message); setPending(false); return; }
    if (action === "correct" && result.replacementId) { router.push(`/admin/mock-tests/${result.replacementId}/questions`); return; }
    setPending(false);
    router.refresh();
  }

  const correct = hasAttempts ? <ActionButton pending={pending} onClick={() => run("correct")} label="Create corrected version" className="text-teal-800 hover:bg-teal-50" message={message} /> : null;
  if (status === "published") return <div className="flex flex-wrap items-center gap-2"><ActionButton pending={pending} onClick={() => run("hide")} label="Hide" className="text-amber-800 hover:bg-amber-50" message={message} />{correct}</div>;
  if (status === "archived") return <div className="flex flex-wrap items-center gap-2">{!hasAttempts && <ActionButton pending={pending} onClick={() => run("restore")} label="Restore as draft" className="text-teal-700 hover:bg-teal-50" message={message} />}{correct}</div>;
  if (hasAttempts) return <div className="flex flex-wrap items-center gap-2">{correct}</div>;
  return <div className="flex flex-wrap items-center gap-2"><ActionButton pending={pending} disabled={!ready} onClick={() => run("publish")} label={ready ? "Publish" : "Not ready"} className="bg-teal-700 text-white hover:bg-teal-800" message={message} /><ActionButton pending={pending} onClick={() => run("delete")} label="Delete" className="text-red-700 hover:bg-red-50" /></div>;
}

function ActionButton({ pending, disabled = false, onClick, label, className, message }: { pending: boolean; disabled?: boolean; onClick: () => void; label: string; className: string; message?: string }) {
  return <div><button type="button" onClick={onClick} disabled={pending || disabled} aria-busy={pending} className={`rounded-lg px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45 ${className}`}><PendingButtonContent pending={pending} pendingLabel="Working…">{label}</PendingButtonContent></button>{message && <p aria-live="polite" className="mt-2 max-w-64 text-xs text-red-700">{message}</p>}</div>;
}
