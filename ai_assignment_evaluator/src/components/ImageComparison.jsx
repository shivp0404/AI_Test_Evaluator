
import { useState } from "react";
import { getQuestionStatus } from "../utils/evaluationHelpers";
import FullscreenImage from "./FullscreenImage";

function getMarkerStyle(symbol, status) {
  if (symbol === "tick" || status === "correct") {
    return {
      color: "bg-emerald-600",
      label: "Correct",
      icon: "✓",
    };
  }

  if (symbol === "cross" || status === "incorrect") {
    return {
      color: "bg-rose-600",
      label: "Incorrect",
      icon: "✕",
    };
  }

  if (symbol === "partial" || status === "partially_correct") {
    return {
      color: "bg-amber-500",
      label: "Partially correct",
      icon: "½",
    };
  }

  return {
    color: "bg-slate-600",
    label: "Needs review",
    icon: "i",
  };
}

export default function ImageComparison({
  preview,
  questions = [],
  evaluatedImage,
}) {
  const [activeMark, setActiveMark] = useState(null);
  const [fullscreen, setFullscreen] = useState(null);

  if (!preview) return null;

  // The backend currently returns marking coordinates, not an
  // annotated image file. Use the original as the base for the overlay.
  const imageToShow = evaluatedImage || preview;

  const markers = questions.flatMap((question, questionIndex) => {
    const markings = Array.isArray(question?.markings)
      ? question.markings
      : [];

    return markings
      .filter(
        (mark) =>
          Number.isFinite(Number(mark?.x)) &&
          Number.isFinite(Number(mark?.y)) &&
          Number(mark.x) >= 0 &&
          Number(mark.x) <= 100 &&
          Number(mark.y) >= 0 &&
          Number(mark.y) <= 100
      )
      .map((mark, markIndex) => ({
        ...mark,
        question,
        questionIndex,
        markIndex,
        id: `${questionIndex}-${markIndex}`,
      }));
  });

  return (
    <section className="w-full  space-y-6">
    

 

      {/* Evaluated view: original image plus interactive marking overlay */}
      <div className="space-y-2">


        <p className="text-sm text-slate-500">
          Hover over a marker to read its comment. On touch devices, tap
          a marker to open or close the feedback.
        </p>

 <div className="flex h-full min-h-0 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-50 p-1"
          onDoubleClick={() =>
            setFullscreen({
              src: imageToShow,
              title: "Evaluated assignment",
            })
          }
        >
         <div className="relative mx-auto w-fit max-w-full">
           <img
  src={imageToShow}
  alt="Assignment with evaluation markings"
  className="block max-h-[750px] max-w-full object-contain"
/>

            {markers.map((mark) => {
              const question = mark.question;
              const status = getQuestionStatus(question);
              const style = getMarkerStyle(mark.symbol, status);
              const isActive = activeMark === mark.id;

              const comment =
                mark.comment ||
                question.feedback ||
                "No feedback available for this marking.";

              return (
                <div
                  key={mark.id}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${Number(mark.x)}%`,
                    top: `${Number(mark.y)}%`,
                  }}
                  onMouseEnter={() => setActiveMark(mark.id)}
                  onMouseLeave={() => setActiveMark(null)}
                >
                  <button
                    type="button"
                    aria-label={`Question ${mark.questionIndex + 1}: ${style.label}. ${comment}`}
                    aria-expanded={isActive}
                    onClick={(event) => {
                      event.stopPropagation();
                      setActiveMark(isActive ? null : mark.id);
                    }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold text-white shadow-md ring-2 ring-white ${style.color}`}
                  >
                    {style.icon}
                  </button>

                  {isActive && (
                    <div
                      className="absolute left-1/2 top-9 z-30 w-64 max-w-[80vw] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl"
                      onMouseEnter={() => setActiveMark(mark.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900">
                          Question {mark.questionIndex + 1}
                        </p>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium text-white ${style.color}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-5 text-slate-700">
                        {comment}
                      </p>

                      {question.correctAnswer && (
                        <p className="mt-2 text-sm leading-5 text-slate-600">
                          <span className="font-medium">
                            Expected answer:{" "}
                          </span>
                          {question.correctAnswer}
                        </p>
                      )}

                      {question.score != null &&
                        question.maxScore != null && (
                          <p className="mt-2 text-xs font-medium text-slate-500">
                            Marks: {question.score} / {question.maxScore}
                          </p>
                        )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {markers.length === 0 && (
          <p className="rounded-lg bg-amber-50 p-3 text-sm leading-5 text-amber-800">
            No usable marking coordinates were returned. The image is
            displayed unchanged; question-wise feedback is still available
            in the review below.
          </p>
        )}

        {!evaluatedImage && markers.length > 0 && (
          <p className="text-xs leading-5 text-slate-500">
            Markers are displayed over the original image using AI-estimated
            coordinates. They are visual overlays, not pixels drawn into a
            new image file, and their positions may not be exact.
          </p>
        )}
      </div>

      {fullscreen && (
        <FullscreenImage
          src={fullscreen.src}
          title={fullscreen.title}
          onClose={() => setFullscreen(null)}
        />
      )}
    </section>
  );
}
