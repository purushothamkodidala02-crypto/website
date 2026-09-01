"use client";

import { useActionState } from "react";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { completeSocialProfile, type CompleteProfileState } from "./actions";

const initialState: CompleteProfileState = { message: "" };

export function CompleteProfileForm({
  initialName,
  nextPath,
}: {
  initialName: string;
  nextPath: string;
}) {
  const [state, formAction, pending] = useActionState(completeSocialProfile, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      <label htmlFor="social_full_name" className="block text-sm font-bold text-slate-800">
        Full name
        <input
          id="social_full_name"
          name="full_name"
          type="text"
          required
          minLength={2}
          maxLength={120}
          autoComplete="name"
          defaultValue={initialName}
          className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
        />
      </label>
      <label htmlFor="social_phone" className="block text-sm font-bold text-slate-800">
        Mobile number
        <input
          id="social_phone"
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={13}
          placeholder="10-digit Indian mobile number"
          className="mt-2 w-full rounded-xl border px-4 py-3 font-normal"
        />
        <span className="mt-2 block text-xs font-normal leading-5 text-slate-500">
          Used for secure payment details and account support. We do not send login codes by SMS.
        </span>
      </label>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="w-full rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PendingButtonContent pending={pending} pendingLabel="Saving your profile…">
          Save and continue
        </PendingButtonContent>
      </button>
      <LongPendingNotice pending={pending} />
      {state.message && (
        <p role="alert" aria-live="polite" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.message}
        </p>
      )}
    </form>
  );
}
