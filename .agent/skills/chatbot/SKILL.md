---
name: chatbot
description: Comprehensive guide for the AI Chatbot feature in ReaderPro — covering message flow, multi-provider LLM integration, chat sessions, Quick Chat, TTS, dictionary lookup, quiz generation, message actions, and keyboard shortcuts used in the prompt test application.
---

# Chatbot Feature – ReaderPro Prompt Test Application

## Overview

The chatbot feature is the core AI interaction system of ReaderPro. It is a **dual-chat architecture** consisting of:

1. **Main Chat Panel** — a persistent, context-aware chat tied to the code editor.
2. **Quick Chat Floating Window** — a draggable, resizable overlay for ad-hoc questions (opened with `Ctrl+P`).

Both panels send requests to a Rust/Tauri backend (`src-tauri/src/lib.rs`) through Tauri's `invoke()` IPC bridge.

---

## Architecture

```
Frontend (React/TypeScript)
  ├── App.tsx          — All state, handlers, and UI
  ├── SettingsModal.tsx — Provider & Model selection UI
  └── App.css          — All styles

Backend (Rust/Tauri)
  └── src-tauri/src/lib.rs
        ├── ask_question   — General Q&A with code context
        ├── explain_code   — Code explanation prompt
        ├── execute_code   — Run Python/Rust/JS/HTML/CSS
        ├── stop_execution — Cancel running process
        └── get_available_models — Fetch Gemini models via API
```

---

## Key Data Types

### `Message` Interface
```typescript
interface Message {
  role: 'user' | 'ai' | 'system';
  content: string;
}
```

### `ChatSession` Interface
```typescript
interface ChatSession {
  id: string;           // Date.now().toString()
  title: string;        // First 40 chars of first user message
  timestamp: string;    // ISO string
  messages: Message[];
  description?: string; // Legacy field for backward compat
}
```

---

## State Variables (App.tsx)

| State Variable | Type | Purpose |
|---|---|---|
| `messages` | `Message[]` | Main chat message list |
| `input` | `string` | Main chat text input value |
| `isExplaining` | `boolean` | Loading flag for AI requests |
| `chats` | `ChatSession[]` | All saved chat sessions (max 500) |
| `currentChatId` | `string \| null` | ID of active main chat |
| `isHistoryOpen` | `boolean` | History sidebar visibility |
| `quickChatMessages` | `Message[]` | Quick Chat message list |
| `quickChatInput` | `string` | Quick Chat text input value |
| `isQuickChatOpen` | `boolean` | Quick Chat window visibility |
| `currentQuickChatId` | `string \| null` | ID of active quick chat |
| `quickChatGeometry` | `object` | `{x, y, width, height}` — persisted to localStorage |
| `speakingMsgIdx` | `number \| null` | Index of message being spoken by TTS |
| `copiedMsgIdx` | `number \| null` | Index of message recently copied |
| `openKebabIdx` | `number \| null` | Index of message with open kebab menu |
| `editingMsgIdx` | `number \| null` | Index of message being edited |
| `editDraft` | `string` | Draft content of edited message |
| `isDictionaryActive` | `boolean` | Whether dictionary word-click is on |
| `isDictionaryModalOpen` | `boolean` | Dictionary result modal visibility |
| `dictionaryWord` | `string` | Word queried in dictionary |
| `dictionaryResult` | `string` | AI-generated definition |
| `isDictionaryLoading` | `boolean` | Loading flag for dictionary lookup |
| `isQuizGenerating` | `boolean` | Loading flag for quiz generation |
| `activeQuizQuestions` | `any[] \| null` | Generated quiz questions |
| `llmProvider` | `string` | Current LLM provider (`groq`, `gemini`, `openai`, `anthropic`, `huggingface`) |
| `selectedModel` | `string` | Specific model chosen in settings |
| `activeModel` | `string` | Model that last responded (may differ from selected if fallback occurred) |
| `availableModels` | `string[]` | Models list for the current provider |
| `apiKey` | `string` | Gemini API key |
| `openAiApiKey` | `string` | OpenAI API key |
| `anthropicApiKey` | `string` | Anthropic API key |
| `groqApiKey` | `string` | Groq API key |
| `huggingFaceApiKey` | `string` | Hugging Face token |
| `aiService` | `"api" \| "web"` | Whether to use local API or open browser-based LLM |

---

## Multi-Provider LLM System

### Providers & Models

