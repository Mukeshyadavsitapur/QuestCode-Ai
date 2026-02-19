# QuestCode AI

**QuestCode AI** is a powerful, cross-platform coding assistant and learning environment built with **Tauri** and **React**. It leverages the power of **Google's Gemini AI** to provide real-time code explanations, interactive lessons, and intelligent debugging assistance, making it the perfect tool for both learning new programming concepts and accelerating development.

## 🚀 Key Features

-   **Multi-Language Support**: robust support for **Python**, **Rust**, **JavaScript**, **HTML**, **CSS**, **Machine Learning**, and **Data Structures & Algorithms (DSA)**.
-   **AI-Powered Learning**:
    -   **Code Explanation**: Get instant, detailed breakdowns of any code snippet.
    -   **Interactive Chat**: Ask follow-up questions and get context-aware answers from Gemini.
    -   **Structured Curriculum**: Built-in learning paths with topics and practice questions for each supported language.
-   **Integrated Terminal**: Execute **Python** and **Rust** code directly within the application and see output in real-time.
-   **Live Web Preview**: Instant, real-time rendering for **HTML** and **CSS** projects.
-   **Smart Editor**:
    -   Powered by **Monaco Editor** (VS Code's core).
    -   Syntax highlighting with **PrismJS**.
    -   Customizable themes (Day, Night, Ocean, etc.).
-   **History & Persistence**: Automatically saves your chat history, learning progress, and language preferences locally.
-   **Dual AI Modes**: Switch between the integrated **QuestCode AI** API experience and the **Gemini Web** interface.

## 🛠️ Tech Stack

-   **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **Core/Backend**: [Tauri v2](https://tauri.app/), [Rust](https://www.rust-lang.org/)
-   **Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
-   **Styling**: CSS Variables (Theming), [Lucide React](https://lucide.dev/) (Icons)
-   **AI Integration**: Google Gemini API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

-   **[Node.js](https://nodejs.org/)** (v18 or newer)
-   **[Rust](https://www.rust-lang.org/tools/install)** (stable)
-   **[Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)** (for Windows users)

## ⚡ Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/questcode-ai.git
    cd questcode-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the application in development mode**:
    ```bash
    npm run tauri dev
    ```

## ⚙️ Configuration

To use the AI features, you need a **Google Gemini API Key**.

1.  Launch the application.
2.  Click the **Settings** (gear icon) in the top right corner.
3.  Enter your API Key in the "Gemini API Key" field.
4.  (Optional) Select your preferred AI Model and Theme.

## ⌨️ Shortcuts

| Shortcut | Action |
|String | Description |
| :--- | :--- |
| `Ctrl + Enter` | Run Code (Python/Rust) |
| `Ctrl + S` | Save (Editor action) |

## 📦 Build

To build the application for production:

```bash
npm run tauri build
```
