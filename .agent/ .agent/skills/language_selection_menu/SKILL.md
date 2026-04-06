---
name: language_selection_menu
description: Implementation guide for a premium sidebar language selection dropdown with icons and theme-aware styling.
---

# Language Selection Menu

This skill documents the implementation of the sidebar language selection dropdown. This menu allows users to switch between different programming environments (Python, Rust, HTML, etc.), which in turn updates the editor content, learning topics, and AI context.

## 1. State Management (React)

The language state is persisted in `localStorage` to ensure the user's preference is remembered across sessions.

```tsx
const [language, setLanguage] = useState<"rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml">(() => {
  return (localStorage.getItem("language") as "rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml") || "python";
});
```

## 2. Handler Logic (`handleLanguageChange`)

When a new language is selected, several actions must occur:
- Update the `language` state and `localStorage`.
- Reset the editor `code` to the default for that language.
- Update the `selectedTopic` to the last saved topic for that language.
- Trigger specific UI updates (like showing the web preview for HTML/CSS).

```tsx
const handleLanguageChange = (newLang: string) => {
  setLanguage(newLang);
  localStorage.setItem("language", newLang);

  // Load saved code for new language or default
  const savedCode = localStorage.getItem(`code_${newLang}`);
  const newCode = savedCode || getDefaultCode(newLang);
  setCode(newCode);

  // Load saved topic for new language or default
  const savedTopicParams = localStorage.getItem(`topic_${newLang}`);
  const savedTopic = savedTopicParams ? JSON.parse(savedTopicParams) : null;
  setSelectedTopic(savedTopic);

  // Auto-open preview/terminal for specific languages
  if (newLang === "html" || newLang === "css") {
    setIsTerminalVisible(true);
  }
};
```

## 3. Component Structure (JSX)

The dropdown is located in the `sidebar-header` of the main chat sidebar. It uses emojis for a friendly, premium look and a `select` element for accessibility and native mobile support.

```tsx
<div className="language-selector-wrapper">
  <select
    value={language}
    onChange={(e) => handleLanguageChange(e.target.value as any)}
    className="sidebar-language-select"
    title="Change Language"
  >
    <option value="python">🐍 Python</option>
    <option value="rust">🦀 Rust</option>
    <option value="dsa">📊 DSA</option>
    <option value="html">🌐 HTML</option>
    <option value="css">🎨 CSS</option>
    <option value="javascript">📜 JavaScript</option>
    <option value="ml">🤖 Machine Learning</option>
  </select>
</div>
```

## 4. Styling (CSS)

The menu uses theme-aware CSS variables for consistent display across Light/Dark modes. A custom SVG chevron is used for a modernized look.

```css
.language-selector-wrapper {
  margin-bottom: 4px;
  width: 100%;
}

.sidebar-language-select {
  width: 100%;
  padding: 10px 14px;
  border-radius: 10px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  appearance: none; /* Hide default browser arrow */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-language-select:hover {
  background-color: var(--bg-primary);
  border-color: var(--accent-color);
  transform: translateY(-1px);
}
```

## 5. Adding a New Language

To add a new language (e.g., "Go" or "Java"):
1.  **TypeScript**: Update the `language` state type definition and the `languages` array in `handleCycleLanguage`.
2.  **Icons/Options**: Add a new `<option>` to the JSX dropdown with a suitable emoji and value.
3.  **Default Code**: Add a default code snippet for the new language in `defaultCode.ts` and handle it in `getDefaultCode`.
4.  **Topics**: Define a `TOPICS_NEWLANG` array in `learningData.ts` and handle switching logic for topics and prev/next navigation.
