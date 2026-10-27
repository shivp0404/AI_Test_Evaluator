export default function FullscreenImage({
  open,
  preview,
  fileName,
  onClose,
}) {
  if (!open || !preview) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-950/95 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Full screen original assignment image"
      onClick={onClose}
    >
      <div className="mb-3 flex items-center justify-between gap-3 text-white">
        <div className="min-w-0">
          <p className="font-semibold">Original assignment</p>
          <p className="truncate text-xs text-slate-300">
            {fileName || "Assignment image"} · Original image unchanged
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl hover:bg-white/20"
          aria-label="Close full screen"
        >
          ×
        </button>
      </div>

      <div
        className="flex min-h-0 flex-1 items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={preview}
          alt="Full screen original assignment"
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <p className="pt-3 text-center text-xs text-slate-400">
        Press Esc or click outside the image to close.
      </p>
    </div>
  );
}