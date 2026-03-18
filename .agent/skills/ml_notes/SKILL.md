# Machine Learning Notes Skill

This skill governs the creation and structure of Machine Learning notes within QuestCode-Ai, primarily based on Andrew Ng's Machine Learning course.

## Principles
- **Beginner Friendly**: Always explain concepts with simple analogies and clear examples.
- **Beautiful Design**: Use consistent formatting, micro-animations (if applicable in CSS), and clean layouts.
- **Offline First**: Ensure notes are available offline in `mlLearningData.ts`.

## Content Structure
- **Chapter 1.1**: Getting Started (What is ML, Arthur Samuel's checkers legend, tools vs. skills analogy, and environment setup).
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
- **Chapter 2.1**: Linear Regression Part 1 (Introduction to fitting a straight line, housing price example, and ML notation).
- **Chapter 2.2**: Linear Regression Part 2 (Supervised Learning workflow, Model representation f_w,b(x) = wx + b, and Univariate Regression).
- **Chapter 2.3**: Optional Lab: Model Representation (Implementation with NumPy/Matplotlib and parameter intuition).
- **Chapter 2.4**: Cost Function Formula (Squared Error Cost Function, parameters w and b, and error measurement).
- **Chapter 2.5**: Cost Function Intuition (Simplified model f_w(x) = wx, visualization of the cost parabola, and minimization goal).
- Chapter 2.6+: Progressive learning path following the course structure.

## UI Integration
- Add "Machine Learning Notes" to the language selection dropdown.
- When selected, the app replaces the standard editor with an interactive Jupyter Environment (`Notebook.tsx`).
- **Jupyter Notebook Integration**: QuestCode-Ai natively connects to the "Original Jupyter Notebook" via an iframe. Users can select between **JupyterLite** (runs entirely in the browser instantly) or a **Local Jupyter Server** (connecting directly to their local `localhost:8888` kernel).
