import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import Workspace from "./pages/WorkSpace";
import History from "./pages/History";
import { API_URL } from "./utils/evaluationHelpers";

function formatHistoryRecord(record) {
  const evaluation = {
    readable: record.readable,
    summary: record.summary,
    questions: record.questions || [],
  };

  return {
    id: record._id,
    name: record.fileName,
    date: record.createdAt,
    preview: record.imageData || "",
    file: {
      name: record.fileName,
      mimeType: record.mimeType,
    },
    evaluation,
    message: record.readable
      ? "Evaluation loaded from history."
      : "This assignment could not be graded.",
    totalScore: record.summary?.totalScore ?? 0,
    maxScore: record.summary?.maxScore ?? 0,
    percentage:
      record.summary?.maxScore > 0
        ? Math.round(
            (record.summary.totalScore / record.summary.maxScore) * 100
          )
        : 0,
  };
}

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [workspaceKey, setWorkspaceKey] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  async function loadHistory() {
    setHistoryLoading(true);
    setHistoryError("");

    try {
      const response = await fetch(`${API_URL}/api/history`);
      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Could not load history.");
      }

      setHistory((data.history || []).map(formatHistoryRecord));
    } catch (error) {
      setHistoryError(error.message || "Could not connect to the history API.");
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function openHistoryEntry(entry) {
    setOpeningId(entry.id);
    setHistoryError("");

    try {
      const response = await fetch(`${API_URL}/api/history/${entry.id}`);
      const data = await response.json();

      if (!response.ok || data.success !== true) {
        throw new Error(data.message || "Could not load assignment.");
      }

      setSelectedEntry(formatHistoryRecord(data.history));
      setHistoryOpen(false);
    } catch (error) {
      setHistoryError(error.message || "Could not load the review image.");
    } finally {
      setOpeningId(null);
    }
  }

  function openWorkspace() {
    setSelectedEntry(null);
    setWorkspaceKey((k) => k + 1);
    setHistoryOpen(false);
  }

  function toggleHistory() {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }

    setHistoryOpen(true);
    loadHistory();
  }

  const closeHistory = useCallback(() => setHistoryOpen(false), []);

  function handleSetHistory(update) {
    setHistory((current) =>
      typeof update === "function" ? update(current) : update
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-100 text-slate-900">
      <Header
        historyOpen={historyOpen}
        onToggleHistory={toggleHistory}
        onCloseHistory={closeHistory}
        historyCount={history.length}
        onNewAssignment={openWorkspace}
      />

      <main className="min-h-0 flex-1">
        <div className="mx-auto h-full w-full max-w-[1600px] px-3 py-3 sm:px-4">
          <Workspace
            key={workspaceKey}
            history={history}
            setHistory={handleSetHistory}
            selectedEntry={selectedEntry}
            onOpenHistory={toggleHistory}
          />
        </div>
      </main>

      <footer className="shrink-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-1.5 text-[11px] text-slate-400">
          <p>GradeWise · Learn from your mistakes, one answer at a time.</p>
          <p className="hidden sm:block">
            Evaluation is AI-assisted. Review important grading decisions
            carefully.
          </p>
        </div>
      </footer>

      <History
        open={historyOpen}
        onClose={closeHistory}
        history={history}
        loading={historyLoading}
        error={historyError}
        onRetry={loadHistory}
        openingId={openingId}
        activeId={selectedEntry?.id}
        onOpenEntry={openHistoryEntry}
        onNewAssignment={openWorkspace}
      />
    </div>
  );
}