export default function Header({
  historyOpen,
  onToggleHistory,
  onCloseHistory,
  historyCount,

}) {
  function navClass(active) {
    return `flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
      active
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-600 hover:bg-white hover:text-slate-900"
    }`;
  }

  return (
    <header className="relative z-50 shrink-0 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4">
        <button
          type="button"
          onClick={onCloseHistory}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-black text-white">
            G
          </span>
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight">
              GradeWise
            </span>
            <span className="block text-[11px] text-slate-500">
              AI assignment evaluator
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          <nav
            className="flex items-center gap-1 rounded-xl bg-slate-100 p-1"
            aria-label="Main navigation"
          >
            <button
              type="button"
              className={navClass(!historyOpen)}
              onClick={onCloseHistory}
            >
              <span>▤</span> Workspace
            </button>

            <button
              type="button"
              className={navClass(historyOpen)}
              onClick={onToggleHistory}
              aria-expanded={historyOpen}
              aria-haspopup="dialog"
            >
              <span>◷</span> History
              {historyCount > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    historyOpen
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {historyCount}
                </span>
              )}
            </button>
          </nav>

    
        </div>
      </div>
    </header>
  );
}