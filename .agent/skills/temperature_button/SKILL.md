---
name: temperature_button
description: Implementation guide for a minimalist temperature (creativity) control button for AI chat inputs.
---

# Temperature Control Button

This skill documents the implementation of a minimalist, "glass-style" temperature control button that sits inside an input field. It allows users to toggle between different AI creativity levels (0.1 to 1.0) using a hidden select menu triggered by a visible "T" icon.

## Implementation Details

### 1. State Management (React)

Add a state variable to track the current temperature setting.

```tsx
const [temperature, setTemperature] = useState<number>(0.3);
```

### 2. Component Structure (JSX)

The control is designed to be placed inside a relative-positioned wrapper (like an input wrapper).

```tsx
<div className="temp-control-minimal" title="Creativity Level (Temperature)">
  T
  <select
    value={temperature}
    onChange={(e) => setTemperature(parseFloat(e.target.value))}
    className="temp-select-hidden"
  >
    <option value={0.1}>Focused (0.1)</option>
    <option value={0.3}>Default (0.3)</option>
    <option value={0.5}>Balanced (0.5)</option>
    <option value={0.8}>Creative (0.8)</option>
    <option value={1.0}>Exploratory (1.0)</option>
  </select>
</div>
```

### 3. Styling (CSS)

The "minimalist" look is achieved by making the select element invisible but overlaying it exactly on top of the visible "T" indicator.

```css
.temp-control-minimal {
    position: absolute;
    left: 8px; /* Adjustable based on padding */
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--bg-color); /* Theme-aware background */
    border: 1px solid var(--border-color);
    border-radius: 50%;
    color: var(--text-muted);
    font-weight: bold;
    font-family: var(--font-mono);
    cursor: pointer;
    font-size: 14px;
    transition: color 0.2s;
}

.temp-control-minimal:hover {
    color: var(--accent-color);
}

/* The magic: makes the dropdown invisible but clickable */
.temp-select-hidden {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

/* Ensure the input field accounts for the icon's space */
.ai-input {
    padding-left: 36px !important;
}

.ai-input-wrapper {
    position: relative;
    flex: 1;
    display: flex;
    align-items: center;
}
```

## Usage in Prompt

When sending the prompt to the AI backend, ensure the `temperature` value is included in the request payload:

```tsx
await invoke("ask_question", { 
    question: userInput, 
    temperature: temperature 
});
```

## Layout Strategy
- **Location**: Typically placed on the far left or far right inside the AI chat input box.
- **Icon**: A simple "T" (for Temperature) is used here to keep it minimalist, but it can be replaced with a `Thermometer` icon from libraries like Lucide-React.
- **Function**: Users click the circle; the standard OS dropdown opens (allowing for native mobile support), and selecting a value updates the state immediately.
