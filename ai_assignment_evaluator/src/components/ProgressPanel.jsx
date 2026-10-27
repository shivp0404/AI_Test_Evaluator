
import { PROCESS_STAGES } from "../utils/evaluationHelpers";

export default function ProgressPanel({ progress = 0, stageIndex = 0 }) {
  const stage = PROCESS_STAGES[stageIndex] || PROCESS_STAGES[0];
  const safeProgress = Math.min(99, Math.max(0, Number(progress) || 0));

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
        </div>

        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Evaluating your assignment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please keep this window open while GradeWise reviews your answers.
        </p>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-950">
            {stage.label}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {stage.detail}
          </p>
        </div>

        <span className="shrink-0 text-sm font-bold tabular-nums text-indigo-700">
          {safeProgress}%
        </span>
      </div>

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label="Assignment evaluation progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeProgress}
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-[width] duration-500 ease-out"
          style={{ width: `${safeProgress}%` }}
        />
      </div>

      <div className="mt-6 space-y-4">
        {PROCESS_STAGES.map((item, index) => {
          const completed = index < stageIndex;
          const current = index === stageIndex;

          return (
            <div
              key={item.label}
              className="flex items-center gap-3"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  completed
                    ? "bg-emerald-100 text-emerald-700"
                    : current
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {completed ? "✓" : index + 1}
              </span>

              <span
                className={`text-sm ${
                  current
                    ? "font-semibold text-indigo-950"
                    : completed
                      ? "text-slate-600"
                      : "text-slate-400"
                }`}
              >
                {item.label}
              </span>

              {current && (
                <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-indigo-600" />
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">
        GradeWise is processing your assignment. Progress is estimated until
        the server returns a successful evaluation.
      </p>
    </div>
  );
}
