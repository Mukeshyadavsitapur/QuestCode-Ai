# Machine Learning Notes Skill

This skill governs the creation and structure of Machine Learning notes within QuestCode-Ai, primarily based on Andrew Ng's Machine Learning course.

## Principles
- **Beginner Friendly**: Always explain concepts with simple analogies and clear examples.
- **Beautiful Design**: Use consistent formatting, micro-animations (if applicable in CSS), and clean layouts.
- **Offline First**: Ensure notes are available offline in `mlLearningData.ts`.

## Content Structure
- **Chapter 1.1**: Getting Started (What is ML, Arthur Samuel's checkers legend, tools vs. skills analogy, and environment setup).
- **Chapter 1.2**: Supervised Learning Part 1 (X-to-Y mapping, real-world examples, and introduction to Regression).
- **Chapter 1.3**: Supervised Learning Part 2 (Classification basics, Binary vs. Multi-class, and Decision Boundaries).
- **Chapter 1.4**: Unsupervised Learning Part 1 (Clustering basics, Google News, DNA Microarrays, and Market Segmentation).
- **Chapter 1.5**: Unsupervised Learning Part 2 (Anomaly Detection, Dimensionality Reduction, and Knowledge Check).
- **Chapter 1.6**: Introduction to Jupyter Notebooks (Markdown vs. Code cells, Shift+Enter interactivity, and Python f-strings).
- **Chapter 1.7**: Optional Lab (Hands-on practice questions and Week 1 graduation).
- **Chapter 1.8+**: Progressive learning path following the course structure (Linear Regression and beyond).

## UI Integration
- Add "Machine Learning Notes" to the language selection dropdown.
- When selected, the app replaces the standard editor with an interactive Jupyter Environment (`Notebook.tsx`).
- **Jupyter Notebook Integration**: QuestCode-Ai natively connects to the "Original Jupyter Notebook" via an iframe. Users can select between **JupyterLite** (runs entirely in the browser instantly) or a **Local Jupyter Server** (connecting directly to their local `localhost:8888` kernel).
