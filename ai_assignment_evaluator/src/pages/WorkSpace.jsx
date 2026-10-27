import { useEffect, useMemo, useRef, useState } from "react";
import UploadPanel from "../components/UploadPanel";
import ProgressPanel from "../components/ProgressPanel";
import { ScoreCard } from "../components/ScoreCards";
import ImageComparison from "../components/ImageComparison";
import FeedbackPanel from "../components/FeedbackPanel";
import {
  API_URL,
  MAX_FILE_SIZE,
  numberOr,
  getQuestionStatus,
} from "../utils/evaluationHelpers";

function NewAssignmentIcon({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="New assignment"
      aria-label="New assignment"
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-base font-semibold leading-none text-white shadow-sm transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    >
      +
    </button>
  );
}

export default function Workspace({
  setHistory,
  selectedEntry,
  onOpenHistory,
}) {
  const fileInput = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [screen, setScreen] = useState("home");

  // Simulated progress while the backend is processing.
  // It must never reach 100% before a successful response.
  useEffect(() => {
    if (!uploading) return undefined;

    const timer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return 90;

        return Math.min(
          90,
          current + Math.max(1, Math.ceil((90 - current) / 12))
        );
      });

      // Reserve the final stage for the successful response.
      setStageIndex((current) => Math.min(3, current + 1));
    }, 2200);

    return () => window.clearInterval(timer);
  }, [uploading]);

  // Load a previous evaluation from history.
  useEffect(() => {
    if (!selectedEntry) return;

    setFile(null);
    setPreview(selectedEntry.preview || "");
    setResult({
      success: true,
      message: selectedEntry.message,
      file: selectedEntry.file,
      evaluation: selectedEntry.evaluation,
      status: 200,
    });
    setError("");
    setProgress(100);
    setStageIndex(4);
    setScreen("results");
  }, [selectedEntry]);

  function selectFile(event) {
    const selectedFile = event.target.files?.[0];

    // Allow selecting the same file again later.
    event.target.value = "";

    if (!selectedFile) return;

    setError("");
    setResult(null);

    if (!selectedFile.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("The image must be smaller than 5 MB.");
      return;
    }

    setFile(selectedFile);
    setPreview("");
    setProgress(0);
    setStageIndex(0);
    setScreen("home");

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(String(reader.result || ""));
    };

    reader.onerror = () => {
      setError("Could not preview this image. Please select it again.");
      setFile(null);
      setPreview("");
    };

    reader.readAsDataURL(selectedFile);
  }

  async function uploadAssignment() {
    if (!file) {
      setError("Please select an assignment image first.");
      return;
    }

    if (!preview) {
      setError("Please wait until the image preview is ready.");
      return;
    }

    if (!API_URL) {
      setError(
        "Backend URL is missing. Set VITE_API_URL in your frontend .env file."
      );
      return;
    }

    setUploading(true);
    setScreen("processing");
    setProgress(5);
    setStageIndex(0);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("assignment", file);

      const response = await fetch(`${API_URL}/api/assignments/evaluate`, {
        method: "POST",
        body: formData,
      });

      // Handle non-JSON responses without treating them as success.
      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || data?.success !== true) {
        throw new Error(data?.message || "Assignment evaluation failed.");
      }

      const evaluation = data.evaluation;

      // Validate the evaluation before displaying completion.
      if (
        !evaluation ||
        typeof evaluation.readable !== "boolean" ||
        !evaluation.summary ||
        !Array.isArray(evaluation.questions)
      ) {
        throw new Error(
          "The server response did not contain a valid evaluation."
        );
      }

      // A valid response saying the image is unreadable is not a
      // successful grading result. Show the explanation instead.
      if (evaluation.readable === false) {
        setResult({
          ...data,
          status: response.status,
        });

        setProgress(100);
        setStageIndex(4);
        setScreen("results");
        return;
      }

      // Validate scoring data before marking the evaluation complete.
      const summary = evaluation.summary;

      if (
        !Number.isFinite(summary.totalScore) ||
        !Number.isFinite(summary.maxScore) ||
        summary.maxScore < 0 ||
        summary.totalScore < 0
      ) {
        throw new Error("The server returned invalid scoring information.");
      }

      const questions = evaluation.questions;

      const totalScore = numberOr(
        summary.totalScore,
        questions.reduce((sum, question) => sum + numberOr(question.score), 0)
      );

      const maxScore = numberOr(
        summary.maxScore,
        questions.reduce(
          (sum, question) => sum + numberOr(question.maxScore, 1),
          0
        )
      );

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        date: new Date().toISOString(),
        totalScore,
        maxScore,
        percentage:
          maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
        preview,
        evaluation,
        file: data.file || {
          name: file.name,
          size: file.size,
          mimeType: file.type,
        },
        message: data.message || evaluation.message || "Evaluation completed.",
      };

      // Save the completed evaluation to client-side history.
      setHistory((current) => [entry, ...current]);

      setResult({
        ...data,
        status: response.status,
      });

      // Only a valid, readable evaluation reaches 100%.
      setProgress(100);
      setStageIndex(4);

      // Changing screens closes the full-screen processing overlay.
      setScreen("results");
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the backend. Check that the server is running."
      );

      // Do not leave a failed evaluation at 100%.
      setProgress((current) => Math.min(current, 99));
      setScreen("home");
    } finally {
      setUploading(false);
    }
  }

  function resetAssignment() {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");
    setProgress(0);
    setStageIndex(0);
    setScreen("home");

    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  const evaluation = result?.evaluation ?? result;
  const summary = evaluation?.summary ?? {};

  const questions = Array.isArray(evaluation?.questions)
    ? evaluation.questions
    : [];

  const evaluationAvailable = Boolean(
    result?.success === true &&
      result?.status >= 200 &&
      result?.status < 300 &&
      evaluation?.readable === true &&
      summary &&
      questions.length > 0
  );

  const totalScore = numberOr(
    summary.totalScore,
    questions.reduce((sum, question) => sum + numberOr(question.score), 0)
  );

  const maxScore = numberOr(
    summary.maxScore,
    questions.reduce(
      (sum, question) => sum + numberOr(question.maxScore, 1),
      0
    )
  );

  const percentage =
    maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const correctCount = questions.filter(
    (question) => getQuestionStatus(question) === "correct"
  ).length;

  const incorrectCount = questions.filter(
    (question) => getQuestionStatus(question) === "incorrect"
  ).length;

  const partialCount = questions.filter(
    (question) => getQuestionStatus(question) === "partially_correct"
  ).length;

  const wellDone = useMemo(() => {
    const fromAI =
      summary.whatWentWell ?? summary.strengths ?? summary.correctAreas;

    if (Array.isArray(fromAI)) {
      return fromAI.filter(Boolean).map(String);
    }

    return questions
      .filter((question) => getQuestionStatus(question) === "correct")
      .slice(0, 4)
      .map(
        (question) =>
          question.feedback ||
          `${question.question || "An answer"} was marked correct.`
      );
  }, [summary, questions]);

  const improve = useMemo(() => {
    const fromAI =
      summary.areasToImprove ?? summary.improvements ?? summary.weaknesses;

    if (Array.isArray(fromAI)) {
      return fromAI.filter(Boolean).map(String);
    }

    return questions
      .filter((question) =>
        ["incorrect", "partially_correct", "unclear"].includes(
          getQuestionStatus(question)
        )
      )
      .slice(0, 5)
      .map(
        (question) =>
          question.feedback ||
          `Review ${question.question || "this question"} and its expected answer.`
      );
  }, [summary, questions]);

  return (
    <div className="mx-auto h-full min-h-0 w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* HOME / UPLOAD */}
      {screen === "home" && (
        <section className="mx-auto h-full w-full max-w-3xl overflow-y-auto py-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              GradeWise
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Upload your assignment to receive marks, corrections,
              and feedback.
            </p>
          </div>

          <UploadPanel
            fileInput={fileInput}
            file={file}
            preview={preview}
            result={result}
            uploading={uploading}
            progress={progress}
            stageIndex={stageIndex}
            error={error}
            onSelectFile={selectFile}
            onUpload={uploadAssignment}
            onReset={resetAssignment}
            onFullscreen={() => {
              if (preview) {
                window.open(preview, "_blank", "noopener,noreferrer");
              }
            }}
          />

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={uploadAssignment}
                disabled={!file || uploading}
                className="mt-3 rounded-lg bg-rose-700 px-4 py-2 font-semibold text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry evaluation
              </button>
            </div>
          )}
        </section>
      )}

      {/* FULL-SCREEN PROCESSING OVERLAY */}
      {screen === "processing" && (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Assignment evaluation progress"
        >
          <ProgressPanel progress={progress} stageIndex={stageIndex} />
        </div>
      )}

      {/* RESULTS */}
      {screen === "results" && result && (
        <section className="flex h-full min-h-0 flex-col">
          {!evaluationAvailable ? (
            <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <NewAssignmentIcon onClick={resetAssignment} />
              <p>
                Make sure the full page is visible and the handwriting is
                readable, then upload a clearer image.
              </p>
            </div>
          ) : (
            <div className="grid h-full min-h-0 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:overflow-hidden">
              {/* LEFT: evaluated image only */}
              <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <NewAssignmentIcon onClick={resetAssignment} />
                    <h2 className="text-sm font-bold text-slate-900">
                      Evaluated assignment
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500">
                    {questions.length} questions reviewed
                  </span>
                </div>

                <div className="min-h-0 flex-1 overflow-hidden rounded-xl bg-slate-100">
                  <div className="h-full w-full overflow-auto [&_img]:mx-auto [&_img]:max-h-full [&_img]:w-auto [&_img]:max-w-full [&_img]:object-contain">
                    <ImageComparison
                      preview={preview}
                      questions={questions}
                      evaluatedImage={evaluation.annotatedImage}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT: cards + feedback */}
              <div className="flex min-h-0 flex-col gap-3">
                <div className="grid shrink-0 grid-cols-4 gap-2">
                  <ScoreCard
                    label="Score"
                    value={`${totalScore}/${maxScore}`}
                    helper={`${percentage}%`}
                  />
                  <ScoreCard
                    label="Correct"
                    value={correctCount}
                    helper="Full marks"
                    tone="emerald"
                  />
                  <ScoreCard
                    label="Incorrect"
                    value={incorrectCount}
                    helper="Review"
                    tone="rose"
                  />
                  <ScoreCard
                    label="Partial"
                    value={partialCount}
                    helper="Partial marks"
                    tone="amber"
                  />
                </div>

                <div className="shrink-0 rounded-xl border border-indigo-100 bg-indigo-50/70 px-3 py-2">
                  <p className="text-xs font-semibold text-indigo-900">
                    Overall feedback
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-700">
                    {summary.overallFeedback ||
                      "No overall feedback was returned."}
                  </p>
                </div>

                <div className="min-h-0 flex-1">
                  <FeedbackPanel wellDone={wellDone} improve={improve} />
                </div>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}