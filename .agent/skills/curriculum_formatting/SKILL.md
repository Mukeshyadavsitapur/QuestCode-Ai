---
name: curriculum_formatting
description: Guide for maintaining consistent Markdown rendering and avoiding HTML-induced raw text errors.
---

# Curriculum Formatting Skill

Use this skill to ensure all curriculum chapters (Python, ML, etc.) render perfectly with styled headers, bold text, and math equations.

## 🔴 The Rendering Bug (Symptoms)
The most common issue is **Raw Markdown** showing in the UI. Instead of a large red title, the student sees:
`### ❓ Question 1: Data Notation`

## 🔍 Root Cause: The `looksLikeHtml` Check
The application uses a `SmartContent` component in `src/aiUtils.tsx`. This component has a safety check that scans for HTML tags:

```typescript
export const looksLikeHtml = (content: string) => {
    const trimmed = content.trim();
    return (
        (trimmed.startsWith('<') && trimmed.endsWith('>')) ||
        (trimmed.includes('<div') && trimmed.includes('</div>')) ||
        (trimmed.includes('<table') && trimmed.includes('</table>')) ||
        (trimmed.includes('<details') && trimmed.includes('</details>'))
    );
};
```

If any of these tags (like `<details>`, `<div>`, or `<table>`) are detected, the system **dangerously sets inner HTML** and skips the Markdown parser. This causes all standard Markdown symbols (`###`, `**`, `_`) to be ignored and rendered as plain text.

## ✅ The Fix: Standard Markdown Alternatives

### 1. Interactive Q&A (Quiz Sections)
**❌ DON'T USE**: `<details>` and `<summary>` tags.
**✅ DO USE**: Formatted bold text and blockquotes.

```markdown
### ❓ Question 1: Data Notation
...question details...

*👉 Answer & Explanation:*
> **Answer: C**
> m represents the total size of your training set.
```

### 2. High-Quality Callouts
Use GitHub-style alerts instead of custom `<div>` blocks. These are already supported by the project's styling.

```markdown
> [!NOTE]
> Background context or helpful explanations.

> [!TIP]
> Best practices or optimization suggestions.

> [!IMPORTANT]
> Essential requirements or must-know information.
```

### 3. Math Formulas
**IMPORTANT**: The application's Markdown renderer does **not** currently support single `$` or double `$$` delimiters for LaTeX math. Using them will result in raw `$` symbols appearing in the UI.

**❌ DON'T USE**: `$f(x) = wx + b$`
**✅ DO USE**: `**f(x) = wx + b**` or `\`f(x) = wx + b\``

Always use standard bolding or code blocks for formulas. Ensure there is a blank line before and after complex formulas to help the parser.

```markdown
**J(w, b) = 1/2m * Σ(f(x) - y)²**
```

## ⚠️ Critical Rules
1. **No Raw HTML**: Never include `<details>`, `<div>`, `<span>`, or `<table>` within the strings in `mlLearningData.ts` or `pythonLearningData.ts`.
2. **Standard Formatting**: Stick to pure Markdown. If you need a special box, use the blockquote alert system (`> [!TIP]`).
3. **Escaping Backticks**: When writing Python code blocks inside TypeScript strings, escape the backticks: `\`\`\`python`.
