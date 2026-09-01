"use client";

import { useState, useTransition } from "react";
import { permanentlyDeleteAccessProduct, removeAccessProduct } from "./actions";

export function RemoveExamSeriesButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showPermanentDelete, setShowPermanentDelete] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");

  function remove() {
    startTransition(async () => {
      const result = await removeAccessProduct(productId);
      setMessage(result.message);
      setShowRemoveConfirm(false);
      setShowPermanentDelete(result.message.includes("paused instead of deleted"));
    });
  }

  function permanentlyDelete() {
    startTransition(async () => {
      const result = await permanentlyDeleteAccessProduct(productId, confirmationName);
      setMessage(result.message);
      if (result.success) setShowPermanentDelete(false);
    });
  }

  return <span className="inline-flex max-w-80 flex-col items-end gap-2">
    <button type="button" onClick={() => setShowRemoveConfirm(true)} disabled={pending} className="rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Remove</button>
    {showRemoveConfirm && <span className="w-full rounded-xl border border-amber-200 bg-amber-50 p-3 text-left">
      <strong className="block text-xs text-amber-950">Remove “{productName}”?</strong>
      <span className="mt-1 block text-[11px] leading-4 text-amber-800">Unused series are deleted. A series with purchase history is paused first so student records stay safe.</span>
      <span className="mt-2 flex gap-2">
        <button type="button" onClick={() => setShowRemoveConfirm(false)} disabled={pending} className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-slate-800">Cancel</button>
        <button type="button" onClick={remove} disabled={pending} className="flex-1 rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white disabled:opacity-40">{pending ? "Removing…" : "Confirm removal"}</button>
      </span>
    </span>}
    {message && <span role="status" className="text-right text-xs leading-5 text-slate-600">{message}</span>}
    {showPermanentDelete && <span className="w-full rounded-xl border border-red-200 bg-red-50 p-3 text-left">
      <strong className="block text-xs text-red-900">Delete testing history permanently</strong>
      <span className="mt-1 block text-[11px] leading-4 text-red-800">This deletes all linked orders, access, and referral history. Type the exact series name:</span>
      <input aria-label={`Type ${productName} to confirm permanent deletion`} value={confirmationName} onChange={(event) => setConfirmationName(event.target.value)} className="mt-2 w-full rounded-lg border border-red-200 bg-white px-2.5 py-2 text-xs text-slate-950" />
      <button type="button" onClick={permanentlyDelete} disabled={pending || confirmationName !== productName} className="mt-2 w-full rounded-lg bg-red-700 px-3 py-2 text-xs font-black text-white disabled:opacity-40">{pending ? "Deleting permanently…" : "Permanently delete series"}</button>
    </span>}
  </span>;
}
