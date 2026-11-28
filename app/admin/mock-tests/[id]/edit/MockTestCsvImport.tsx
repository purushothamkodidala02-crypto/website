"use client";

import { useActionState, useState, useTransition } from "react";
import { LongPendingNotice, PendingButtonContent } from "@/components/feedback/LoadingSpinner";
import { ImportIssuesPanel, type RetryImportPayload } from "@/components/admin/ImportIssuesPanel";
import {
  importQuestionsIntoMockTest,
  replaceQuestionsInMockTest,
  type ImportQuestionsState,
} from "@/app/admin/questions/import-actions";

type MockTestCsvImportProps = {
  mockTestId: string;
  isDraft: boolean;
  targetQuestionCount: number;
  assignedQuestionCount: number;
  paperName: string;
  subjectName: string | null;
  defaultSkipCrossTestDuplicateCheck?: boolean;
};

const initialState: ImportQuestionsState = { success: false, message: "" };

export function MockTestCsvImport({
  mockTestId,
  isDraft,
  targetQuestionCount,
  assignedQuestionCount,
  defaultSkipCrossTestDuplicateCheck = false,
}: MockTestCsvImportProps) {
  const importForMock = importQuestionsIntoMockTest.bind(null, mockTestId);
  const [state, action, actionPending] = useActionState(importForMock, initialState);
  const replaceForMock = replaceQuestionsInMockTest.bind(null, mockTestId);
  const [replaceState, replaceAction, replaceActionPending] = useActionState(
    replaceForMock,
    initialState,
  );

  const [isAddTransition, startAddTransition] = useTransition();
  const [isReplaceTransition, startReplaceTransition] = useTransition();
  const pending = actionPending || isAddTransition;
  const replacePending = replaceActionPending || isReplaceTransition;

  const [addFile, setAddFile] = useState<File | null>(null);
  const [addAllowDuplicates, setAddAllowDuplicates] = useState(defaultSkipCrossTestDuplicateCheck);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceAllowDuplicates, setReplaceAllowDuplicates] = useState(
    defaultSkipCrossTestDuplicateCheck,
  );

  function submitAddForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    if (addFile) formData.set("questions_file", addFile);
    startAddTransition(() => {
      action(formData);
    });
  }

  function retryAddImport(payload: RetryImportPayload) {
    if (!addFile) return;
    const effectiveAllowDup = payload.allowDuplicatesOverride ?? addAllowDuplicates;
    setAddAllowDuplicates(effectiveAllowDup);
    const formData = new FormData();
    formData.set("questions_file", addFile);
    if (effectiveAllowDup) formData.set("skip_cross_test_duplicate_check", "1");
    formData.set("row_overrides", JSON.stringify(payload.overrides));
    formData.set("excluded_rows", JSON.stringify(payload.excludedRows));
    startAddTransition(() => {
      action(formData);
    });
  }

  function submitReplaceForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !window.confirm(
        `Replace all ${assignedQuestionCount} assigned Questions?\n\nThe file must contain exactly ${targetQuestionCount} valid Questions. Validation and replacement run as one transaction; if anything fails, the current Questions stay unchanged.`,
      )
    ) {
      return;
    }
    const formData = new FormData(event.currentTarget);
    if (replaceFile) formData.set("questions_file", replaceFile);
    startReplaceTransition(() => {
      replaceAction(formData);
    });
  }

  function retryReplaceImport(payload: RetryImportPayload) {
    if (!replaceFile) return;
    const effectiveAllowDup = payload.allowDuplicatesOverride ?? replaceAllowDuplicates;
    setReplaceAllowDuplicates(effectiveAllowDup);
    const formData = new FormData();
    formData.set("questions_file", replaceFile);
    if (effectiveAllowDup) formData.set("skip_cross_test_duplicate_check", "1");
    formData.set("row_overrides", JSON.stringify(payload.overrides));
    formData.set("excluded_rows", JSON.stringify(payload.excludedRows));
    startReplaceTransition(() => {
      replaceAction(formData);
    });
  }

  return (
    <section className="mt-8 overflow-hidden rounded-3xl border border-teal-100 bg-white shadow-sm">
      <div className="border-b border-teal-100 bg-teal-50/70 px-6 py-5 sm:px-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">
          Fastest way to build this test
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
          Upload Excel or CSV into this mock test
        </h2>
      </div>

      {isDraft ? (
        <div className="p-6 sm:p-7">
          <form onSubmit={submitAddForm}>
            <label className="block rounded-2xl border border-dashed border-teal-300 bg-slate-50 p-5 text-sm font-bold text-slate-800">
              Excel or CSV file
              <input
                name="questions_file"
                type="file"
                accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                required
                onChange={(event) => setAddFile(event.target.files?.[0] ?? null)}
                className="mt-3 block w-full text-sm font-normal file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
              />
              <span className="mt-3 block text-xs font-normal leading-5 text-slate-600">
                Use .xlsx or .xls for the speed option, or CSV as a fallback. Up to 500 Questions or 2.5 MB.
              </span>
            </label>

            <details className="mt-5 rounded-2xl border bg-slate-50 p-4">
              <summary className="cursor-pointer text-sm font-bold text-slate-900">
                Excel columns for this mock test
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Required Question Bank headings: <code className="break-all rounded bg-white px-1.5 py-1 text-xs">import_key,subject,question_en,option_a_en,option_b_en,option_c_en,option_d_en,question_te,option_a_te,option_b_te,option_c_te,option_d_te,correct_answer</code>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                The system reads the <strong>Varadhi Import</strong> sheet when available, otherwise the first sheet. Keep headings in row 1.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Add these optional test columns when needed: <code className="rounded bg-white px-1.5 py-1 text-xs">question_order,marks,negative_marks</code>. Leave them blank to use file row order and this Paper&apos;s default scoring.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                In Excel, paste one PNG or JPG image into the same Question row and it will be uploaded automatically. Alternatively, use the optional <code className="rounded bg-white px-1.5 py-1 text-xs">image_url</code> column with a public HTTPS link. CSV files must use <code className="rounded bg-white px-1.5 py-1 text-xs">image_url</code>.
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                <li>The <strong>subject</strong> must already exist under this Paper.</li>
                <li>For a subject-wise mock, every row must use that selected Subject.</li>
                <li>Use the same <strong>import_key</strong> to correct an imported Question later without creating a duplicate.</li>
                <li>General subjects use English and Telugu columns. Language subjects use only their own language columns.</li>
              </ul>
            </details>

            <label className="mt-4 flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-800">
              <input
                name="skip_cross_test_duplicate_check"
                type="checkbox"
                value="1"
                checked={addAllowDuplicates}
                onChange={(event) => setAddAllowDuplicates(event.target.checked)}
                className="h-4 w-4 shrink-0"
              />
              <span>Allow duplicates</span>
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-4">
              <button
                disabled={pending}
                aria-busy={pending}
                className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PendingButtonContent pending={pending} pendingLabel="Importing…">
                  Import file and add to mock test
                </PendingButtonContent>
              </button>
              {!pending && (
                <p className="text-sm text-slate-500">
                  You can still add or remove individual Questions below.
                </p>
              )}
            </div>
            <LongPendingNotice pending={pending} label="Still importing…" />

            <ImportIssuesPanel
              success={state.success}
              message={state.message}
              issues={state.issues}
              availableSubjects={state.availableSubjects}
              isMockTest={state.isMockTest ?? true}
              importMode={state.importMode ?? "add"}
              hasSelectedFile={Boolean(addFile)}
              pending={pending}
              currentAllowDuplicates={addAllowDuplicates}
              onRetryImport={retryAddImport}
            />
          </form>

          <div className="my-7 border-t border-slate-200" />
          <form onSubmit={submitReplaceForm}>
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.13em] text-red-700">Destructive draft action</p>
              <h3 className="mt-2 text-lg font-black text-slate-950">Replace all Questions from Excel or CSV</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">The complete file is checked first. It must contain exactly <strong>{targetQuestionCount}</strong> valid Questions with unique order numbers. Any error rolls back the entire replacement.</p>
              <label className="mt-4 block text-sm font-bold">
                Replacement file
                <input
                  name="questions_file"
                  type="file"
                  accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  required
                  onChange={(event) => setReplaceFile(event.target.files?.[0] ?? null)}
                  className="mt-2 block w-full text-sm font-normal file:mr-4 file:rounded-lg file:border-0 file:bg-red-700 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
                />
              </label>
              <label className="mt-3 flex items-center gap-2.5 rounded-xl border border-red-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800">
                <input
                  name="skip_cross_test_duplicate_check"
                  type="checkbox"
                  value="1"
                  checked={replaceAllowDuplicates}
                  onChange={(event) => setReplaceAllowDuplicates(event.target.checked)}
                  className="h-4 w-4 shrink-0"
                />
                <span>Allow duplicates</span>
              </label>
              <button
                disabled={replacePending}
                aria-busy={replacePending}
                className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                <PendingButtonContent pending={replacePending} pendingLabel="Replacing…">
                  Validate and replace all
                </PendingButtonContent>
              </button>
              <LongPendingNotice pending={replacePending} label="Still replacing…" />
              <ImportIssuesPanel
                success={replaceState.success}
                message={replaceState.message}
                issues={replaceState.issues}
                availableSubjects={replaceState.availableSubjects}
                isMockTest={replaceState.isMockTest ?? true}
                importMode={replaceState.importMode ?? "replace"}
                hasSelectedFile={Boolean(replaceFile)}
                pending={replacePending}
                currentAllowDuplicates={replaceAllowDuplicates}
                onRetryImport={retryReplaceImport}
              />
            </div>
          </form>
        </div>
      ) : (
        <div className="m-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          This Mock Test is published or archived. Its question list is locked.
        </div>
      )}
    </section>
  );
}
