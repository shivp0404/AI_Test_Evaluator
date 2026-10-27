import ProgressPanel from "./ProgressPanel";

export default function UploadPanel({
  fileInput,
  file,
  preview,
  result,
  uploading,
  progress,
  stageIndex,
  error,
  onSelectFile,
  onUpload,
  onReset,
  onFullscreen,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
            Step 01
          </p>
          <h2 className="mt-1 text-xl font-bold">Upload assignment</h2>
          <p className="mt-1 text-sm leading-5 text-slate-500">
            Choose a clear photo of your printed or handwritten work.
          </p>
        </div>

        <span className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
          Image · Max 5 MB
        </span>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        onChange={onSelectFile}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        disabled={uploading}
        className="group flex min-h-40 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-2xl text-indigo-600 shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
          ↑
        </span>

        <span className="font-semibold text-slate-800">
          {file ? "Choose a different image" : "Click to choose an image"}
        </span>

        <span className="mt-1.5 text-xs text-slate-500">
          PNG, JPG, JPEG, WEBP · up to 5 MB
        </span>
      </button>

      {preview && (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {file?.name || result?.file?.name || "Assignment image"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {file
                  ? `${(file.size / 1024).toFixed(1)} KB`
                  : "Previously evaluated in this session"}
              </p>
            </div>

            <button
              type="button"
              onClick={onReset}
              disabled={uploading}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          <button
            type="button"
            onDoubleClick={onFullscreen}
            title="Double-click to open full screen"
            className="block w-full cursor-zoom-in bg-slate-100 p-3"
          >
            <img
              src={preview}
              alt="Original assignment preview"
              className="mx-auto max-h-80 w-full rounded-lg object-contain"
            />
            <span className="mt-2 block text-center text-xs text-slate-500">
              Double-click image to view full screen
            </span>
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm leading-5 text-rose-700"
        >
          <span className="font-bold">Something went wrong. </span>
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={onUpload}
        disabled={!file || uploading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 font-bold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {uploading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Evaluating your work…
          </>
        ) : (
          <>
            Evaluate assignment <span aria-hidden="true">→</span>
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Your original image is kept unchanged in the review.
      </p>

      {uploading && (
        <ProgressPanel progress={progress} stageIndex={stageIndex} />
      )}
    </section>
  );
}