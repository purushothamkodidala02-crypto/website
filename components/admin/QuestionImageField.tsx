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

export function QuestionImageField({ currentUrl = "" }: { currentUrl?: string | null }) {
  const [url, setUrl] = useState(currentUrl ?? "");
  const [filePreview, setFilePreview] = useState("");
  const [remove, setRemove] = useState(false);
  const [fileMessage, setFileMessage] = useState("");
  const [fileError, setFileError] = useState("");
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    <fieldset className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <legend className="px-2 text-sm font-black text-slate-950">Question image or graph <span className="font-normal text-slate-500">(optional)</span></legend>
      <p className="text-sm leading-6 text-slate-600">Upload a PNG, JPG, or WebP file up to 2 MB, or paste a public HTTPS image URL.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <label className="block text-sm font-bold">
          Upload image
          <input
            ref={inputRef}
            name="question_image"
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
                  const transfer = new DataTransfer();
                  transfer.items.add(prepared);
                  input.files = transfer.files;
                  setFileMessage(`Optimized from ${fileSize(file.size)} to ${fileSize(prepared.size)} for a faster upload.`);
                } else {
                  setFileMessage(`${file.name} is ready to upload (${fileSize(file.size)}).`);
                }
                setFilePreview(URL.createObjectURL(prepared));
                setRemove(false);
              } catch (error) {
                input.value = "";
                setFileError(error instanceof Error ? error.message : "This image could not be prepared.");
              } finally {
                setProcessing(false);
              }
            }}
            className="mt-2 block w-full rounded-xl border bg-white p-2 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white"
          />
          {processing && <span className="mt-2 block text-xs font-semibold text-teal-700">Optimizing the image…</span>}
          {!processing && fileMessage && <span className="mt-2 block text-xs font-semibold text-emerald-700">{fileMessage}</span>}
          {fileError && <span role="alert" className="mt-2 block text-xs font-semibold text-red-700">{fileError}</span>}
        </label>
        <label className="block text-sm font-bold">
          Image URL
          <input
            name="image_url"
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => { setUrl(event.target.value); setRemove(false); }}
            placeholder="https://example.com/question-graph.webp"
            className="mt-2 w-full rounded-xl border bg-white px-4 py-3 font-normal"
          />
        </label>
      </div>
      {currentUrl && (
        <label className="mt-4 flex items-center gap-3 text-sm font-bold text-red-700">
          <input name="remove_image" type="checkbox" checked={remove} onChange={(event) => setRemove(event.target.checked)} className="h-4 w-4" />
          Remove the current question image
        </label>
      )}
      {preview && <QuestionMedia src={preview} alt="Question image preview" className="mt-5" />}
    </fieldset>
  );
}
