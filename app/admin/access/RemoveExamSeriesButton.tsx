"use client";

import { useState, useTransition } from "react";
import { removeAccessProduct } from "./actions";

export function RemoveExamSeriesButton({ productId, productName }: { productId: string; productName: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function remove() {
    if (!window.confirm(`Remove “${productName}”? If students have purchased it, it will be paused safely instead of deleted.`)) return;
    startTransition(async () => setMessage((await removeAccessProduct(productId)).message));
  }

  return <span className="inline-flex flex-col items-end gap-1"><button type="button" onClick={remove} disabled={pending} className="rounded-lg px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">{pending ? "Removing…" : "Remove"}</button>{message && <span role="status" className="max-w-64 text-right text-xs leading-5 text-slate-600">{message}</span>}</span>;
}
