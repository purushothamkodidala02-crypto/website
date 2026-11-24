"use client";

import { useEffect, useRef, useState } from "react";
import { QuestionMedia } from "@/components/questions/QuestionMedia";

const MAX_IMAGE_BYTES = 2_000_000;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function fileSize(value: number) {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(1)} MB`
    : `${Math.max(1, Math.round(value / 1_000))} KB`;
}

async function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function canvasBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

async function optimizeImage(file: File) {
  if (file.size <= MAX_IMAGE_BYTES) return file;
  const image = await loadImage(file);
  const scale = Math.min(1, 1800 / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the image.");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let optimized: Blob | null = null;
  for (const quality of [0.86, 0.72, 0.58, 0.45]) {
    optimized = await canvasBlob(canvas, quality);
    if (optimized && optimized.size <= MAX_IMAGE_BYTES) break;
  }
  if (!optimized || optimized.size > MAX_IMAGE_BYTES) {
    throw new Error("This image is still larger than 2 MB after optimization. Choose a smaller image.");
  }
  const baseName = file.name.replace(/\.[^.]+$/, "") || "question-image";
  return new File([optimized], `${baseName}.webp`, { type: "image/webp", lastModified: Date.now() });
}

interface ImageUploadCardProps {
  label: string;
  badge?: string;
  helpText?: string;
  fileInputName: string;
  urlInputName: string;
  removeInputName: string;
  currentUrl?: string | null;
  placeholder?: string;
}

function ImageUploadCard({
  label,
  badge,
  helpText,
  fileInputName,
  urlInputName,
  removeInputName,
  currentUrl,
  placeholder = "https://example.com/question-graph.webp",
}: ImageUploadCardProps) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [filePreview, setFilePreview] = useState("");
  const [remove, setRemove] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(currentUrl ?? "");
    setFilePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
    setRemove(false);
    setFileMessage("");
    setFileError("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [currentUrl]);

  useEffect(() => () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  useEffect(() => {
    const form = inputRef.current?.form;
    if (!form) return;
    const preventWhileProcessing = (event: SubmitEvent) => {
      if (processing) event.preventDefault();
    };
    form.addEventListener("submit", preventWhileProcessing);
    return () => form.removeEventListener("submit", preventWhileProcessing);
  }, [processing]);

  const preview = remove ? "" : filePreview || url.trim();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-slate-900">{label}</span>
        {badge && (
          <span className="rounded-md bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800">
            {badge}
          </span>
        )}
      </div>
      {helpText && <p className="mt-1 text-xs text-slate-500">{helpText}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-bold text-slate-700">
          Upload file
          <input
            ref={inputRef}
            name={fileInputName}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={processing}
            onChange={async (event) => {
              const input = event.currentTarget;
              if (filePreview) URL.revokeObjectURL(filePreview);
              setFilePreview("");
              setFileMessage("");
              setFileError("");
              const file = input.files?.[0];
              if (!file) return;
              if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
                input.value = "";
                setFileError("Choose a PNG, JPG, or WebP image.");
                return;
              }
              setProcessing(true);
              try {
                const prepared = await optimizeImage(file);
                if (prepared !== file) {
                  try {
                    const transfer = new DataTransfer();
                    transfer.items.add(prepared);
                    input.files = transfer.files;
                    setFileMessage(`Optimized from ${fileSize(file.size)} to ${fileSize(prepared.size)}.`);
                  } catch {
                    setFileMessage(`${file.name} ready (${fileSize(file.size)}).`);
                  }
                } else {
                  setFileMessage(`${file.name} ready (${fileSize(file.size)}).`);
                }
                setFilePreview(URL.createObjectURL(prepared));
                setUrl("");
                setRemove(false);
              } catch (error) {
                input.value = "";
                setFileError(error instanceof Error ? error.message : "Image could not be prepared.");
              } finally {
                setProcessing(false);
              }
            }}
            className="mt-1.5 block w-full rounded-lg border bg-slate-50 p-2 text-xs font-normal file:mr-2 file:rounded file:border-0 file:bg-slate-900 file:px-2.5 file:py-1 file:text-xs file:font-bold file:text-white"
          />
          {processing && <span className="mt-1 block text-xs font-semibold text-teal-700">Optimizing…</span>}
          {!processing && fileMessage && <span className="mt-1 block text-xs font-semibold text-emerald-700">{fileMessage}</span>}
          {fileError && <span role="alert" className="mt-1 block text-xs font-semibold text-red-700">{fileError}</span>}
        </label>

        <label className="block text-xs font-bold text-slate-700">
          Or paste image URL
          <input
            name={urlInputName}
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => {
              const val = event.target.value;
              setUrl(val);
              setRemove(false);
              if (val.trim()) {
                if (filePreview) URL.revokeObjectURL(filePreview);
                setFilePreview("");
                setFileMessage("");
                setFileError("");
                if (inputRef.current) inputRef.current.value = "";
              }
            }}
            placeholder={placeholder}
            className="mt-1.5 w-full rounded-lg border bg-slate-50 px-3 py-2 text-xs font-normal"
          />
        </label>
      </div>

      {currentUrl && (
        <label className="mt-3 flex items-center gap-2 text-xs font-bold text-red-700">
          <input
            name={removeInputName}
            type="checkbox"
            checked={remove}
            onChange={(event) => {
              const isChecked = event.target.checked;
              setRemove(isChecked);
              if (isChecked) {
                if (filePreview) URL.revokeObjectURL(filePreview);
                setFilePreview("");
                setFileMessage("");
                setFileError("");
                setUrl("");
                if (inputRef.current) inputRef.current.value = "";
              } else {
                setUrl(currentUrl ?? "");
              }
            }}
            className="h-3.5 w-3.5 rounded border-red-300 text-red-600 focus:ring-red-500"
          />
          Remove current image
        </label>
      )}

      {preview && (
        <div className="mt-3 border-t pt-3">
          <p className="text-xs font-semibold text-slate-500">Preview:</p>
          <QuestionMedia src={preview} alt={`${label} preview`} className="mt-2" />
        </div>
      )}
    </div>
  );
}

export function QuestionImageField({
  currentUrl = "",
  currentUrlTe = "",
  languageMode = "bilingual",
}: {
  currentUrl?: string | null;
  currentUrlTe?: string | null;
  languageMode?: "bilingual" | "english" | "telugu";
}) {
  const isBilingual = languageMode === "bilingual";
  const [imageMode, setImageMode] = useState<"single" | "separate">(() => {
    return currentUrlTe ? "separate" : "single";
  });

  return (
    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <legend className="px-2 text-sm font-black text-slate-950">
        Question image settings <span className="font-normal text-slate-500">(optional)</span>
      </legend>

      <p className="text-sm leading-6 text-slate-600">
        Upload PNG, JPG, or WebP up to 2 MB, or paste a public HTTPS image URL.
      </p>

      {/* Mode Selector for Bilingual Subjects */}
      {isBilingual && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-xs font-black uppercase tracking-wider text-slate-500">Image Mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setImageMode("single")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                imageMode === "single"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Single Image (Same for English & Telugu)
            </button>
            <button
              type="button"
              onClick={() => setImageMode("separate")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                imageMode === "separate"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              Different Images (English & Telugu)
            </button>
          </div>
          <input type="hidden" name="image_mode" value={imageMode} />
        </div>
      )}

      {/* English / Telugu Only Mode */}
      {!isBilingual && languageMode === "telugu" && (
        <div className="mt-4">
          <ImageUploadCard
            label="Telugu Question Image (తెలుగు)"
            badge="Telugu Only"
            fileInputName="question_image"
            urlInputName="image_url"
            removeInputName="remove_image"
            currentUrl={currentUrl || currentUrlTe}
          />
        </div>
      )}

      {!isBilingual && languageMode === "english" && (
        <div className="mt-4">
          <ImageUploadCard
            label="English Question Image"
            badge="English Only"
            fileInputName="question_image"
            urlInputName="image_url"
            removeInputName="remove_image"
            currentUrl={currentUrl}
          />
        </div>
      )}

      {/* Bilingual - Single Shared Image */}
      {isBilingual && imageMode === "single" && (
        <div className="mt-4">
          <ImageUploadCard
            label="Shared Question Image"
            badge="Applies to Both English & Telugu"
            helpText="This single image will be shown to students in both English and Telugu mock test views."
            fileInputName="question_image"
            urlInputName="image_url"
            removeInputName="remove_image"
            currentUrl={currentUrl}
          />
          {currentUrlTe && (
            <input type="hidden" name="clear_image_te" value="true" />
          )}
        </div>
      )}

      {/* Bilingual - Separate Images */}
      {isBilingual && imageMode === "separate" && (
        <div className="mt-4 space-y-4">
          <ImageUploadCard
            label="English Question Image"
            badge="English View"
            helpText="Displayed when the student views the question in English."
            fileInputName="question_image"
            urlInputName="image_url"
            removeInputName="remove_image"
            currentUrl={currentUrl}
          />

          <ImageUploadCard
            label="Telugu Question Image (తెలుగు)"
            badge="Telugu View"
            helpText="Displayed when the student switches to Telugu. If left empty, it will automatically fall back to the English image."
            fileInputName="question_image_te"
            urlInputName="image_url_te"
            removeInputName="remove_image_te"
            currentUrl={currentUrlTe}
          />
        </div>
      )}
    </fieldset>
  );
}
