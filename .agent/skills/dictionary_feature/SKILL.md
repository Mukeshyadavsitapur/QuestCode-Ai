---
name: dictionary_feature
description: Implementation guide for a contextual floating dictionary popup with AI-powered definitions and text-to-speech (TTS) pronunciation.
---

# Dictionary with TTS Feature

This skill documents the implementation of a floating dictionary popup that allows users to click on any word in a chat bubble or input field to get an AI-generated definition and hear its pronunciation.

## Implementation Overview

The feature consists of three main parts:
1. **Global Word Detection**: A click listener that extracts the word under the cursor.
2. **AI Definition Streaming**: Using an LLM to fetch a concise definition and example.
3. **TTS Pronunciation**: Integrated voice synthesis with mobile-specific optimizations.

## 1. Global Click Listener (React)

Use `caretRangeFromPoint` to detect which word was clicked. This should be restricted to specific containers like `.message-bubble`.

```tsx
const handleGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  
  // Ignore clicks inside the popup itself or on buttons
  if (target.closest('.dictionary-popup') || target.closest('button')) return;

  const selection = window.getSelection();
  const range = (document as any).caretRangeFromPoint(e.clientX, e.clientY);
  
  if (range) {
    range.expand('word');
    const word = range.toString().trim().replace(/[^\w\s]/gi, '');
    if (word && word.length > 1) {
      triggerDefinitionFetch(word, e.clientX, e.clientY);
    }
  }
};

useEffect(() => {
  if (isDictionaryActive) {
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }
}, [isDictionaryActive]);
```

## 2. AI Definition Logic

Trigger a streaming request to the LLM with a specific prompt.

```tsx
const triggerDefinitionFetch = async (word: string, x: number, y: number) => {
  setDictionaryPopup({ word, definition: '', x, y, isLoading: true });
  
  const prompt = `Explain the word "${word}". Give a short, basic definition and one simple example sentence. Keep it very concise.`;
  const stream = generateAIResponseStream(prompt);

  let fullResponse = '';
  for await (const chunk of stream) {
    fullResponse += chunk;
    setDictionaryPopup(prev => prev ? { ...prev, definition: fullResponse, isLoading: false } : null);
  }
};
```

## 3. Robust Native TTS Implementation

For reliable mobile support in Tauri, use the native TTS plugin with chunking and a polling grace period.

```tsx
import { speak, stop, isSpeaking } from "tauri-plugin-tts-api";

const handleListen = async (word: string) => {
  try {
    // Stop any existing speech
    await stop();
    
    // Provide minimal SpeakOptions (do not add undefined/null keys to prevent Rust crashes)
    await speak({
      text: word,
      queueMode: 'flush'
    } as any);

    // CRITICAL: Grace period before polling status to allow Android warm-up
    await new Promise(r => setTimeout(r, 1500));

    // Monitoring loop for UI feedback
    while (await isSpeaking()) {
       await new Promise(r => setTimeout(r, 500));
    }
  } catch (err) {
    console.error("Native TTS failed", err);
  }
};
```

## 4. UI Component (JSX & CSS)

### Popup JSX
```tsx
<div className="dictionary-popup" style={{ left: popupX, top: popupY }}>
  <div className="popup-header">
    <h4>{word}</h4>
    <button onClick={() => handleListen(word)}><Volume2 size={14} /></button>
    <button onClick={closePopup}><X size={16} /></button>
  </div>
  <div className="popup-content">
    {isLoading ? <Spinner /> : <Markdown content={definition} />}
  </div>
</div>
```

### Glassmorphism Styling (CSS)
```css
.dictionary-popup {
    position: fixed;
    background: rgba(var(--panel-bg-rgb), 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    width: 300px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 2000;
}

.popup-header {
    padding: 0.75rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}
```

## Tips for Integration
- **Z-Index**: Ensure the popup is above all other UI elements (e.g., `2000+`).
- **Touch Support**: Use `onTouchEnd` in addition to `onClick` for mobile responsiveness.
- **Cleanup**: Always cancel speech when closing the popup or switching words.
- **Grace Period**: Always include a 1.5s delay before checking `isSpeaking()` on mobile.
- **Environment Compatibility**: AI features are implemented using standard web APIs (streaming fetch) through `generateAIResponseStream`, making them compatible with both Tauri (desktop) and Browser/Mobile PWA environments as long as API keys are configured.
