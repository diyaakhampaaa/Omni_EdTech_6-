import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileText, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { useLesson } from "../../context/LessonContext.jsx";

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

export default function Uploader({ onUploaded }) {
  const { upload, loading, error } = useLesson();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    referenceBook: "",
    chapter: "",
    pageRange: "",
  });
  const [formError, setFormError] = useState(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected?.length) {
      setFormError(rejected[0].errors?.[0]?.message || "That file type isn't supported.");
      return;
    }
    setFormError(null);
    setFile(accepted[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024,
  });

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);

    if (!file) return setFormError("Attach a PDF or image of the teaching material first.");
    if (!form.title.trim() || !form.subject.trim()) {
      return setFormError("Lesson title and subject are required.");
    }

    try {
      const lesson = await upload({ file, ...form });
      onUploaded?.(lesson);
    } catch {
      // error surfaced via context `error`
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="uploader-heading">
      <h2 id="uploader-heading" className="text-xl font-semibold text-slate-900 dark:text-white">
        1. Upload teaching material
      </h2>

      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer
          ${isDragActive ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20" : "border-slate-300 dark:border-slate-700"}
        `}
        role="button"
        tabIndex={0}
        aria-label="Upload PDF or image of teaching material, drag and drop or click to browse"
      >
        <input {...getInputProps()} />
        <UploadCloud className="h-10 w-10 text-brand-500" aria-hidden="true" />
        {file ? (
          <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-3 py-2 shadow-sm">
            {file.type === "application/pdf" ? (
              <FileText className="h-5 w-5 text-brand-600" aria-hidden="true" />
            ) : (
              <ImageIcon className="h-5 w-5 text-brand-600" aria-hidden="true" />
            )}
            <span className="text-sm font-medium">{file.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              aria-label={`Remove ${file.name}`}
              className="ml-1 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <p className="font-medium text-slate-700 dark:text-slate-200">
              Drag & drop a PDF or image, or click to browse
            </p>
            <p className="text-sm text-slate-500">PDF, PNG, JPG, or WEBP up to 25MB</p>
          </>
        )}
      </div>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          2. Reference textbook context
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Lesson title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Reflection & Refraction of Light"
              className="input"
              required
            />
          </Field>
          <Field label="Subject" required>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => updateField("subject", e.target.value)}
              placeholder="Physics / Science"
              className="input"
              required
            />
          </Field>
          <Field label="Reference book name">
            <input
              type="text"
              value={form.referenceBook}
              onChange={(e) => updateField("referenceBook", e.target.value)}
              placeholder="NCERT Class 10 Science"
              className="input"
            />
          </Field>
          <Field label="Chapter & topic">
            <input
              type="text"
              value={form.chapter}
              onChange={(e) => updateField("chapter", e.target.value)}
              placeholder="Chapter 10: Light – Reflection & Refraction"
              className="input"
            />
          </Field>
          <Field label="Page range / focus areas" className="sm:col-span-2">
            <input
              type="text"
              value={form.pageRange}
              onChange={(e) => updateField("pageRange", e.target.value)}
              placeholder="pp. 168–182, focus on ray diagrams and lens formula"
              className="input"
            />
          </Field>
        </div>
      </fieldset>

      {(formError || error) && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {formError || error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {loading ? "Uploading…" : "Upload & continue to audit"}
      </button>
    </form>
  );
}

function Field({ label, required, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
