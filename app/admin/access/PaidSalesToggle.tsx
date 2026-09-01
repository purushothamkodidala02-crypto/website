"use client";

import { useFormStatus } from "react-dom";

function ToggleControl({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      role="switch"
      aria-checked={enabled}
      aria-label={`Paid sales ${enabled ? "on" : "off"}. Turn ${enabled ? "off" : "on"}.`}
      disabled={pending}
      className="group inline-flex min-w-36 items-center justify-between gap-3 rounded-full border border-slate-300 bg-white px-2 py-2 shadow-sm transition hover:border-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-wait disabled:opacity-70"
    >
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${enabled ? "bg-teal-700" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
      <span className="pr-2 text-sm font-black text-slate-900" aria-live="polite">
        {pending ? "Updating…" : enabled ? "ON" : "OFF"}
      </span>
    </button>
  );
}

export function PaidSalesToggle({
  enabled,
  action,
}: {
  enabled: boolean;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="enabled" value={String(enabled)} />
      <ToggleControl enabled={enabled} />
    </form>
  );
}
