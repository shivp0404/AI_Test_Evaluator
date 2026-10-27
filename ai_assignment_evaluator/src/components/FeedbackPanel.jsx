import { FeedbackList } from "./ScoreCards";

export default function FeedbackPanel({ wellDone = [], improve = [] }) {
  return (
    <section className="grid h-full min-h-0 grid-rows-2 gap-3">
      <FeedbackList title="What you did well" items={wellDone} variant="positive" />
      <FeedbackList title="What to improve" items={improve} variant="improve" />
    </section>
  );
}