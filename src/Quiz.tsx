import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, CheckCircle2, XCircle } from 'lucide-react';

export interface QuizQuestion {
    question: string;
    options: {
        text: string;
        explanation: string;
    }[];
    correctAnswerIndex: number;
}

interface QuizProps {
    questions: QuizQuestion[];
    onClose: () => void;
}

const Quiz: React.FC<QuizProps> = ({ questions, onClose }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
    const [showSummary, setShowSummary] = useState(false);

    const handleSelectOption = (optionIdx: number) => {
        if (answers[currentIdx] !== null) return; // Already answered
        const newAnswers = [...answers];
        newAnswers[currentIdx] = optionIdx;
        setAnswers(newAnswers);
    };

    const nextQuestion = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
        } else {
            setShowSummary(true);
        }
    };

    const prevQuestion = () => {
        if (currentIdx > 0) {
            setCurrentIdx(currentIdx - 1);
        }
    };

    const calculateScore = () => {
        let score = 0;
        answers.forEach((ans, idx) => {
            if (ans === null) return;
            if (ans === questions[idx].correctAnswerIndex) {
                score += 1;
            } else {
                score -= 0.025;
            }
        });
        return Math.max(0, score).toFixed(3);
    };

    const correctCount = answers.filter((ans, idx) => ans === questions[idx].correctAnswerIndex).length;
    const incorrectCount = answers.filter((ans, idx) => ans !== null && ans !== questions[idx].correctAnswerIndex).length;

    const handleRetake = () => {
        setCurrentIdx(0);
        setAnswers(new Array(questions.length).fill(null));
        setShowSummary(false);
    };

    if (showSummary) {
        return (
            <div className="quiz-overlay">
                <div className="quiz-header">
                    <h3>Quiz Summary</h3>
                    <button className="icon-btn" onClick={onClose}><X size={24} /></button>
                </div>
                <div className="quiz-content">
                    <div className="quiz-summary">
                        <div className="score-circle">
                            <span className="score-value">{calculateScore()}</span>
                            <span className="score-label">Score</span>
                        </div>
                        <h2 style={{ fontSize: '1.5rem' }}>Well Done!</h2>
                        <div className="summary-stats">
                            <div className="stat-card">
                                <div className="stat-value" style={{ color: '#10b981' }}>{correctCount}</div>
                                <div className="stat-label">Correct</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-value" style={{ color: '#ef4444' }}>{incorrectCount}</div>
                                <div className="stat-label">Incorrect</div>
                            </div>
                        </div>
                        <div className="quiz-summary-actions">
                            <button
                                className="quiz-summary-btn primary"
                                onClick={onClose}
                            >
                                Close Quiz
                            </button>
                            <button
                                className="quiz-summary-btn secondary"
                                onClick={handleRetake}
                            >
                                Retake Quiz
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentIdx];
    const userAnswer = answers[currentIdx];

    return (
        <div className="quiz-overlay">
            <div className="quiz-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3>Knowledge Check</h3>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
                        {currentIdx + 1} / {questions.length}
                    </span>
                </div>
                <button className="icon-btn" onClick={onClose}><X size={24} /></button>
            </div>

            <div className="quiz-progress-nav">
                {questions.map((_, idx) => (
                    <button
                        key={idx}
                        className={`nav-dot ${currentIdx === idx ? 'active' : ''} ${answers[idx] !== null ? 'answered' : ''}`}
                        onClick={() => setCurrentIdx(idx)}
                    >
                        {idx + 1}
                    </button>
                ))}
            </div>

            <div className="quiz-content">
                <div className="question-card">
                    <h2 className="question-text">{currentQuestion.question}</h2>
                    <div className="options-grid">
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = userAnswer === idx;
                            const isCorrect = idx === currentQuestion.correctAnswerIndex;
                            const showResult = userAnswer !== null;

                            let btnClass = 'option-btn';
                            if (showResult) {
                                if (isCorrect) btnClass += ' correct';
                                else if (isSelected) btnClass += ' incorrect';
                            } else if (isSelected) {
                                btnClass += ' selected';
                            }

                            return (
                                <button
                                    key={idx}
                                    className={btnClass}
                                    onClick={() => handleSelectOption(idx)}
                                    disabled={showResult}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{option.text}</span>
                                        {showResult && isCorrect && <CheckCircle2 size={18} color="#10b981" />}
                                        {showResult && isSelected && !isCorrect && <XCircle size={18} color="#ef4444" />}
                                    </div>
                                    {showResult && (isCorrect || isSelected) && (
                                        <div className="option-explanation">
                                            {option.explanation}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="quiz-footer">
                <button
                    className="msg-action-btn"
                    onClick={prevQuestion}
                    disabled={currentIdx === 0}
                    style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
                >
                    <ChevronLeft size={18} /> Previous
                </button>
                <button
                    className="msg-action-btn"
                    onClick={nextQuestion}
                    style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '1.5rem' }}
                >
                    {currentIdx === questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Quiz;
