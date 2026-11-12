"use client";

import { useState } from "react";

type PasswordInputProps = Omit<React.ComponentPropsWithRef<"input">, "type">;

export function PasswordInput({ className = "", ref, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative mt-2">
      <input
        ref={ref}
        {...props}
        type={visible ? "text" : "password"}
        className={`w-full min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 pr-22 text-base font-normal text-slate-900 placeholder:text-slate-400 transition focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15 focus-visible:outline-none aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/20 ${className}`}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-1.5 right-1.5 inline-flex min-w-16 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
        <span>{visible ? "Hide" : "Show"}</span>
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
      <circle cx="12" cy="12" r="2.75" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8">
      <path d="m4 4 16 16M9.7 6.3A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.6 3.2M14.4 14.5A3.2 3.2 0 0 1 9.5 9.6M6.1 8.2A15.4 15.4 0 0 0 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5" />
    </svg>
  );
}
