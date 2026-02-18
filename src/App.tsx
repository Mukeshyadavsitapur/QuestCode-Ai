import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle
} from "react-resizable-panels";
import Editor, { loader } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import { Brain, Code2, Send, Sparkles, Settings, Book, MessageSquare, Copy, Globe, Bot, Terminal as TerminalIcon, Layout, Menu, Plus, Trash2, ChevronRight, ChevronDown, ArrowLeft } from "lucide-react";
import { SettingsModal } from "./SettingsModal";
import { Shortcuts } from "./Shortcuts";
import { themes } from "./themes";
import { Terminal } from "./Terminal"; // Import Terminal
import { AiLearning } from "./AiLearning";
import { TOPICS_RUST, TOPICS_PYTHON, Topic } from "./learningData";
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

interface ChatSession {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}

const INITIAL_DESCRIPTION = "# Getting Started\n\nWelcome! Type some code on the left and click **'Explain Code'** to get an AI-powered breakdown of what's happening.\n\nYou can also ask specific questions using the chat bar below.";

function App() {
  const [language, setLanguage] = useState<"rust" | "python">(() => {
    return (localStorage.getItem("language") as "rust" | "python") || "python";
  });
  const [code, setCode] = useState(() => {
    const savedLanguage = localStorage.getItem("language") as "rust" | "python" || "python";
    return savedLanguage === "rust" ? DEFAULT_RUST_CODE : DEFAULT_PYTHON_CODE;
  });
  const [description, setDescription] = useState(INITIAL_DESCRIPTION);
  const [input, setInput] = useState("");
  const [isExplaining, setIsExplaining] = useState(false);

  // AI Chat History State
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("ai_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    return localStorage.getItem("current_chat_id");
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // View Mode State (AI or Docs or Shortcuts or Learning)
  const [viewMode, setViewMode] = useState<"ai" | "docs" | "shortcuts" | "learning">("ai");

  // Learning State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Update default expanded groups when language changes
  useEffect(() => {
    const topics = language === "rust" ? TOPICS_RUST : TOPICS_PYTHON;
    setExpandedGroups(new Set(topics.map(t => t.title)));
  }, [language]);

  // AI Service Mode (API or Web)
  const [aiService, setAiService] = useState<"api" | "web">("api");

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const [isMinimapVisible, setIsMinimapVisible] = useState(true);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  const [theme, setTheme] = useState<string>(() =>
    localStorage.getItem("theme") || "day"
  );
  const [activeModel, setActiveModel] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    return localStorage.getItem("selected_model");
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("apiKey", apiKey);
    if (apiKey) {
      invoke("get_available_models", { apiKey })
        .then((m: any) => setAvailableModels(m))
        .catch(console.error);
    }
  }, [apiKey]);

  useEffect(() => {
    if (selectedModel) {
      localStorage.setItem("selected_model", selectedModel);
    } else {
      localStorage.removeItem("selected_model");
    }
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem("ai_chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    if (currentChatId) {
      localStorage.setItem("current_chat_id", currentChatId);
    } else {
      localStorage.removeItem("current_chat_id");
    }
  }, [currentChatId]);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const selectedTheme = themes[theme] || themes.day;

    // Apply theme variables
    const root = document.documentElement;
    root.style.setProperty("--bg-color", selectedTheme.bg);
    root.style.setProperty("--panel-bg", selectedTheme.uiBg);
    root.style.setProperty("--border-color", selectedTheme.border);
    root.style.setProperty("--text-main", selectedTheme.text);
    root.style.setProperty("--text-muted", selectedTheme.secondary);
    root.style.setProperty("--accent-color", selectedTheme.primary);
    root.style.setProperty("--accent-hover", selectedTheme.primary);
    root.style.setProperty("--code-bg", selectedTheme.bg);
    root.style.setProperty("--highlight", selectedTheme.highlight);
    root.style.setProperty("--text-highlight", selectedTheme.activeWord);
    root.style.setProperty("--accent-text", selectedTheme.primaryText);

    const isDark =
      selectedTheme.bg.startsWith("#0") ||
      selectedTheme.bg.startsWith("#1") ||
      selectedTheme.bg.startsWith("#2") ||
      selectedTheme.bg.startsWith("#3");
    document.body.className = isDark ? "" : "light-theme";
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // Define themes globally once
  useEffect(() => {
    loader.init().then((monaco) => {
      Object.values(themes).forEach((t) => {
        monaco.editor.defineTheme(t.id, {
          base: ["day", "sepia", "forest", "yellow", "ocean", "slate"].includes(t.id) ? "vs" : "vs-dark",
          inherit: true,
          rules: [
            { token: "", foreground: t.text.replace("#", "") },
            { token: "comment", foreground: t.secondary.replace("#", "") },
            { token: "keyword", foreground: t.primary.replace("#", "") },
          ],
          colors: {
            "editor.background": t.bg,
            "editor.foreground": t.text,
            "editor.lineHighlightBackground": t.highlight,
            "editorCursor.foreground": t.primary,
            "editorWhitespace.foreground": t.border,
            "editor.selectionBackground": t.highlight,
            "editorLineNumber.foreground": t.secondary,
          },
        });
      });
    });
  }, []);

  // Sidebar Ref for click outside
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const toggleBtn = document.getElementById("sidebar-toggle");
      if (toggleBtn && toggleBtn.contains(event.target as Node)) {
        return;
      }
      if (isHistoryOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isHistoryOpen]);

  // Chat Helpers
  const extractTitle = (text: string) => {
    const firstLine = text.split("\n")[0].replace(/[#*`]/g, "").trim();
    return firstLine.substring(0, 30) || "New Chat";
  };

  const updateChatHistory = (newDescription: string, forcedTitle?: string) => {
    if (currentChatId) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
              ...chat,
              description: newDescription,
              title: forcedTitle || (chat.title === "New Chat" || chat.title === "Getting Started" ? extractTitle(newDescription) : chat.title),
            }
            : chat
        )
      );
    } else {
      const newId = Date.now().toString();
      const newChat: ChatSession = {
        id: newId,
        title: forcedTitle || extractTitle(newDescription),
        description: newDescription,
        timestamp: Date.now(),
      };
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newId);
    }
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setDescription(INITIAL_DESCRIPTION);
    setIsHistoryOpen(false);
    setViewMode("ai");
  };

  const handleSelectChat = (chat: ChatSession) => {
    setCurrentChatId(chat.id);
    setDescription(chat.description);
    setIsHistoryOpen(false);
    setViewMode("ai");
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      handleNewChat();
    }
  };

  const toggleLanguage = () => {
    if (language === "rust") {
      setLanguage("python");
      setCode(DEFAULT_PYTHON_CODE);
    } else {
      setLanguage("rust");
      setCode(DEFAULT_RUST_CODE);
    }
    setTerminalOutput("");
  };

  const toggleAiService = () => {
    setAiService((prev) => (prev === "api" ? "web" : "api"));
  };

  const handleExplain = async () => {
    if (aiService === "web") return;
    setIsExplaining(true);
    setViewMode("ai");
    console.log("Explaining code. Selection:", selectedModel);
    try {
      const response: { content: string; model: string } = await invoke("explain_code", {
        req: {
          api_key: apiKey,
          code: code,
          language: language,
          selected_model: selectedModel
        }
      });
      console.log("Response from:", response.model);
      setDescription(response.content);
      setActiveModel(response.model);
      updateChatHistory(response.content);
    } catch (error) {
      console.error("Failed to explain code:", error);
      setDescription(`## Error\n\n${error}`);
    } finally {
      setIsExplaining(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || aiService === "web") return;

    let userQuestion = input;

    // If we are in learning mode, switch to AI mode and contextually update the question
    if (viewMode === "learning" && selectedTopic) {
      userQuestion = `Regarding the topic '${selectedTopic.title}' in the ${language} course: ${input}`;
      setViewMode("ai");
    }

    setInput("");

    const isFirstMessage = description === INITIAL_DESCRIPTION;
    const cleanDescription = isFirstMessage ? "" : description;
    const newDescription = cleanDescription + (isFirstMessage ? "" : "\n\n--- \n\n") + `**You asked:** ${input}\n\n*Thinking...*`; // Display original input to user
    setDescription(newDescription);

    console.log("Asking question. Selection:", selectedModel);
    try {
      const response: { content: string; model: string } = await invoke("ask_question", {
        req: {
          api_key: apiKey,
          code: code,
          question: userQuestion, // Send context-enhanced question to AI
          language: language,
          selected_model: selectedModel
        }
      });
      console.log("Response from:", response.model);
      const finalDescription = newDescription.replace("*Thinking...*", response.content);
      setDescription(finalDescription);
      setActiveModel(response.model);
      // Use the question as title if it's the first message
      updateChatHistory(finalDescription, isFirstMessage ? userQuestion.substring(0, 40) : undefined);
    } catch (error) {
      console.error("Failed to ask question:", error);
      setDescription((prev) => prev.replace("*Thinking...*", `\n\n**Error:** ${error}`));
    }
  };

  const handleRunCode = async () => {
    if (!isTerminalVisible) setIsTerminalVisible(true);
    setIsRunning(true);
    setTerminalOutput(`Running ${language === "rust" ? "Rust" : "Python"} code...`);
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
      const url = "https://gemini.google.com/app";
      try {
        await openUrl(url);
      } catch (e) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Failed to open Gemini Web:", error);
    }
  };

  const handleRunCodeRef = useRef(handleRunCode);
  useEffect(() => {
    handleRunCodeRef.current = handleRunCode;
  }, [handleRunCode]);

  const handleEditorMount = (editor: any, monaco: any) => {
    console.log("Editor mounted, registering shortcuts");
    // Ctrl + Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      console.log("Ctrl+Enter shortcut triggered");
      handleRunCodeRef.current();
    });

    // Ctrl + S to (hypothetically) save or just prevent default
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      console.log("Save shortcut pressed - not implemented but captured");
    });
  };

  // Learning Helpers
  const toggleGroup = (groupTitle: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupTitle)) {
      newExpanded.delete(groupTitle);
    } else {
      newExpanded.add(groupTitle);
    }
    setExpandedGroups(newExpanded);
  };

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setIsHistoryOpen(false); // Close sidebar on selection logic can be here
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <Brain color="var(--accent-text)" />
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
            style={{ marginRight: 10, border: "none", color: "var(--text-muted)" }}
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
        onViewShortcuts={() => setViewMode("shortcuts")}
        selectedModel={selectedModel}
        availableModels={availableModels}
        setSelectedModel={setSelectedModel}
        activeModel={activeModel}
      />

      <main className="main-content">
        <PanelGroup orientation="horizontal">
          <Panel defaultSize={50} minSize={30}>
            <div className="panel" style={{ position: "relative" }}>
              <div className="panel-header">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <button
                    id="sidebar-toggle"
                    className="tab-btn"
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    style={{ padding: "4px" }}
                    title="Toggle History"
                  >
                    <Menu size={18} />
                  </button>
                  <button className={`tab-btn ${viewMode === "ai" ? "active" : ""}`} onClick={() => setViewMode("ai")}>
                    <MessageSquare size={14} /> AI Assistant
                  </button>
                </div>

                {viewMode === "ai" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="tab-btn active"
                      style={{ fontSize: "0.75rem", padding: "4px 12px", minWidth: "120px", display: "flex", justifyContent: "center" }}
                      onClick={toggleAiService}
                    >
                      {aiService === "api" ? (
                        <><Bot size={12} style={{ marginRight: 6 }} /> QuestCode AI</>
                      ) : (
                        <><Globe size={12} style={{ marginRight: 6 }} /> Gemini Web</>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Sidebar Overlay (Chat History OR Learning Topics) */}
              {isHistoryOpen && (
                <div className="chat-history-sidebar" ref={sidebarRef}>
                  {viewMode === "learning" ? (
                    // Learning Topics Sidebar
                    <div className="sidebar-content" style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() => { setViewMode("ai"); setIsHistoryOpen(true); }}
                          style={{ marginRight: "10px", padding: "4px" }}
                        >
                          <ArrowLeft size={16} />
                        </button>
                        <h3 style={{ fontSize: "0.9rem", fontWeight: "bold", color: "var(--accent-color)", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {language === "rust" ? "Rust" : "Python"} Course
                        </h3>
                      </div>

                      {(language === "rust" ? TOPICS_RUST : TOPICS_PYTHON).map((group) => (
                        <div key={group.title} style={{ marginBottom: "12px" }}>
                          <button
                            onClick={() => toggleGroup(group.title)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                              background: "transparent",
                              border: "none",
                              padding: "6px 0",
                              cursor: "pointer",
                              color: "var(--text-main)",
                              fontSize: "0.85rem",
                              fontWeight: "600"
                            }}
                          >
                            <span style={{ color: "var(--text-muted)", marginRight: "6px" }}>
                              {expandedGroups.has(group.title) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                            {group.title}
                          </button>

                          {expandedGroups.has(group.title) && (
                            <div style={{ marginLeft: "14px", borderLeft: "1px solid var(--border-color)", paddingLeft: "8px", marginTop: "4px" }}>
                              {group.topics.map(topic => (
                                <button
                                  key={topic.id}
                                  onClick={() => handleSelectTopic(topic)}
                                  className={`history-item ${selectedTopic?.id === topic.id ? "active" : ""}`}
                                  style={{
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    fontSize: "0.8rem",
                                    padding: "6px 8px",
                                    marginBottom: "2px",
                                    border: "none",
                                    textAlign: "left"
                                  }}
                                >
                                  <span style={{ opacity: 0.7, marginRight: "6px", fontSize: "0.75rem" }}>{topic.id}</span>
                                  <span>{topic.title}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Chat History Sidebar
                    <>
                      <div className="sidebar-header" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleNewChat}>
                          <Plus size={16} /> New Chat
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border-color)" }}
                          onClick={() => {
                            setViewMode("docs");
                            setIsHistoryOpen(false);
                          }}
                        >
                          <Book size={16} /> {language === "rust" ? "Rust Docs" : "Python Docs"}
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ width: "100%", justifyContent: "center", border: "1px solid var(--border-color)" }}
                          onClick={() => {
                            setViewMode("learning");
                            setIsHistoryOpen(true); // Keep sidebar open for topic selection
                          }}
                        >
                          <Sparkles size={16} /> Getting Started with AI
                        </button>
                      </div>
                      <div className="sidebar-content">
                        <div className="sidebar-label">Recent Chats</div>
                        {chats.length === 0 ? (
                          <div className="empty-history">No history yet</div>
                        ) : (
                          chats.map((chat) => (
                            <div key={chat.id} className={`history-item ${currentChatId === chat.id ? "active" : ""}`} onClick={() => handleSelectChat(chat)}>
                              <MessageSquare size={14} />
                              <span className="history-title">{chat.title}</span>
                              <button className="delete-btn" onClick={(e) => handleDeleteChat(e, chat.id)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: viewMode === "ai" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                {aiService === "api" ? (
                  <>
                    <div className="description-container">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match;
                            const codeText = String(children).replace(/\n$/, "");

                            if (isInline) {
                              return (
                                <code className={className} {...props} style={{
                                  background: "rgba(88, 166, 255, 0.1)",
                                  color: "var(--accent-color)",
                                  padding: "2px 5px",
                                  borderRadius: "4px",
                                  fontSize: "0.9em",
                                  fontFamily: "var(--font-mono)"
                                }}>
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <div style={{ position: "relative", margin: "1.5em 0" }}>
                                <div style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  background: "var(--panel-bg)",
                                  padding: "8px 12px",
                                  borderTopLeftRadius: "8px",
                                  borderTopRightRadius: "8px",
                                  border: "1px solid var(--border-color)",
                                  borderBottom: "none",
                                  fontSize: "0.75rem",
                                  fontFamily: "var(--font-sans)",
                                  color: "var(--text-muted)",
                                  fontWeight: 600
                                }}>
                                  <span style={{ textTransform: "uppercase" }}>{match ? match[1] : "Code"}</span>
                                  <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(codeText);
                                      }}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0 }}
                                      title="Copy to Clipboard"
                                      className="code-action-btn"
                                    >
                                      <Copy size={13} /> Copy
                                    </button>
                                    <button
                                      onClick={() => {
                                        setCode(codeText);
                                        // Optional: Switch to editor view if on mobile or if needed
                                      }}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0 }}
                                      title="Replace Editor Content"
                                      className="code-action-btn"
                                    >
                                      <TerminalIcon size={13} /> Apply
                                    </button>
                                  </div>
                                </div>
                                <div style={{
                                  background: "#1e1e1e", // Force dark bg for code
                                  padding: "16px",
                                  borderBottomLeftRadius: "8px",
                                  borderBottomRightRadius: "8px",
                                  border: "1px solid var(--border-color)",
                                  overflowX: "auto"
                                }}>
                                  <code className={className} {...props} style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem", color: "#e5e5e5" }}>
                                    {children}
                                  </code>
                                </div>
                              </div>
                            );
                          }
                        }}
                      >
                        {description}
                      </ReactMarkdown>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 24,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ background: "var(--bg-color)", padding: 32, borderRadius: 16, border: "1px solid var(--border-color)", maxWidth: 400 }}>
                      <Globe size={48} color="var(--accent-color)" style={{ marginBottom: 16 }} />
                      <h3 style={{ marginBottom: 8, color: "var(--text-main)" }}>Open Gemini Web</h3>
                      <p style={{ color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                        Use the web version of Gemini to chat, analyze images, and more. We'll copy your code to the clipboard for you.
                      </p>
                      <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleOpenGeminiWeb}>
                        <Copy size={16} /> Copy Code & Open Gemini
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: viewMode === "docs" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
                <iframe
                  src={language === "rust" ? "https://doc.rust-lang.org/book/" : "https://docs.python.org/3/"}
                  title="Documentation"
                  style={{ flex: 1, border: "none", width: "100%", height: "100%", backgroundColor: "var(--bg-color)" }}
                />
              </div>

              <div style={{ display: viewMode === "shortcuts" ? "flex" : "none", flex: 1, flexDirection: "column", overflow: "hidden" }}>
                <Shortcuts />
              </div>

              <div style={{ display: viewMode === "learning" ? "flex" : "none", flex: 1, flexDirection: "column", overflow: "hidden" }}>
                <AiLearning
                  language={language}
                  apiKey={apiKey}
                  selectedModel={selectedModel}
                  topic={selectedTopic}
                  onBack={() => setIsHistoryOpen(true)}
                  onApplyCode={setCode}
                />
              </div>


              {/* Shared AI Controls */}
              {((viewMode === "ai" && aiService === "api") || viewMode === "learning") && (
                <div className="ai-controls" style={{ borderTop: "1px solid var(--border-color)", background: "var(--panel-bg)", zIndex: 10, padding: "12px" }}>
                  <input
                    type="text"
                    className="ai-input"
                    placeholder={viewMode === "learning" && selectedTopic ? `Ask about ${selectedTopic.title}...` : "Ask a question about this code..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button className="btn btn-primary" onClick={handleSend}>
                    <Send size={18} />
                  </button>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="resizer horizontal" />

          <Panel defaultSize={50} minSize={30}>
            <PanelGroup orientation="vertical">
              <Panel defaultSize={70} minSize={20}>
                <div className="panel">
                  <div className="panel-header">
                    <span>CODE EDITOR</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className={`tab-btn ${isMinimapVisible ? "active" : ""}`}
                        title={isMinimapVisible ? "Hide Minimap" : "Show Minimap"}
                        onClick={() => setIsMinimapVisible(!isMinimapVisible)}
                        style={{ padding: "4px 8px" }}
                      >
                        <Layout size={14} />
                      </button>
                      <button
                        className={`tab-btn ${isTerminalVisible ? "active" : ""}`}
                        title={isTerminalVisible ? "Hide Terminal" : "Show Terminal"}
                        onClick={() => setIsTerminalVisible(!isTerminalVisible)}
                        style={{ padding: "4px 8px" }}
                      >
                        <TerminalIcon size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleRunCode}
                        disabled={isRunning}
                        style={{ padding: "4px 12px", fontSize: "0.8rem" }}
                      >
                        Run Code
                      </button>
                    </div>
                  </div>
                  <div className="editor-container" style={{ flex: 1, position: "relative" }}>
                    <Editor
                      height="100%"
                      language={language}
                      theme={theme}
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      onMount={handleEditorMount}
                      options={{
                        minimap: { enabled: isMinimapVisible },
                        fontSize: 14,
                        fontFamily: '"JetBrains Mono", monospace',
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </Panel>

              {isTerminalVisible && (
                <>
                  <PanelResizeHandle className="resizer vertical" />
                  <Panel defaultSize={30} minSize={15}>
                    <div className="panel" style={{ height: "100%" }}>
                      <Terminal output={terminalOutput} isRunning={isRunning} onClear={() => setTerminalOutput("")} />
                    </div>
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </main>
    </div >
  );
}

export default App;
