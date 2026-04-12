---
name: english_chapter_creation
description: Guidelines for creating enriched English grammar chapters with multi-scene illustrations and accessible pedagogy.
---

# English Chapter Creation Skill

This skill documents the process for adding new English language modules to QuestCode-Ai. Use these guidelines to maintain a consistent, high-quality, and visually engaging learning experience for students.

## 🌟 Enrichment Philosophy

When explaining English grammar (Tenses, Articles, etc.), follow these core principles:

1.  **Multi-Scene Visuals**: ALWAYS prefer a single 2 or 4-panel image over a single-scene illustration. This helps the student understand the concept in different contexts (e.g., "Right Now" vs. "Around Now").
2.  **Abundance of Examples**: For every category or panel described, provide **at least 5 different examples**.
3.  **Narrative-Driven Examples**: Use relatable characters or situations (e.g., "Sarah driving to work") to make the grammar feel alive.
4.  **The "Momentum" Rule**: Explain the *feeling* of a tense. For example, explain how **-ing** adds "momentum" or "motion" to a verb.
5.  **Stop & Practice**: Lessons are unified. The student reads theory and practices in the same view.

---

## 🎨 Interactive Notebook Standards

The English track uses a cell-based notebook for exercises. New chapters MUST follow these UI standards:

1.  **High Exercise Volume**: Every chapter (topic) must have a **minimum of 35 exercises**.
2.  **Grouped Questions**: Group similar exercises (5-8 questions) into clusters using `###` headers within a single exercise cell.
3.  **No Row Labels**: The "In [idx]" labels have been removed. Question numbers (1., 2.) must be part of the exercise Markdown.
4.  **Vertical Flow**: The **Explain** button (sparkles icon) is positioned vertically **below** the question text.
5.  **Left Alignment**: All content must be left-aligned with question numbers positioned inside the cell boundaries.

---

## 📂 Data Management & Integration

### 1. Curriculum Structure
Register topics in `src/learningData.ts` under the `TOPICS_ENGLISH` constant.
-   **Group Strategy**: Use broad chapter titles (e.g., "1. Tenses").
-   **Topic Strategy**: Each topic ID (e.g., "1.1") corresponds to both theory and a full exercise set.

### 2. Matching IDs
-   **Theory**: Stored in `src/englishLearningData.ts` using the topic ID as the key.
-   **Exercises**: Stored in `src/englishExercises.ts` using the **same** topic ID as the key. Selecting a topic automatically loads both.

---

## 📝 Integrated Tools
-   **Explain Search**: The "Explain" button triggers a contextual AI breakdown of that specific exercise.
-   **Check Answer**: `Shift + Enter` allows students to check their answer immediately.

## 🏁 Update Checklist

- [ ] Group exercises into a single broad chapter (e.g., "Tenses").
- [ ] Ensure the chapter has **35+ total questions**.
- [ ] Standardize question numbering inside each Markdown cell.
- [ ] Map both theory and exercises to the same topic ID.
- [ ] Verify the Explain button is properly spaced and vertically aligned.
- [ ] Generate a multi-scene (2+ panel) concept image and save to `src/assets/`.
