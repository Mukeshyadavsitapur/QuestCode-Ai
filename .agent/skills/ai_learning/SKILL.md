---
name: ai_learning
description: Implementation guide for AI-guided lessons with offline first-answer support.
---

# AI Learning Skill

This skill documents the AI-guided learning module, which provides structured lessons and an interactive AI tutor.

## Overview
The AI Learning module (`src/AiLearning.tsx`) allows users to browse a curriculum and get explanations for specific topics. It uses AI to generate these explanations but supports **offline first-answers** for a faster initial experience.

## Key Files
- `src/AiLearning.tsx`: Main component for the AI learning interface.
- `src/learningData.ts`: Defines the curriculum structure (TopicGroups and Topics).
- `src/offlineLearningData.ts`: Stores pre-built markdown content for specific lessons.
- `src/aiUtils.tsx`: Utility functions for AI response streaming.

## Offline First-Answer Mechanism
To provide an immediate response without calling the AI:
1.  **Define Content**: Add the lesson content in `src/offlineLearningData.ts` mapping the language and topic ID.
2.  **Check in Component**: `AiLearning.tsx` checks `OFFLINE_LEARNING_DATA[language][topic.id]` during the initial fetch.
3.  **Caching**: If offline data is found, it is set as the initial message and also stored in `localStorage` to ensure consistency with AI-generated responses.

## Guidelines for Adding Offline Lessons
- Use high-quality Markdown formatting.
- Include clear headings and code blocks.
- End the lesson with a "What's Next?" section to guide the user.
- Keep the content beginner-friendly and concise.

## AI Interaction
Subsequent questions from the user after the initial lesson are handled by the AI, which uses the lesson content (whether offline or AI-generated) as context.

## Offline Lesson Progress (Python)
- [x] Chapter 1.1 - 1.5 (Introduction & Practice)
- [x] Chapter 2.1 (Variables & Literals)
- [x] Chapter 2.2 (Naming Rules)
- [x] Chapter 2.3 (Type Conversion)
- [x] Chapter 2.5 (Operators)
- [x] Chapter 2.6 (Practice Questions)
- [ ] Chapter 3+ (Planned)