| Provider | Key State | Default Models |
|---|---|---|
| **Groq** (default) | `groqApiKey` | `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, `moonshotai/kimi-k2`, `llama-4-scout`, `llama-3.3-70b`, `llama-3.1-8b`, `mixtral-8x7b`, `gemma2-9b` |
| **Google Gemini** | `apiKey` | Dynamically fetched from API; filtered to 2.5+ generation |
| **OpenAI** | `openAiApiKey` | `gpt-4o`, `chatgpt-4o-latest`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo` |
| **Anthropic** | `anthropicApiKey` | `claude-3-5-sonnet-20241022`, `claude-3-5-haiku`, `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku` |
| **Hugging Face** | `huggingFaceApiKey` | `DeepSeek-R1-7B`, `Qwen2.5-Coder-7B`, `phi-4-mini`, `Llama-3.1-8B`, `gemma-2-9b`, `Mistral-7B`, etc. |

### API Key Routing Pattern (Frontend)
```typescript
const currentApiKey =
  llmProvider === "openai" ? openAiApiKey :
  llmProvider === "anthropic" ? anthropicApiKey :
  llmProvider === "groq" ? groqApiKey :
  llmProvider === "huggingface" ? huggingFaceApiKey :
  apiKey; // gemini fallback
```

### Fallback Execution Chain (Rust Backend)
Every provider uses a **fallback chain** pattern. If the user-selected model fails (rate limit, error), the backend automatically tries the next model in the chain:

- **Gemini**: Selected model → Same version family → 3.0 → 2.5 → 2.0 → 1.5
- **OpenAI / Groq / HuggingFace / Anthropic**: Selected model → ordered default list

### Tauri IPC Commands

#### `explain_code`
Invoked by `handleExplain()`. Sends a code explanation prompt.
```typescript
invoke("explain_code", {
  req: {
    api_key: currentApiKey,
    provider: llmProvider,
    code: code,
    language: normalizedLanguage, // "dsa"/"ml" -> "python"
    selected_model: selectedModel
  }
})
```

#### `ask_question`
Invoked by `handleSend()`, `handleSendQuickChat()`, `handleDictionaryLookup()`, `handleGenerateQuiz()`. Sends an open-ended question with code as context.
```typescript
invoke("ask_question", {
  req: {
    api_key: currentApiKey,
    provider: llmProvider,
    code: code,
    question: userQuestion,
    language: normalizedLanguage,
    selected_model: selectedModel
  }
})
```

**Response shape** (both commands):
```typescript
{ content: string; model: string }
```
The `model` field reflects which fallback model actually answered — used to set `activeModel` and display a warning in settings if different from `selectedModel`.

---

## Main Chat Flow (`handleSend`)

1. Guard: returns early if input is empty or `aiService === "web"`.
2. If `viewMode === "learning"` and a topic is selected, delegates to `learningRef.current.askQuestion()`.
3. Clears input, appends `{ role: 'user' }` + `{ role: 'ai', content: '*Thinking...*' }` to `messages`.
4. Calls `scrollToLatestMessage(mainChatScrollRef)`.
5. Browser-mode guard: shows an error message after 500ms if not in Tauri.
6. Calls `invoke("ask_question", ...)`.
7. On success: replaces the thinking message with the response, calls `updateChatHistory()`.
8. On error: replaces the thinking message with an error string.

---

## Chat History Management

### `updateChatHistory(msgs, forcedTitle?)`
- If `currentChatId` is set: updates the existing session's messages.
- If `currentChatId` is null: creates a new `ChatSession` with `Date.now()` as ID, prepends to `chats` (capped at 500 sessions).

### `handleNewChat()`
Resets `currentChatId` to null, resets `messages` to `INITIAL_MESSAGES`, closes history sidebar, switches `viewMode` to `"ai"`.

### `handleSelectChat(chat)`
Loads a saved session into the active `messages` state.

### `handleDeleteChat(e, id)`
Filters the chat from `chats`. If it was the current chat, calls `handleNewChat()`.

### Persistence
All chat data is saved to `localStorage`:
- `ai_chats` — JSON array of all `ChatSession` objects
- `current_chat_id` — ID of the active session
- `current_quick_chat_id` — ID of the active quick chat session

---

## Quick Chat Window

A **floating, draggable/resizable** panel powered by `react-rnd`.

- **Open/Close**: `Ctrl+P` or click the Quick Chat button
- **Geometry**: Saved to `localStorage` key `"quickChatGeometry"` as `{x, y, width, height}`.
- **Default position**: Centered at `(window.innerWidth/2 - 200, window.innerHeight/2 - 250)`, size `400×500`.
- **Flow** (`handleSendQuickChat`): Identical to main chat flow but uses `quickChatMessages` state and saves to `ai_quick_chats` localStorage key.

---

