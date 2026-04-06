---
name: optional_lab
description: Implementation guide for interactive Python labs using Pyodide and Matplotlib.
---

# Interactive Optional Lab Skill

Use this skill to implement professional, interactive Python labs within the Machine Learning curriculum. These labs allow students to run code, optimize models, and visualize results in real-time.

## 🛠️ Technology Stack
- **Engine**: Pyodide (Python in WASM).
- **Libraries**: NumPy, Matplotlib (3D support included).
- **Interface**: `Notebook.tsx` component with 'Run' capability.

## 📝 Implementation Workflow

### 1. Curriculum Registration
Add the new lab topic to the `TOPICS_ML` array in `src/learningData.ts`.
```typescript
{ id: "X.Y", title: "Optional Lab: [Lab Name]" }
```

### 2. Markdown Content Structure
Add the lab content to `ML_LEARNING_DATA` in `src/mlLearningData.ts`. A professional lab follows these sections:
1. **Goals**: What the student will learn.
2. **Setup**: Imports and dataset initialization.
3. **Plotting Helpers**: Self-contained functions for complex visuals.
4. **Implementation**: Step-by-step function coding (e.g., `compute_cost`).
5. **Execution**: The main loop and final result output.
6. **Visual Analysis**: Interactive plots (Contours, Line graphs, 3D).

## 🎨 High-Precision Visualizations

When creating visualizations, ensure they match the look and feel of professional data science materials.

### A. Surface / Contour Plots
Use `plt.contour` with manual levels and `clabel` for professional readability.
```python
def plt_contour_precision(x, y, p_hist, ax):
    # Create meshgrid
    w = np.linspace(min_w, max_w, 100)
    b = np.linspace(min_b, max_b, 100)
    W, B = np.meshgrid(w, b)
    # Plot contours
    CS = ax.contour(W, B, Z, levels=[1, 10, 100, 1000], cmap='viridis')
    ax.clabel(CS, inline=True, fontsize=8)
    # Overlay path
    ax.quiver(p_hist[:-1,0], p_hist[:-1,1], dx, dy, color='red')
```

### B. Divergence Plots (Oscillation)
Show path dependency and learning rate impact using pink zig-zag lines.
```python
plt.plot(w_path, J_history, color='#FF00FF', lw=4, label='Diverging Path')
```

## ⚠️ Critical Rules
1. **No External Imports**: Do not rely on local `.py` files like `lab_utils.py`. All helper functions MUST be implemented within the `Setup` block of the lesson.
2. **Backtick Escaping**: When writing Python code blocks inside TypeScript template literals, escape the backticks: `\`\`\`python`.
3. **Interactive Documentation**: Use markdown headers and bold text to guide the student through the code blocks.
4. **Performance**: Avoid extremely dense meshes (e.g., $1000 \times 1000$) in Pyodide to prevent browser crashes. Use $50 \times 50$ or $100 \times 100$ for surfaces.
