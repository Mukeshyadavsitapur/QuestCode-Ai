import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle
} from "react-resizable-panels";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import ReactMarkdown from "react-markdown";
import { Brain, Code2, Send, Sparkles, Settings, Book, MessageSquare, Copy, Globe, Bot, Terminal as TerminalIcon } from "lucide-react";
import { SettingsModal } from "./SettingsModal";
import { Terminal } from "./Terminal"; // Import Terminal
import "./App.css";

const DEFAULT_RUST_CODE = `// Welcome to your AI Programming Tutor
// Write code here and ask AI for help!

fn main() {
    println!("Hello, Rust learner!");
}`;

const DEFAULT_PYTHON_CODE = `# Welcome to your AI Programming Tutor
# Write code here and ask AI for help!

def main():
    print("Hello, Python learner!")

if __name__ == "__main__":
    main()`;

function App() {
  const [language, setLanguage] = useState<"rust" | "python">("rust");
  const [code, setCode] = useState(DEFAULT_RUST_CODE);
  const [description, setDescription] = useState(
    "# Getting Started\n\nWelcome! Type some code on the left and click **'Explain Code'** to get an AI-powered breakdown of what's happening.\n\nYou can also ask specific questions using the chat bar below."
  );
  const [input, setInput] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  // View Mode State (AI or Docs)
  const [viewMode, setViewMode] = useState<"ai" | "docs">("ai");

  // AI Service Mode (API or Web)
  const [aiService, setAiService] = useState<"api" | "web">("api");

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  const [theme, setTheme] = useState<"dark" | "light">(() =>
    (localStorage.getItem("theme") as "dark" | "light") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme === "light" ? "light-theme" : "";
  }, [theme]);

  const toggleLanguage = () => {
    if (language === "rust") {
      setLanguage("python");
      setCode(DEFAULT_PYTHON_CODE);
      setDescription("# Switched to Python\n\nYou are now in Python mode. Write some Python code!");
    } else {
      setLanguage("rust");
      setCode(DEFAULT_RUST_CODE);
      setDescription("# Switched to Rust\n\nYou are now in Rust mode. Write some Rust code!");
    }
    setTerminalOutput("");
  };

  const handleExplain = async () => {
    if (aiService === "web") return; // API only
    setIsExplaining(true);
    setViewMode("ai"); // Switch to AI view when explaining
    try {
      // Pass apiKey to backend if needed in future
      const response: string = await invoke("explain_code", { apiKey, code, language });
      setDescription(response);
    } catch (error) {
      console.error("Failed to explain code:", error);
      setDescription(`## Error\n\n${error}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || aiService === "web") return;

    const userQuestion = input;
    setInput("");

    // Append user question to description (simple chat simulation for now)
    setDescription(prev => prev + `\n\n--- \n\n**You asked:** ${userQuestion}\n\n*Searching for answer...*`);

    try {
      const response: string = await invoke("ask_question", { apiKey, code, question: userQuestion, language });
      setDescription(prev => prev.replace("*Searching for answer...*", response));
    } catch (error) {
      console.error("Failed to ask question:", error);
      setDescription(prev => prev.replace("*Searching for answer...*", `\n\n**Error:** ${error}`));
    }
  };

  const handleRunCode = async () => {
    if (!isTerminalVisible) setIsTerminalVisible(true);
    setIsRunning(true);
    setTerminalOutput(`Running ${language === 'rust' ? 'Rust' : 'Python'} code...`);
    try {
      const output: string = await invoke("execute_code", { code, language });
      setTerminalOutput(output);
    } catch (error) {
      console.error("Failed to run code:", error);
      setTerminalOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleOpenGeminiWeb = async () => {
    try {
      await navigator.clipboard.writeText(code);
      await openUrl("https://gemini.google.com/app");
    } catch (error) {
      console.error("Failed to open Gemini Web:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <Brain color={theme === 'dark' ? "#58a6ff" : "#0969da"} />
          <span>QuestCode AI</span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            className="btn btn-secondary"
            onClick={toggleLanguage}
            style={{ minWidth: "120px", display: "flex", justifyContent: "center" }}
          >
            {language === "rust" ? "🦀 Rust" : "🐍 Python"}
          </button>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setIsSettingsOpen(true)}
            style={{ marginRight: 10, border: 'none', color: 'var(--text-muted)' }}
          >
            <Settings size={20} />
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExplain}
            disabled={isExplaining || aiService === "web"}
            style={{ opacity: aiService === "web" ? 0.5 : 1, cursor: aiService === "web" ? "not-allowed" : "pointer" }}
          >
            {isExplaining ? <Sparkles className="animate-pulse" /> : <Code2 />}
            {isExplaining ? "Thinking..." : "Explain Code"}
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="main-content">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <div className="panel">
              <div className="panel-header">
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    className={`tab-btn ${viewMode === 'ai' ? 'active' : ''}`}
                    onClick={() => setViewMode('ai')}
                  >
                    <MessageSquare size={14} /> AI Assistant
                  </button>
                  <button
                    className={`tab-btn ${viewMode === 'docs' ? 'active' : ''}`}
                    onClick={() => setViewMode('docs')}
                  >
                    <Book size={14} /> {language === "rust" ? "Rust Docs" : "Python Docs"}
                  </button>
                </div>

                {viewMode === 'ai' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className={`tab-btn ${aiService === 'api' ? 'active' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      onClick={() => setAiService('api')}
                    >
                      <Bot size={12} /> QuestCode AI
                    </button>
                    <button
                      className={`tab-btn ${aiService === 'web' ? 'active' : ''}`}
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                      onClick={() => setAiService('web')}
                    >
                      <Globe size={12} /> Gemini Web
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: viewMode === 'ai' ? 'flex' : 'none', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>

                {aiService === 'api' ? (
                  <>
                    <div className="description-container">
                      <ReactMarkdown>{description}</ReactMarkdown>
                    </div>
                    <div className="ai-controls">
                      <input
                        type="text"
                        className="ai-input"
                        placeholder="Ask a question about this code..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />
                      <button className="btn btn-primary" onClick={handleSend}>
                        <Send size={18} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
                    <div style={{ background: 'var(--bg-color)', padding: 32, borderRadius: 16, border: '1px solid var(--border-color)', maxWidth: 400 }}>
                      <Globe size={48} color="var(--accent-color)" style={{ marginBottom: 16 }} />
                      <h3 style={{ marginBottom: 8, color: 'var(--text-main)' }}>Open Gemini Web</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.5 }}>
                        Use the web version of Gemini to chat, analyze images, and more.
                        We'll copy your code to the clipboard for you.
                      </p>
                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        onClick={handleOpenGeminiWeb}
                      >
                        <Copy size={16} /> Copy Code & Open Gemini
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: viewMode === 'docs' ? 'flex' : 'none', flex: 1, flexDirection: 'column' }}>
                <iframe
                  src={language === "rust" ? "https://doc.rust-lang.org/book/" : "https://docs.python.org/3/"}
                  title="Documentation"
                  style={{ flex: 1, border: 'none', width: '100%', height: '100%', backgroundColor: 'white' }}
                />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="resizer" />

          <Panel defaultSize={50} minSize={30}>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={isTerminalVisible ? 70 : 100} minSize={30}>
                <div className="panel">
                  <div className="panel-header">
                    <span>EDITOR ({language.toUpperCase()})</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className={`tab-btn ${isTerminalVisible ? 'active' : ''}`}
                        title={isTerminalVisible ? "Hide Terminal" : "Show Terminal"}
                        onClick={() => setIsTerminalVisible(!isTerminalVisible)}
                        style={{ padding: '4px 8px' }}
                      >
                        <TerminalIcon size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleRunCode}
                        disabled={isRunning}
                        style={{ padding: '4px 12px', fontSize: '0.8rem' }}
                      >
                        Run Code
                      </button>
                    </div>
                  </div>
                  <div className="editor-container">
                    <Editor
                      value={code}
                      onValueChange={(code: string) => setCode(code)}
                      highlight={(code: string) => {
                        try {
                          return highlight(
                            code,
                            language === "rust" ? languages.rust : languages.python,
                            language
                          );
                        } catch (e) {
                          console.error("Highlight error:", e);
                          return code;
                        }
                      }}
                      padding={20}
                      style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: 14,
                        minHeight: "100%",
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {isTerminalVisible && (
                <>
                  <PanelResizeHandle className="resizer" />

                  <Panel defaultSize={30} minSize={20}>
                    <div className="panel">
                      <Terminal
                        output={terminalOutput}
                        isRunning={isRunning}
                        onClear={() => setTerminalOutput("")}
                      />
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div>
  );
}

export default App;
