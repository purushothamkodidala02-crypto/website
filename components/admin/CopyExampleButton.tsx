"use client";

import { useState } from "react";

export function CopyExampleButton({ text, label = "Copy example" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyExample() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <button type="button" onClick={() => void copyExample()} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-800" aria-label={label}>{copied ? "Copied" : "Copy"}<span aria-hidden="true">⧉</span></button>;
}
