
export const API_URL = import.meta.env.VITE_API_URL;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

export const PROCESS_STAGES = [
  {
    label: "Uploading assignment",
    detail: "Sending your image securely",
  },
  {
    label: "Reading the page",
    detail: "Extracting questions and handwritten answers",
  },
  {
    label: "Checking answers",
    detail: "Comparing answers with expected solutions",
  },
  {
    label: "Calculating marks",
    detail: "Scoring questions and reviewing mistakes",
  },
  {
    label: "Preparing feedback",
    detail: "Putting together your evaluation",
  },
];

export function numberOr(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

export function getQuestionStatus(question) {
  const status = String(question?.status || "").toLowerCase();

  if (
    ["correct", "partially_correct", "incorrect", "unclear"].includes(
      status
    )
  ) {
    return status;
  }

  const score = numberOr(question?.score);
  const maxScore = numberOr(question?.maxScore, 1);

  if (score >= maxScore) return "correct";
  if (score > 0) return "partially_correct";

  return "incorrect";
}

// Supports legacy question-level coordinates.
// New per-question markings are handled in ImageComparison.jsx.
export function getPosition(question) {
  const position =
    question?.position ||
    question?.coordinates ||
    question?.bbox;

  if (
    position &&
    Number.isFinite(Number(position.x)) &&
    Number.isFinite(Number(position.y))
  ) {
    const scale =
      Number(position.x) > 100 ||
      Number(position.y) > 100 ||
      Number(position.width) > 100 ||
      Number(position.height) > 100
        ? 1000
        : 100;

    return {
      left: `${Math.min(
        98,
        Math.max(2, (Number(position.x) / scale) * 100)
      )}%`,
      top: `${Math.min(
        96,
        Math.max(2, (Number(position.y) / scale) * 100)
      )}%`,
    };
  }

  return null;
}

export function getStatusStyles(status) {
  const styles = {
    correct: {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
      marker: "border-emerald-500 bg-emerald-500 text-white",
      symbol: "✓",
      label: "Correct",
    },
    partially_correct: {
      badge: "bg-amber-50 text-amber-800 ring-amber-200",
      marker: "border-amber-500 bg-amber-500 text-white",
      symbol: "½",
      label: "Partially correct",
    },
    unclear: {
      badge: "bg-slate-100 text-slate-700 ring-slate-200",
      marker: "border-slate-500 bg-slate-600 text-white",
      symbol: "?",
      label: "Needs review",
    },
    incorrect: {
      badge: "bg-rose-50 text-rose-700 ring-rose-200",
      marker: "border-rose-500 bg-rose-500 text-white",
      symbol: "×",
      label: "Incorrect",
    },
  };

  return styles[status] || styles.incorrect;
}
