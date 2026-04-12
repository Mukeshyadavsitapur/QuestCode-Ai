---
name: english_chapter_creation
description: Guidelines for creating enriched English grammar chapters with multi-scene illustrations and accessible pedagogy.
---

# English Chapter Creation Skill

This skill documents the process for adding new English language modules to QuestCode-Ai. Use these guidelines to maintain a consistent, high-quality, and visually engaging learning experience for students.

## 🌟 Enrichment Philosophy

When explaining English grammar (Present Continuous, Past Simple, Tenses, etc.), follow these core principles:

1.  **Multi-Scene Visuals**: ALWAYS prefer a single 2 or 4-panel image over a single-scene illustration. This helps the student understand the concept in different contexts (e.g., "Right Now" vs. "Around Now").
2.  **Abundance of Examples**: For every category or panel described, provide **at least 5 different examples**. This helps students move from seeing a pattern to actually understanding its application.
3.  **Narrative-Driven Examples**: Use relatable characters or situations (e.g., "Sarah driving to work" or "Talking at a cafe") to make the grammar feel alive.
3.  **The "Momentum" Rule**: Explain the *feeling* of a tense. For example, explain how **-ing** adds "momentum" or "motion" to a verb.
4.  **Avoid Dry Copy-Pasting**: Do not simply transcribe textbook content. Rephrase it into a friendly, guided conversation.
5.  **Stop & Practice**: End lessons with a "Challenge" that encourages the user to write their own sentences in the editor.

## 🎨 Image Generation Strategies

### 1. Panel-Based Illustrations
Generate 4-panel educational graphics that cover different usage cases of a tense.
*   **Prompt Pattern**: "Professional 4-panel educational illustration for [Topic]. Panel 1: [Scene 1]. Panel 2: [Scene 2]. Panel 3: [Scene 3]. Panel 4: [Scene 4]. Style: Clean, minimalist, modern flat design. Soft, harmonious colors."

### 2. High-Frequency Icons
Use icons and emojis (🇬🇧, ✨, 📱, 🛠️) strategically to make headings pop and tables easier to read.

---

## 📂 Asset & Data Management

### 1. Curriculum Content
All English curriculum text is stored in `src/englishLearningData.ts`.
*   Export a record with IDs matching those in `src/learningData.ts`.
*   Use standard Markdown.
*   Embed images using `![Alt Text](/src/assets/filename.png)`.

### 2. Topic Registration
New topics must be registered in `src/learningData.ts` under the `TOPICS_ENGLISH` constant.

### 3. Visual Assets
Store all generated images in `src/assets/`.
*   Use descriptive filenames like `present_continuous_concept.png`.
*   Avoid using absolute local paths in the final Markdown; use `/src/assets/filename.png`.

## 🛠️ Integrated Tools

*   **Explain Sentences**: The "Explain Code" button in the English track is labeled "Explain Sentences". Use this context when writing "Check" or "Challenge" instructions.
*   **Editor Mode**: The editor for English is set to **Markdown** mode.

## 📝 Update Checklist

- [ ] Define the grammar concept and its "momentum/feeling."
- [ ] Generate a 4-panel illustration representing different usage cases.
- [ ] Move the generated image to `src/assets/`.
- [ ] Draft the enriched chapter in `src/englishLearningData.ts` referencing the panels.
- [ ] Register the new topic ID in `src/learningData.ts`.
- [ ] Verify the "Explain Sentences" button and "Check Sentences" (Run) button titles are appropriate for the content.
