"use client";

import { useEffect, useRef, useState } from "react";

const MAX_PDF_BYTES = 20_000_000;

function formatPdfSize(value: number) {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(value / 1_000))} KB`;
}

export function MockTestPdfField({
  currentUrl,
}: {
  currentUrl?: string | null;
}) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [remove, setRemove] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(currentUrl ?? "");
    setSelectedFileName("");
    setFileError("");
    setRemove(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [currentUrl]);

  const activePreviewUrl = remove ? "" : url.trim();

  return (
    <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-slate-900">
            Question Paper / Previous Paper PDF{" "}
            <span className="font-normal text-slate-500">(optional)</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Attach a PDF file (up to 20 MB) or paste a PDF URL. A &ldquo;View PDF&rdquo; button will appear beside this test for all visitors.
          </p>
        </div>
        {activePreviewUrl && !selectedFileName && (
          <a
            href={activePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-900 hover:bg-teal-100"
          >
            <span>View current PDF</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>

      <input type="hidden" name="remove_pdf" value={remove ? "1" : "0"} />

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Upload PDF file
            <input
              ref={fileInputRef}
              name="pdf_file"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                setFileError("");
                if (!file) {
                  setSelectedFileName("");
                  return;
                }
                const isPdf =
                  file.type === "application/pdf" ||
                  /\.pdf$/i.test(file.name);
                if (!isPdf) {
                  setFileError("Please select a valid .pdf file.");
                  setSelectedFileName("");
                  event.target.value = "";
                  return;
                }
                if (file.size > MAX_PDF_BYTES) {
                  setFileError("PDF file must be 20 MB or smaller.");
                  setSelectedFileName("");
                  event.target.value = "";
                  return;
                }
                setSelectedFileName(`${file.name} (${formatPdfSize(file.size)})`);
                setRemove(false);
              }}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-white hover:file:bg-slate-800"
            />
          </label>
          {selectedFileName && (
            <p className="mt-1.5 text-xs font-semibold text-teal-800">
              Selected: {selectedFileName}
            </p>
          )}
          {fileError && (
            <p className="mt-1.5 text-xs font-semibold text-red-600">
              {fileError}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-600">
            Or paste PDF URL / site path
            <input
              name="pdf_url"
              type="text"
              value={remove ? "" : url}
              onChange={(event) => {
                setUrl(event.target.value);
                setRemove(false);
              }}
              placeholder="https://... or /docs/ap-eo-paper-2-2022.pdf"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-normal text-slate-900"
            />
          </label>
          {(activePreviewUrl || selectedFileName) && (
            <button
              type="button"
              onClick={() => {
                setUrl("");
                setSelectedFileName("");
                setFileError("");
                setRemove(true);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="mt-2 text-xs font-semibold text-red-700 hover:underline"
            >
              Remove attached PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
