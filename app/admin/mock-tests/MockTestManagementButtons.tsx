"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MockTestStatus } from "@/types/mock-test";
import { PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { archiveMockTest, createCorrectedMockTestVersion, deleteDraftMockTest, permanentlyDeleteMockTest, publishMockTest, republishArchivedMockTest, restoreMockTestAsDraft } from "./manage-actions";

export function MockTestManagementButtons({ mockTestId, mockTestTitle, status, ready, hasAttempts, hasCorrectedVersion, canRepublish }: { mockTestId: string; mockTestTitle: string; status: MockTestStatus; ready: boolean; hasAttempts: boolean; hasCorrectedVersion: boolean; canRepublish: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function run(action: "publish" | "republish" | "hide" | "restore" | "delete" | "correct" | "permanent-delete") {
    const confirmations = {
      republish: `Publish ${mockTestTitle} again?\n\nThe unchanged protected version will become available to students again.`,
      publish: `Publish “${mockTestTitle}”?\n\nStudents will be able to find and start this test.`,
      hide: `Hide “${mockTestTitle}”?\n\nNew attempts will stop, but existing results remain safe.`,
      restore: `Restore “${mockTestTitle}” as a draft?`,
      delete: `Delete draft “${mockTestTitle}”?\n\nThe original questions remain in the Question Bank.`,
      correct: `Create a corrected version of ${mockTestTitle}?\n\nThe attempted version is kept for result history. A new editable draft with the same student-facing name and independent question copies will be created.`,
      "permanent-delete": `Permanently delete ${mockTestTitle}?\n\nAll student attempts, scores, answers and review history for this test will be erased. This cannot be undone.`,
    };
    if (!window.confirm(confirmations[action])) return;
    const permanentConfirmation = action === "permanent-delete" ? window.prompt("Type DELETE to permanently erase this mock test and all of its student history.") : null;
    if (action === "permanent-delete" && permanentConfirmation !== "DELETE") { setMessage("Permanent deletion was cancelled. Type DELETE exactly to confirm."); return; }
    setPending(true); setMessage("");
    const result = action === "publish" ? await publishMockTest(mockTestId) : action === "republish" ? await republishArchivedMockTest(mockTestId) : action === "hide" ? await archiveMockTest(mockTestId) : action === "restore" ? await restoreMockTestAsDraft(mockTestId) : action === "correct" ? await createCorrectedMockTestVersion(mockTestId) : action === "permanent-delete" ? await permanentlyDeleteMockTest(mockTestId, permanentConfirmation ?? "") : await deleteDraftMockTest(mockTestId);
    if (!result.success) { setMessage(result.message); setPending(false); return; }
    if (action === "correct" && result.replacementId) { router.push(`/admin/mock-tests/${result.replacementId}/questions`); return; }
    setPending(false);
    router.refresh();
  }

  const correct = hasAttempts && !hasCorrectedVersion ? <ActionButton pending={pending} onClick={() => run("correct")} label="Create corrected version" className="text-teal-800 hover:bg-teal-50" message={message} /> : null;
  if (status === "published") return <div className="flex flex-wrap items-center gap-2"><ActionButton pending={pending} onClick={() => run("hide")} label="Hide" className="text-amber-800 hover:bg-amber-50" message={message} />{correct}</div>;
  const permanentDelete = hasAttempts ? <ActionButton pending={pending} onClick={() => run("permanent-delete")} label="Delete permanently" className="text-red-700 hover:bg-red-50" message={message} /> : null;
  if (status === "archived") return <div className="flex flex-wrap items-center gap-2">{canRepublish && <ActionButton pending={pending} disabled={!ready} onClick={() => run("republish")} label={ready ? "Publish again" : "Not ready"} className="bg-teal-700 text-white hover:bg-teal-800" message={message} />}{!hasAttempts && <ActionButton pending={pending} onClick={() => run("restore")} label="Restore as draft" className="text-teal-700 hover:bg-teal-50" message={message} />}{correct}{permanentDelete}</div>;
  if (hasAttempts) return <div className="flex flex-wrap items-center gap-2">{correct}{permanentDelete}</div>;
  return <div className="flex flex-wrap items-center gap-2"><ActionButton pending={pending} disabled={!ready} onClick={() => run("publish")} label={ready ? "Publish" : "Not ready"} className="bg-teal-700 text-white hover:bg-teal-800" message={message} /><ActionButton pending={pending} onClick={() => run("delete")} label="Delete" className="text-red-700 hover:bg-red-50" /></div>;
}

function ActionButton({ pending, disabled = false, onClick, label, className, message }: { pending: boolean; disabled?: boolean; onClick: () => void; label: string; className: string; message?: string }) {
  return <div><button type="button" onClick={onClick} disabled={pending || disabled} aria-busy={pending} className={`rounded-lg px-3 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-45 ${className}`}><PendingButtonContent pending={pending} pendingLabel="Working…">{label}</PendingButtonContent></button>{message && <p aria-live="polite" className="mt-2 max-w-64 text-xs text-red-700">{message}</p>}</div>;
}
