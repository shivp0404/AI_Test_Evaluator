import { useEffect, useRef } from "react";

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function badgeClass(percentage) {
  if (percentage >= 70) return "bg-emerald-50 text-emerald-700";
  if (percentage >= 40) return "bg-amber-50 text-amber-800";
  return "bg-rose-50 text-rose-700";
}

export default function History({
  open,
  onClose,
  history = [],
  loading = false,
  error = "",
  onRetry,
  openingId = null,
  activeId = null,
  onOpenEntry,
  onNewAssignment,
}) {
  const closeButton = useRef(null);

  // Close on Escape and move focus into the drawer when it opens.
  useEffect(() => {
    if (!open) return undefined;

    closeButton.current?.focus();

    function onKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const average = history.length
    ? Math.round(
        history.reduce((sum, entry) => sum + (entry.percentage || 0), 0) /
          history.length
      )
    : null;

  return (
    <>
      {/* Backdrop (starts below the 56px header so the toggle stays usable) */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-x-0 bottom-0 top-14 z-30 cursor-default bg-slate-950/30 transition-opacity duration-200 motion-reduce:transition-none ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-label="Assignment history"
        aria-hidden={!open}
        className={`fixed bottom-0 right-0 top-14 z-40 flex w-[min(24rem,100vw)] flex-col border-l border-slate-200 bg-white shadow-xl transition-[transform,visibility] duration-200 motion-reduce:transition-none ${
          open ? "translate-x-0" : "invisible translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900">History</h2>
            <p className="text-xs text-slate-500">
              {history.length} {history.length === 1 ? "evaluation" : "evaluations"}
              {average !== null && ` · average ${average}%`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onNewAssignment}
              className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <span aria-hidden="true">+</span> New
            </button>
            <button
              ref={closeButton}
              type="button"
              onClick={onClose}
              aria-label="Close history"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-indigo-600"
            >
              ×
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="m-3 shrink-0 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700"
          >
            {error}
            <button
              type="button"
              onClick={onRetry}
              className="ml-2 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-slate-500">
              Loading your history...
            </p>
          ) : history.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl text-indigo-600">
                ◷
              </div>
              <h3 className="mt-4 font-bold text-slate-900">No evaluations yet</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Completed evaluations will appear here.
              </p>
              <button
                type="button"
                onClick={onNewAssignment}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Evaluate your first assignment
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {history.map((entry) => {
                const active = entry.id === activeId;
                const opening = entry.id === openingId;

                return (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => onOpenEntry(entry)}
                      disabled={opening}
                      aria-current={active ? "true" : undefined}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-wait ${
                        active
                          ? "bg-indigo-50"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lg text-indigo-600">
                        ▧
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {entry.name}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {opening ? "Opening..." : formatDate(entry.date)}
                        </span>
                      </span>

                      <span className="shrink-0 text-right">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${badgeClass(
                            entry.percentage
                          )}`}
                        >
                          {entry.percentage}%
                        </span>
                        <span className="mt-0.5 block text-[11px] tabular-nums text-slate-500">
                          {entry.totalScore}/{entry.maxScore}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}