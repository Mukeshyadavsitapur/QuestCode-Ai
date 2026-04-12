---
name: english_exercise_notebook
description: Implementation guide for a cell-based interactive English grammar notebook with contextual AI support and per-chapter persistence.
---

# English Exercise Notebook Skill

This skill documents the architecture and guidelines for the interactive English Exercise Notebook, which provides a Jupyter-style learning experience for grammar practice.

## 🚀 Core Philosophy

The English Exercise Notebook transforms passive reading into active practice. Instead of just reading about grammar, students solve targeted exercises in "cells" that provide instant feedback.

1.  **Iterative Practice**: Cells are re-editable. Students can correct their answers and re-submit with `Shift + Enter`.
2.  **Immediate Feedback**: Success/Error icons and color-coding provide instant visual confirmation.
3.  **Contextual AI Support**: Every question has a **Sparkles** button that triggers a cell-specific explanation from the AI tutor.
4.  **Chapter Sync**: Exercise progress is saved automatically per-chapter, ensuring students don't lose work when switching topics.

---

## 📂 Data Structure

Exercises are defined in `src/englishExercises.ts` and follow this interface:

```typescript
export interface EnglishExercise {
  id: string;           // Unique ID (e.g. "1.1-ex1")
  question: string;     // Markdown string for the question
  correctAnswer: string;// String to match against (normalized during check)
  userAnswer: string;   // Current input from the user
  isSubmitted: boolean; // Whether the user has pressed enter
  isCorrect?: boolean;  // Result of the last check
}
```

### Resource: `src/englishExercises.ts`
This file acts as the curriculum data store. Map `topicId` (from `TOPICS_ENGLISH`) to an array of `EnglishExercise` objects.

---

## 🛠️ UI & Interaction Rules

### 1. Cell Labels
- **Default**: `In [n]:`
- **Correct**: `In [✓]:` (Green icon)
- **Incorrect**: `In [✗]:` (Red icon)
- Correct/Error icons should be placed **below** the **Sparkles** button in the sidebar.

### 2. The AI Button (Sparkles)
- Located above the question index label in the sidebar of each cell.
- Context: `Explain this English grammar exercise:\n**Question:** {q}\n**Target Answer:** {a}`.

### 3. Keyboard Shortcuts
- **Shift + Enter**: Validates the current cell.
- **Auto-Progression**: If an answer is correct, the focus automatically moves to the next empty cell.

---

## 🧠 AI Integration

When modifying the AI prompt in `AiLearning.tsx` for practice questions, ensure:
1.  **Hints**: Ask the AI to include a base verb or word hint in parentheses at the end of the question (e.g., `(study)`).
2.  **No Numbering**: Ensure the AI does **not** include manual numbers (like "1.") as the notebook provides them automatically.

---

## 📝 Update Checklist

- [ ] Add new exercises to `src/englishExercises.ts` for the matching topic ID.
- [ ] Ensure `correctAnswer` matches the expected input exactly (normalization handles casing/whitespace).
- [ ] Verify that the topic is registered in `src/learningData.ts`.
- [ ] Test the "Sparkles" button to ensure it generates a helpful explanation in the AI side-panel.
- [ ] Confirm that progress persists when switching between the new topic and others.