## Message Actions (Kebab Menu)

Each AI message in the main chat exposes a `MoreVertical` (⋮) icon that opens a context menu (`openKebabIdx` state). Available actions:

| Action | Handler | Description |
|---|---|---|
| **Copy** | `handleCopyMessage(content, idx)` | Copies to clipboard; shows checkmark for 2s |
| **Listen / Stop** | `handleListen(text, idx)` | Starts or stops Web Speech API TTS playback |
| **Edit** | `handleStartEdit(idx)` | Enters inline editing mode |
| **Try Again** | `handleTryAgain(idx)` | Re-submits the preceding user message via `handleExplainWithContext` |
| **Delete** | `handleDeleteMessage(idx)` | Removes the message and updates history |
| **Quiz** | `handleGenerateQuiz(content)` | Generates a 3-question MCQ quiz from the message |
| **Export PDF** | `handleExportPdf(content)` | Opens a print dialog with formatted HTML content |

### Edit Flow
- `handleStartEdit(idx)` → sets `editingMsgIdx` and `editDraft`
- Renders a `<textarea>` in place of the message bubble
- `handleSaveEdit(idx)` → commits `editDraft` to messages, updates history
- `handleCancelEdit()` → clears editing state

---

## Text-to-Speech (TTS)

Uses the **Web Speech API** (`window.speechSynthesis`).

```typescript
const handleListen = async (text: string, idx: number) => {
  // Toggle off if already speaking this message
  if (speakingMsgIdx === idx) {
    window.speechSynthesis.cancel();
    setSpeakingMsgIdx(null);
    return;
  }
  // Clean text: strip markdown (*,#) and HTML tags
  const cleanText = text.replace(/[*#]/g, '').replace(/<[^>]*>?/gm, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'en-US';
  utterance.onend = () => setSpeakingMsgIdx(null);
  utterance.onerror = () => setSpeakingMsgIdx(null);
  window.speechSynthesis.speak(utterance);
  setSpeakingMsgIdx(idx);
};
```

The button icon toggles between `Volume2` (speaking) and `VolumeX` (muted) based on `speakingMsgIdx`.

---

## Dictionary Lookup

Toggled via the `BookOpen` icon button (`isDictionaryActive`). When active:

- Every word in AI message `<p>` elements becomes a `<span>` with `cursor: help` and a dotted underline.
- Clicking a word calls `handleDictionaryLookup(word)`.
- Uses `invoke("ask_question")` with a programming-context definition prompt:
  ```
  Define the word or concept "${word}" in the context of programming and ${language}.
  Provide a concise definition and a short example if applicable.
  ```
- Result shown in a modal (`isDictionaryModalOpen`).
- Rendered as markdown via `ReactMarkdown`.

> **Important**: Dictionary word wrapping is applied only to `<p>` elements inside AI/user message bubbles. It is NOT applied to settings, history sidebar, or other UI areas.

---

## Quiz Generation (`handleGenerateQuiz`)

Triggered from the kebab menu on any message.

1. Builds a strict JSON prompt:
   ```
   Generate a 3-question multiple choice quiz based on this text:
   [content]
   Format the response EXACTLY as a JSON array of objects.
   Each object: { question, options (array of strings), correctAnswerIndex (int 0-3) }
   ```
2. Strips markdown code fences from response, then `JSON.parse()`.
3. Maps each option string to `{ text, explanation }` shape.
4. Sets `activeQuizQuestions` state → renders the `<Quiz>` component.

---

## PDF Export (`handleExportPdf`)

Opens a new browser window and writes formatted HTML:
- Converts markdown headings (`##`, `###`), bold, italic, inline code, and code blocks to HTML equivalents.
- Triggers `window.print()` via `onload`.

---

## Web LLM Mode (`handleOpenWebLlm`)

When `aiService === "web"`:
- Copies the current editor code to the clipboard.
- Opens the selected provider's web chat in a browser tab using `openUrl` (Tauri) or `window.open` (fallback).

| Provider | URL |
|---|---|
| `gemini` | `https://gemini.google.com/app` |
| `openai` | `https://chatgpt.com/` |
| `anthropic` | `https://claude.ai/new` |
| `groq` | `https://groq.com/` |
| `huggingface` | `https://huggingface.co/chat/` |

---

## Markdown Rendering

Both main chat and quick chat use `<ReactMarkdown>` with `remarkGfm` and custom `components`:

