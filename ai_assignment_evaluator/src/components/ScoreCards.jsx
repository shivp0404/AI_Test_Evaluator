export function ScoreCard({ label, value, helper, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    amber: "bg-amber-50 text-amber-800",
  };
  const symbols = { indigo: "↗", emerald: "✓", rose: "×", amber: "!" };

  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm font-bold ${tones[tone]}`}
        >
          {symbols[tone]}
        </span>
      </div>
      <p className="mt-1 text-xl font-bold tracking-tight text-slate-950">
        {value}
      </p>
      {helper && <p className="truncate text-[11px] text-slate-500">{helper}</p>}
    </div>
  );
}

export function FeedbackList({ title, items = [], variant }) {
  const positive = variant === "positive";

  return (
    <section
      className={`flex min-h-0 flex-col rounded-xl border bg-white p-3 ${
        positive ? "border-emerald-200" : "border-amber-200"
      }`}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base font-bold ${
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-800"
          }`}
        >
          {positive ? "✓" : "↗"}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="truncate text-xs text-slate-500">
            {positive
              ? "Keep using these strengths."
              : "Focus on these in your next attempt."}
          </p>
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
        {items.length > 0 ? (
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li
                key={`${item}-${index}`}
                className="flex gap-2 text-[13px] leading-5 text-slate-700"
              >
                <span
                  className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                    positive ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
            {positive
              ? "No specific strengths were returned."
              : "No specific improvement points were returned."}
          </p>
        )}
      </div>
    </section>
  );
}