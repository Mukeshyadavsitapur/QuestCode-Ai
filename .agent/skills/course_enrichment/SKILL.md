---
name: course_enrichment
description: Guidelines for enriching course content with beginner-friendly analogies and professional math visuals.
---

# Course Enrichment Skill

This skill documents the process for making technical course content (Machine Learning, Python, DSA, etc.) more accessible, beginner-friendly, and visually professional.

## 🌟 Enrichment Philosophy

When explaining complex concepts, follow these core principles:

1.  **Anchor with "The Big Idea"**: Start each lesson with a clear, 1-2 sentence summary of what is happening (e.g., "Changing parameters rotates the line and updates the cost score").
2.  **Use Relatable Analogies**:
    *   **Linear Regression**: Pizza size vs. Price.
    *   **Supervised Learning**: A Factory with inputs and outputs.
    *   **Cost Function**: A Golf Score (lower is better!) or a "Radio Dial" for tuning **w**.
    *   **Optimization**: Rolling a ball to the bottom of a valley.
3.  **Case-Specific Walkthroughs**:
    *   Instead of one generic graph, generate separate side-by-side graphs for specific parameter cases (e.g., **w=1.0**, **w=0.5**, **w=0.0**).
    *   Explicitly show the **Model Fit** on the left and the corresponding **Cost Score** on the right.
4.  **Visual Scannability**: Use status icons (**✅/⚠️/❌**) in walkthrough tables for immediate student feedback.
5.  **Concept Checks**: End lessons with a simple "Stop and Think" question to reinforce the core intuition.

## 📐 Image Generation Strategies

### 1. Annotated Formula Guides
Generate a single, comprehensive infographic that combines the math formula with labeled symbol explanations. This acts as a perfect "Cheat Sheet."

### 2. Side-by-Side Case Graphs
Generate graphs that show a direct link between the model ($f_w$) and its cost ($J$).
- **Prompt Pattern**: "Professional side-by-side educational diagram. Left: [Model Description]. Right: [Cost Parabola with point at Height H]. Label explicitly as 'w = X.X'."

### 3. Synthesis & Revision Chapters

For "Grand Revision" chapters (like 2.7), avoid simple copy-pasting. Instead, follow these patterns:
- **The Master Connection**: Use a 3-way synchronization table that links the **Data Graph**, the **Cost Score**, and the **Map Position**.
- **The Troubleshooting Guide**: Provide "If-Then" scenarios for identifying parameter errors (e.g., "If the line is tilted too steeply, you have a Weight problem").
- **Visual Synthesis**: Connect the "frustration" of manual tuning to the "magic" of upcoming automated algorithms.
- **The "Why" Deep Dive**: Explain the rationale behind mathematical designs (e.g., "Why do we square error? To penalize big misses!").

---

## 📂 Asset Management

*   **Curriculum Data**: All educational content is stored in `src/mlLearningData.ts`, `src/pythonLearningData.ts`, etc.
*   **Asset Storage**: Store all visual assets (PNGs) in `public/ml_notes/` or `public/python_notes/`.

## 📝 Update Checklist

- [ ] Analyze existing content for "The Big Idea" and concluding "Concept Checks."
- [ ] Draft analogies that match the concept's mathematical behavior.
- [ ] Generate case-specific side-by-side visuals for walkthroughs.
- [ ] In Revision chapters, use the "Master Connection" table and a "Troubleshooting Guide."
- [ ] Use icons and clean formatting in tables.
- [ ] Remove all LaTeX-style `$` signs and replace with bold text or images.
