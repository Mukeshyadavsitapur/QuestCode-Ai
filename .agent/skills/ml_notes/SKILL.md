# Machine Learning Notes Skill

This skill governs the creation and structure of Machine Learning notes within QuestCode-Ai, primarily based on Andrew Ng's Machine Learning course.

## Principles
- **Beginner Friendly**: Always explain concepts with simple analogies and clear examples.
- **Beautiful Design**: Use consistent formatting, micro-animations (if applicable in CSS), and clean layouts.
- **Offline First**: Ensure notes are available offline in `offlineLearningData.ts`.

## Content Structure
- **Chapter 1.1**: Getting Started (What is ML, environment setup with Jupyter).
- **Chapter 1.2+**: Progressive learning path following the course structure.

## UI Integration
- Add "Machine Learning Notes" to the language selection dropdown.
- When selected, the app replaces the standard editor with an interactive Jupyter Environment (`Notebook.tsx`).
- **Jupyter Notebook Integration**: QuestCode-Ai natively connects to the "Original Jupyter Notebook" via an iframe. Users can select between **JupyterLite** (runs entirely in the browser instantly) or a **Local Jupyter Server** (connecting directly to their local `localhost:8888` kernel).
