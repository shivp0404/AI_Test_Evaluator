
import {
  getQuestionStatus,
  getStatusStyles,
  numberOr,
} from "../utils/evaluationHelpers";

export default function QuestionReview({ questions = [] }) {
  if (!questions.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-bold">Question-by-question review</h2>
        <p className="mt-2 text-sm text-slate-500">
          No question-level results were returned by the evaluator.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Detailed review
        </p>
        <h2 className="mt-1 text-xl font-bold">
          Question-by-question feedback
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Review your answers, marks awarded, and suggested corrections.
        </p>
      </div>

      {questions.map((question, index) => {
        const status = getQuestionStatus(question);
        const styles = getStatusStyles(status);
        const score = numberOr(question.score);
        const maxScore = numberOr(question.maxScore, 1);

        return (
          <article
            key={`${index}-${question.question || "question"}`}
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${
              status === "incorrect"
                ? "border-rose-200"
                : status === "partially_correct"
                  ? "border-amber-200"
                  : "border-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 p-4 sm:p-5">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <h3 className="font-semibold leading-6 text-slate-900">
                    {question.question || `Question ${index + 1}`}
                  </h3>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${styles.badge}`}
                  >
                    {styles.label}
                  </span>
                </div>
              </div>

              <p className="shrink-0 text-sm font-bold tabular-nums text-slate-800">
                {score} / {maxScore} marks
              </p>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Your answer
                </p>
                <div className="rounded-xl bg-slate-50 p-3.5 text-sm leading-6 text-slate-700">
                  {question.studentAnswer || "No answer was extracted."}
                </div>
              </div>

              {question.correctAnswer && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Expected answer / correction
                  </p>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-sm leading-6 text-slate-700">
                    {question.correctAnswer}
                  </div>
                </div>
              )}

              {question.feedback && (
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-indigo-700">
                    Teacher's feedback
                  </p>
                  <p className="text-sm leading-6 text-slate-600">
                    {question.feedback}
                  </p>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}