| Element | Custom Behavior |
|---|---|
| `code` (block) | Shows language label, **Copy** button, **Apply** button (inserts code into editor) |
| `code` (inline) | Styled with `accent-color` tint background |
| `p` | When `isDictionaryActive`, each word becomes a clickable `<span>` |
| `table` | Wrapped in overflow scroll container |
| `th` / `td` / `tr` | Custom padding, borders, and zebra-stripe via CSS class `.markdown-row` |
| `pre` | Renders as empty fragment (code block handles its own `<pre>`) |

Syntax highlighting uses **PrismJS** via `useEffect(() => Prism.highlightAll(), [messages, ...])`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+P` | Toggle Quick Chat window |
| `Ctrl+B` | Toggle chat history sidebar |
| `Ctrl+Alt+B` | Toggle AI Assistant panel visibility |
| `Ctrl+Alt+C` | Trigger "Explain Code" |
| `F1` | Open Settings modal |
| `F5` / `Ctrl+Enter` | Run code in terminal |
| `F4` | Toggle code editor visibility |
| `F7` | Toggle terminal layout (vertical ↔ horizontal) |
| `F11` | Toggle fullscreen (Tauri only) |
| `Ctrl+Tab` | Cycle programming language |
| `Ctrl+\`` | Toggle terminal panel |

---

## LocalStorage Keys Reference

| Key | Value |
|---|---|
| `ai_chats` | JSON array of `ChatSession[]` (main chat history) |
| `ai_quick_chats` | JSON array of `ChatSession[]` (quick chat history) |
| `current_chat_id` | String ID of active main chat |
| `current_quick_chat_id` | String ID of active quick chat |
| `quickChatGeometry` | JSON `{x, y, width, height}` of Quick Chat window |
| `llmProvider` | Active provider string |
| `apiKey` | Gemini API key |
| `openAiApiKey` | OpenAI API key |
| `anthropicApiKey` | Anthropic API key |
| `groqApiKey` | Groq API key |
| `huggingFaceApiKey` | Hugging Face token |
| `selected_model` | Selected model string |

---

## Settings Modal (SettingsModal.tsx)

### Gemini Model Discovery
When `localProvider === "gemini"` and an API key is entered, the settings modal debounces (800ms) and calls `invoke("get_available_models", { apiKey })` to fetch and display the live model list filtered to generation 2.5+.

### Model Status Indicator
After a response is received, Settings shows:
- `CURRENTLY ACTIVE: {activeModel}` — if selected model matched.
- `⚠ FALLBACK ACTIVE: {activeModel}` — if the backend used a different model due to fallback.

### Provider Switch Behavior
Switching provider automatically:
1. Updates `localProvider`
2. Pre-fills the API key field with the stored key for that provider
3. Clears any fetch errors
4. Clears `selectedModel` (on save) if provider changed

---

## Adding a New LLM Provider (Checklist)

When extending the chatbot to support a new provider:

**Frontend (`App.tsx`)**
- [ ] Add state: `const [newProviderApiKey, setNewProviderApiKey] = useState(...)`
- [ ] Add to `useEffect` persist block: `localStorage.setItem("newProviderApiKey", ...)`
- [ ] Add `setAvailableModels([...])` branch in the provider `useEffect`
- [ ] Add to the API key routing pattern: `llmProvider === "newprovider" ? newProviderApiKey : ...`
- [ ] Pass new key state through `<SettingsModal>` props

**Frontend (`SettingsModal.tsx`)**
- [ ] Add props for the new key
- [ ] Add `<option value="newprovider">New Provider</option>` to the provider select
- [ ] Add key routing in `onChange` and `value` of the API key input
- [ ] Add `<a>` link to the provider's API key page

**Backend (`lib.rs`)**
- [ ] Implement `call_newprovider(api_key, prompt, selected_model, temperature)` async function
- [ ] Add the provider to the `match` block inside `explain_code` and `ask_question` commands
- [ ] Define request/response structs for the new API format

---

## Common Patterns & Tips

- **"Thinking..." placeholder**: Always shown immediately after a user message is appended. Replaced (not appended) with the real response.
- **`scrollToLatestMessage(ref)`**: Uses `.latest-question-anchor` CSS class to scroll to the most recent user question, with a double-timeout for render stability.
- **Tauri guard**: All AI features check `isTauri()` before calling `invoke()`. In browser-only mode, a human-readable error message is shown instead.
- **`viewMode`**: One of `"ai" | "docs" | "shortcuts" | "learning"`. The chat input area adapts its behavior when `viewMode === "learning"` to route questions to the AI Learning module.
- **Chat title extraction**: `extractTitle(text)` strips HTML tags and takes the first 40 characters of the first user message.
- **Max chat cap**: `chats` is capped at 500 sessions via `.slice(0, 500)` on every update.
