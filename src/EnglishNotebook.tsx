import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Play, CheckCircle2, XCircle, Sparkles } from "lucide-react";

interface EnglishExercise {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  isSubmitted: boolean;
  isCorrect?: boolean;
}

interface EnglishNotebookProps {
  value: string;
  appliedCode: string | null;
  onCellsChange: (cellsJson: string) => void;
  onExplain?: (index: number) => void;
}

export function EnglishNotebook({ value, appliedCode, onCellsChange, onExplain }: EnglishNotebookProps) {
  const [exercises, setExercises] = useState<EnglishExercise[]>([]);
  const [activeCellIdx, setActiveCellIdx] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize from value prop on mount or when value changes (if exercises empty)
  useEffect(() => {
    if (value && exercises.length === 0) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setExercises(parsed);
        }
      } catch (e) {
        console.error("Failed to parse initial English exercises:", e);
      }
    }
  }, [value]);

  // Handle code application from AI
  useEffect(() => {
    if (appliedCode) {
      try {
        const parsed = JSON.parse(appliedCode);
        if (Array.isArray(parsed)) {
          setExercises(parsed.map(ex => ({
            ...ex,
            userAnswer: ex.userAnswer || "",
            isSubmitted: ex.isSubmitted || false
          })));
        }
      } catch (e) {
        console.error("Failed to parse applied English exercises:", e);
      }
    }
  }, [appliedCode]);

  // Persist changes
  useEffect(() => {
    if (exercises.length > 0) {
      onCellsChange(JSON.stringify(exercises));
    }
  }, [exercises, onCellsChange]);

  const handleInputChange = (idx: number, value: string) => {
    const newEx = [...exercises];
    newEx[idx].userAnswer = value;
    // Reset submission state when editing, so user can re-submit
    newEx[idx].isSubmitted = false;
    newEx[idx].isCorrect = undefined;
    setExercises(newEx);
  };

  const checkAnswer = (idx: number) => {
    const ex = exercises[idx];
    if (!ex.userAnswer.trim()) return;

    // Flexible checking: ignore case, extra spaces, and trailing punctuation
    const normalize = (str: string) => 
      str.toLowerCase().replace(/[.,!?;:]+$/, "").replace(/\s+/g, " ").trim();

    const isCorrect = normalize(ex.userAnswer) === normalize(ex.correctAnswer);

    const newEx = [...exercises];
    newEx[idx].isSubmitted = true;
    newEx[idx].isCorrect = isCorrect;
    setExercises(newEx);

    // Focus next cell if available (only if correct, like Jupyter moving forward)
    if (isCorrect && idx < exercises.length - 1) {
      setActiveCellIdx(idx + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      checkAnswer(idx);
    }
  };

  if (exercises.length === 0) {
    return (
      <div className="english-notebook-empty" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
        <Play size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
        <p style={{ marginBottom: "24px" }}>No exercises loaded. Select a "Practice Questions" topic in the sidebar or ask the AI to generate some!</p>
        <button 
            className="btn btn-secondary" 
            onClick={() => {
                // If it's invalid JSON or empty, we might want a way to force a reset via some app level action, 
                // but here we can just suggest what to do.
            }}
            style={{ pointerEvents: "none", opacity: 0.6 }}
        >
          Exercises will appear here
        </button>
      </div>
    );
  }

  return (
    <div className="notebook-container" ref={containerRef}>
      <div className="notebook-cells">
        {exercises.map((ex, idx) => (
          <div 
            key={ex.id || idx} 
            className={`exercise-cell ${activeCellIdx === idx ? 'active' : ''} ${ex.isSubmitted ? 'submitted' : ''}`}
            onClick={() => setActiveCellIdx(idx)}
          >
            <div className="cell-content">
              <div className="cell-question">
                 <ReactMarkdown>{ex.question}</ReactMarkdown>
              </div>

              <div className="cell-actions-row">
                <button 
                  className="cell-explain-btn" 
                  onClick={(e) => { e.stopPropagation(); onExplain?.(idx); }}
                  title="Explain this question"
                >
                  <Sparkles size={14} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Explain</span>
                </button>
              </div>
              
              <div className="cell-input-wrapper">
                <input
                  type="text"
                  className={`cell-input ${ex.isSubmitted ? (ex.isCorrect ? 'correct' : 'incorrect') : ''}`}
                  placeholder="Type your answer here..."
                  value={ex.userAnswer}
                  onChange={(e) => handleInputChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  autoFocus={idx === 0}
                />
              </div>

              {ex.isSubmitted && (
                <div className={`cell-result ${ex.isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-icon">
                    {ex.isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  </div>
                  <div className="result-text">
                    {ex.isCorrect ? (
                      <span>Great job! That's correct.</span>
                    ) : (
                      <span>
                        Incorrect. The correct answer is: <strong>{ex.correctAnswer}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              {!ex.isSubmitted && (
                <div className="cell-hint">
                  Press <code>Shift + Enter</code> to check your answer
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
