"use client";

import { useActionState } from "react";
import { SeoFields } from "@/components/admin/SeoFields";
import { StateSymbol } from "@/components/exams/CatalogSymbols";
import { PendingSubmitButton } from "@/components/feedback/PendingSubmitButton";
import {
  createExamState,
  deleteExamState,
  toggleExamState,
  updateExamStateSeo,
  updateExamStateSlug,
  type StateActionResult,
} from "@/app/admin/states/actions";

type ManagedState = {
  id: string;
  name: string;
  code: string;
  slug: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  isActive: boolean;
  displayOrder: number;
  categoryCount: number;
};

const initialState: StateActionResult = { success: false, message: "" };

function StateSeoForm({ state }: { state: ManagedState }) {
  const [result, action, pending] = useActionState(updateExamStateSeo, initialState);
  return (
    <form action={action} className="mt-4 border-t border-slate-100 pt-4">
      <input type="hidden" name="id" value={state.id} />
      <SeoFields
        title={state.seoTitle}
        description={state.seoDescription}
        titlePlaceholder={`${state.name} Mock Tests`}
        descriptionPlaceholder={`Browse free ${state.name} exam mock tests by exam and paper.`}
      />
      <button
        disabled={pending}
        className="mt-3 rounded-xl bg-teal-800 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-teal-900 disabled:opacity-50"
      >
        {pending ? "Saving search appearance…" : "Save search appearance"}
      </button>
      {result.message && (
        <p
          aria-live="polite"
          className={`mt-2 text-xs font-semibold ${result.success ? "text-emerald-700" : "text-rose-700"}`}
        >
          {result.message}
        </p>
      )}
    </form>
  );
}

export function StateManager({ states }: { states: ManagedState[] }) {
  const [result, action] = useActionState(createExamState, initialState);
  return (
    <details className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-5 px-6 py-5 transition hover:bg-slate-50/50 sm:px-7">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-teal-800">
            Catalogue Settings
          </span>
          <strong className="mt-1 block text-lg font-bold text-slate-900 sm:text-xl">
            Manage States & Regions
          </strong>
          <span className="mt-0.5 block text-xs text-slate-500">
            Configure State catalogues (e.g. Telangana, Andhra Pradesh). Every recruiting board belongs to one state.
          </span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
          Configure Regions
        </span>
      </summary>

      <div className="border-t border-slate-100 bg-[#f8fbfb] p-5 sm:p-7">
        <div className="grid gap-3.5 xl:grid-cols-2">
          {states.map((state) => (
            <article key={state.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-800 border border-teal-200/60">
                  <StateSymbol slug={state.slug} className="h-5 w-5" />
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    state.isActive ? "border border-emerald-200 bg-emerald-50 text-emerald-800" : "border border-slate-200 bg-slate-100 text-slate-600"
                  }`}
                >
                  {state.isActive ? "Visible" : "Hidden"}
                </span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <h3 className="text-base font-bold text-slate-900">{state.name}</h3>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                  {state.code}
                </span>
              </div>
              <p className="mt-0.5 font-mono text-xs text-slate-400">
                /{state.slug} · {state.categoryCount} {state.categoryCount === 1 ? "board" : "boards"}
              </p>

              <form action={updateExamStateSlug} className="mt-3.5 flex gap-2">
                <input type="hidden" name="id" value={state.id} />
                <input
                  name="slug"
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  defaultValue={state.slug}
                  aria-label={`${state.name} URL slug`}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:outline-none"
                />
                <PendingSubmitButton pendingLabel="Saving…" className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
                  Save URL
                </PendingSubmitButton>
              </form>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Changing this keeps the previous URL as a permanent redirect.
              </p>

              <StateSeoForm state={state} />

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <form action={toggleExamState}>
                  <input type="hidden" name="id" value={state.id} />
                  <input type="hidden" name="is_active" value={String(state.isActive)} />
                  <PendingSubmitButton
                    pendingLabel={state.isActive ? "Hiding…" : "Showing…"}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {state.isActive ? "Hide from Students" : "Show to Students"}
                  </PendingSubmitButton>
                </form>
                {state.categoryCount === 0 && (
                  <form action={deleteExamState}>
                    <input type="hidden" name="id" value={state.id} />
                    <PendingSubmitButton
                      pendingLabel="Deleting…"
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Delete State
                    </PendingSubmitButton>
                  </form>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Add Another State Form */}
        <form action={action} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-2 lg:grid-cols-4 shadow-xs">
          <div className="lg:col-span-4">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-teal-800">
              Add New State or Region Catalogue
            </p>
          </div>
          <label className="text-xs font-semibold text-slate-700">
            Name
            <input
              name="name"
              required
              placeholder="Example: Karnataka"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Short Code
            <input
              name="code"
              required
              maxLength={8}
              placeholder="KA"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 uppercase focus:border-teal-500 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            URL Slug
            <input
              name="slug"
              pattern="[a-z0-9-]+"
              placeholder="karnataka"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Display Order
            <input
              name="display_order"
              type="number"
              min="0"
              defaultValue={states.length + 1}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </label>
          <label className="text-xs font-semibold text-slate-700 md:col-span-2 lg:col-span-4">
            Student Description
            <input
              name="description"
              placeholder="Short explanation shown on the student site"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-normal text-slate-900 focus:border-teal-500 focus:outline-none"
            />
          </label>
          <SeoFields
            className="md:col-span-2 lg:col-span-4"
            titlePlaceholder="State Mock Tests"
            descriptionPlaceholder="Browse free state exam mock tests by exam and paper."
          />
          <div className="flex items-end">
            <PendingSubmitButton
              pendingLabel="Adding catalogue…"
              className="w-full rounded-xl bg-teal-800 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-teal-900"
            >
              Add Region Catalogue
            </PendingSubmitButton>
          </div>
          {result.message && (
            <p
              className={`text-xs font-semibold md:col-span-2 lg:col-span-4 ${
                result.success ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {result.message}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}
