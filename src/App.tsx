import { useState, useEffect, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle
} from "react-resizable-panels";
import Editor, { loader } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Rnd } from "react-rnd";
import {
  Code2, Send, Sparkles, Settings, Book, MessageSquare, Copy, Globe, Bot, Terminal as TerminalIcon, Layout, Menu, Plus, Trash2,
  ChevronRight,
  ChevronDown,
  Square,
  ArrowLeft,
  Eye,
  Zap,
  X,
  PanelBottom,
  PanelRight,
  PanelLeft,
  PanelLeftClose
} from "lucide-react";
import { SettingsModal } from "./SettingsModal";
import { Shortcuts } from "./Shortcuts";
import { themes } from "./themes";
import { Terminal } from "./Terminal"; // Import Terminal
import { AiLearning, AiLearningHandle } from "./AiLearning";
import { TOPICS_RUST, TOPICS_PYTHON, TOPICS_DSA, TOPICS_HTML, TOPICS_CSS, TOPICS_JS, TOPICS_ML, Topic } from "./learningData";
import "./App.css";
import { DEFAULT_RUST_CODE, DEFAULT_PYTHON_CODE, DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE, DEFAULT_ML_CODE } from "./defaultCode";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";




interface ChatSession {
  id: string;
  title: string;
  description: string;
  timestamp: number;
}

const INITIAL_DESCRIPTION = "# Getting Started\n\nWelcome! Type some code on the left and click **'Explain Code'** to get an AI-powered breakdown of what's happening.\n\nYou can also ask specific questions using the chat bar below.";

// Helper to check if running in Tauri
const isTauri = () => "TAURI_INTERNALS" in window || "__TAURI_INTERNALS__" in window;

function App() {
  // Helper to get default code for a language
  const getDefaultCode = (lang: string) => {
    if (lang === "rust") return DEFAULT_RUST_CODE;
    if (lang === "html") return DEFAULT_HTML_CODE;
    if (lang === "css") return DEFAULT_CSS_CODE;
    if (lang === "javascript") return DEFAULT_JS_CODE;
    if (lang === "ml") return DEFAULT_ML_CODE;
    return DEFAULT_PYTHON_CODE;
  };

  const [language, setLanguage] = useState<"rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml">(() => {
    return (localStorage.getItem("language") as "rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml") || "python";
  });

  // Initialize code from localStorage based on valid language
  const [code, setCode] = useState(() => {
    const savedCode = localStorage.getItem(`code_${language}`);
    return savedCode || getDefaultCode(language);
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
  const [visibleChats, setVisibleChats] = useState(20);
  const [isAiAssistantVisible, setIsAiAssistantVisible] = useState(true);

  const [currentQuickChatId, setCurrentQuickChatId] = useState<string | null>(() => {
    return localStorage.getItem("current_quick_chat_id");
  });
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [quickChatInput, setQuickChatInput] = useState("");
  const INITIAL_QUICK_CHAT_DESCRIPTION = "## Quick Chat\n\nAsk me anything! Let me help you while you read the documentation.";
  const [quickChatDescription, setQuickChatDescription] = useState(() => {
    const savedId = localStorage.getItem("current_quick_chat_id");
    if (savedId) {
      const savedChats = localStorage.getItem("ai_quick_chats");
      if (savedChats) {
        const parsedChats: ChatSession[] = JSON.parse(savedChats);
        const currentChat = parsedChats.find(c => c.id === savedId);
        if (currentChat) return currentChat.description;
      }
    }
    return INITIAL_QUICK_CHAT_DESCRIPTION;
  });
  const [isQuickChatExplaining, setIsQuickChatExplaining] = useState(false);

  // Quick Chat Window Geometry State
  const [quickChatGeometry, setQuickChatGeometry] = useState(() => {
    const saved = localStorage.getItem("quickChatGeometry");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse quickChatGeometry", e);
      }
    }
    return {
      x: window.innerWidth ? (window.innerWidth / 2) - 200 : 50,
      y: window.innerHeight ? (window.innerHeight / 2) - 250 : 50,
      width: 400,
      height: 500
    };
  });

  // Effect to save quick chat geometry 
  useEffect(() => {
    localStorage.setItem("quickChatGeometry", JSON.stringify(quickChatGeometry));
  }, [quickChatGeometry]);

  // View Mode State (AI or Docs or Shortcuts or Learning)
  const [viewMode, setViewMode] = useState<"ai" | "docs" | "shortcuts" | "learning">("ai");

  // Highlight code in chat
  useEffect(() => {
    Prism.highlightAll();
  }, [description, quickChatDescription, viewMode, isQuickChatOpen]);

  // Learning State
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(() => {
    const saved = localStorage.getItem(`topic_${language}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedGroup, setSelectedGroup] = useState<string | null>(() => {
    // Optional: Persist selected group too if needed, or derive/reset
    // For now, let's reset or try to recover if we wanted to be very precise
    return null;
  });
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Update default expanded groups when language changes
  useEffect(() => {
    let topics: any[] = [];
    if (language === "rust") topics = TOPICS_RUST;
    else if (language === "python") topics = TOPICS_PYTHON;
    else if (language === "dsa") topics = TOPICS_DSA;
    else if (language === "html") topics = TOPICS_HTML;
    else if (language === "css") topics = TOPICS_CSS;
    else if (language === "javascript") topics = TOPICS_JS;
    else if (language === "ml") topics = TOPICS_ML;

    setExpandedGroups(new Set(topics.map(t => t.title)));
  }, [language]);

  // Scroll Refs
  const mainChatScrollRef = useRef<HTMLDivElement>(null);
  const quickChatScrollRef = useRef<HTMLDivElement>(null);

  const scrollToLatestMessage = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      if (ref.current) {
        const latestQuestion = ref.current.querySelector('.latest-question-anchor');
        if (latestQuestion) {
          // Wait for a tiny bit for render to finish
          setTimeout(() => {
            if (ref.current && latestQuestion) {
              ref.current.scrollTop = (latestQuestion as HTMLElement).offsetTop;
            }
          }, 10);
        } else {
          // Fallback
          ref.current.scrollTop = ref.current.scrollHeight;
        }
      }
    }, 50);
  };

  // Persist Code per Language
  useEffect(() => {
    localStorage.setItem(`code_${language}`, code);
  }, [code, language]);

  // Persist Topic per Language
  useEffect(() => {
    if (selectedTopic) {
      localStorage.setItem(`topic_${language}`, JSON.stringify(selectedTopic));
    } else {
      localStorage.removeItem(`topic_${language}`);
    }
  }, [selectedTopic, language]);


  // AI Service Mode (API or Web)
  const [aiService, setAiService] = useState<"api" | "web">("api");

  // Editor State
  const [isEditorVisible, setIsEditorVisible] = useState(true);

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const [terminalLayout, setTerminalLayout] = useState<"vertical" | "horizontal">(() => {
    return (localStorage.getItem("terminalLayout") as "vertical" | "horizontal") || "vertical";
  });
  const [webPreviewContent, setWebPreviewContent] = useState("");
  const [isMinimapVisible, setIsMinimapVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem("terminalLayout", terminalLayout);
  }, [terminalLayout]);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [llmProvider, setLlmProvider] = useState<string>(() =>
    localStorage.getItem("llmProvider") || "groq"
  );
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("apiKey") || "");
  const [openAiApiKey, setOpenAiApiKey] = useState(() => localStorage.getItem("openAiApiKey") || "");
  const [anthropicApiKey, setAnthropicApiKey] = useState(() => localStorage.getItem("anthropicApiKey") || "");
  const [groqApiKey, setGroqApiKey] = useState(() => localStorage.getItem("groqApiKey") || "");
  const [huggingFaceApiKey, setHuggingFaceApiKey] = useState(() => localStorage.getItem("huggingFaceApiKey") || "");
  const [theme, setTheme] = useState<string>(() =>
    localStorage.getItem("theme") || "day"
  );

  const [webLlm, setWebLlm] = useState<string>(() => localStorage.getItem("webLlm") || llmProvider);

  useEffect(() => {
    localStorage.setItem("webLlm", webLlm);
  }, [webLlm]);

  // Sync webLlm when llmProvider changes if they want it to default
  useEffect(() => {
    setWebLlm(llmProvider);
  }, [llmProvider]);
  const [activeModel, setActiveModel] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string | null>(() => {
    return localStorage.getItem("selected_model");
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem("llmProvider", llmProvider);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("openAiApiKey", openAiApiKey);
    localStorage.setItem("anthropicApiKey", anthropicApiKey);
    localStorage.setItem("groqApiKey", groqApiKey);
    localStorage.setItem("huggingFaceApiKey", huggingFaceApiKey);
    if (llmProvider === "gemini") {
      if (apiKey) {
        if (!isTauri()) {
          console.warn("Not in Tauri environment, skipping model fetch");
          setAvailableModels(["gemini-2.0-flash", "gemini-1.5-flash"]); // Fallback for browser demo
          return;
        }
        invoke("get_available_models", { apiKey })
          .then((m: any) => setAvailableModels(m))
          .catch(console.error);
      } else {
        setAvailableModels([]);
      }
    } else if (llmProvider === "openai") {
      setAvailableModels(["gpt-4o", "chatgpt-4o-latest", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"]);
    } else if (llmProvider === "anthropic") {
      setAvailableModels(["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229", "claude-3-sonnet-20240229", "claude-3-haiku-20240307"]);
    } else if (llmProvider === "groq") {
      setAvailableModels(["openai/gpt-oss-20b", "openai/gpt-oss-120b", "openai/gpt-oss-safeguard-20b", "moonshotai/kimi-k2-instruct-0905", "meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"]);
    } else if (llmProvider === "huggingface") {
      setAvailableModels([
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B",
        "Qwen/Qwen2.5-Coder-7B-Instruct",
        "microsoft/phi-4-mini",
        "meta-llama/Llama-3.1-8B-Instruct",
        "google/gemma-2-9b-it",
        "mistralai/Mistral-7B-Instruct-v0.3",
        "bigcode/starcoder2-7b",
        "ibm-granite/granite-3.0-8b-instruct",
        "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct",
        "sentence-transformers/all-MiniLM-L6-v2",
        "meta-llama/Llama-3.3-70B-Instruct",
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B",
        "Qwen/Qwen2.5-72B-Instruct",
        "mistralai/Mixtral-8x7B-Instruct-v0.1"
      ]);
    }
  }, [llmProvider, apiKey, openAiApiKey, anthropicApiKey, groqApiKey, huggingFaceApiKey]);

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
    if (currentQuickChatId) {
      localStorage.setItem("current_quick_chat_id", currentQuickChatId);
    } else {
      localStorage.removeItem("current_quick_chat_id");
    }
  }, [currentQuickChatId]);

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
    root.style.setProperty("--text-highlight", selectedTheme.activeWord);
    root.style.setProperty("--accent-text", selectedTheme.primaryText);
    root.style.setProperty("--secondary-color", selectedTheme.buttonBg);

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
        const isLight = ["day", "sepia", "yellow", "ocean", "slate"].includes(t.id);
        const base = isLight ? "vs" : "vs-dark";

        // Define syntax highlighting rules based on light/dark mode
        const rules = isLight
          ? [
            { token: "", foreground: t.text.replace("#", "") }, // Default text color
            { token: "comment", foreground: "008000" },
            { token: "keyword", foreground: "098658", fontStyle: "bold" },
            { token: "string", foreground: "a31515" },
            { token: "number", foreground: "098658" },
            { token: "regexp", foreground: "811f3f" },
            { token: "type", foreground: "267f99" }, // Classes, Types
            { token: "class", foreground: "267f99" },
            { token: "function", foreground: "795e26" }, // Functions
            { token: "variable", foreground: "001080" }, // Variables
            { token: "operator", foreground: "333333" },
            { token: "tag", foreground: "800000" }, // HTML tags
            { token: "attribute.name", foreground: "e50000" },
            { token: "attribute.value", foreground: "0000ff" },
          ]
          : [
            { token: "", foreground: t.text.replace("#", "") }, // Default text color
            { token: "comment", foreground: "6A9955" },
            { token: "keyword", foreground: "569CD6", fontStyle: "bold" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
            { token: "regexp", foreground: "D16969" },
            { token: "type", foreground: "4EC9B0" }, // Classes, Types
            { token: "class", foreground: "4EC9B0" },
            { token: "function", foreground: "DCDCAA" }, // Functions
            { token: "variable", foreground: "9CDCFE" }, // Variables
            { token: "operator", foreground: "D4D4D4" },
            { token: "tag", foreground: "569CD6" }, // HTML tags
            { token: "attribute.name", foreground: "9CDCFE" },
            { token: "attribute.value", foreground: "CE9178" },
          ];

        monaco.editor.defineTheme(t.id, {
          base: base,
          inherit: true, // Inherit base VS Code styles
          rules: rules,
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
  const learningRef = useRef<AiLearningHandle>(null);

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
      setChats((prev) => {
        const newChats = [newChat, ...prev];
        return newChats.length > 500 ? newChats.slice(0, 500) : newChats;
      });
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

  const handleSendQuickChat = async () => {
    if (!quickChatInput.trim() || aiService === "web") return;

    let userQuestion = quickChatInput;
    setQuickChatInput("");

    const isFirstMessage = quickChatDescription === INITIAL_QUICK_CHAT_DESCRIPTION;
    const cleanDescription = isFirstMessage ? "" : quickChatDescription.replace(/<span class="latest-question-anchor"><\/span>/g, ""); // Remove previous anchors
    const newDescription = cleanDescription + (isFirstMessage ? "" : "\n\n--- \n\n") + `<span class="latest-question-anchor"></span>**You asked:** ${userQuestion}\n\n*Thinking...*`;
    setQuickChatDescription(newDescription);
    scrollToLatestMessage(quickChatScrollRef);

    if (!isTauri()) {
      setTimeout(() => {
        setQuickChatDescription((prev: string) => prev.replace("*Thinking...*", "\n\n**Browser Mode:** AI Chat requires the desktop application to access the backend."));
      }, 500);
      return;
    }

    setIsQuickChatExplaining(true);
    try {
      const currentApiKey = llmProvider === "openai" ? openAiApiKey : llmProvider === "anthropic" ? anthropicApiKey : llmProvider === "groq" ? groqApiKey : llmProvider === "huggingface" ? huggingFaceApiKey : apiKey;
      const response: { content: string; model: string } = await invoke("ask_question", {
        req: {
          api_key: currentApiKey,
          provider: llmProvider,
          code: code,
          question: userQuestion,
          language: (language === "dsa" || language === "ml") ? "python" : language,
          selected_model: selectedModel
        }
      });
      const finalDescription = newDescription.replace("*Thinking...*", response.content);
      setQuickChatDescription(finalDescription);
      setActiveModel(response.model);

      // Save to main unified chat history directly
      if (currentQuickChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentQuickChatId
              ? {
                ...chat,
                description: finalDescription,
              }
              : chat
          )
        );
      } else {
        const newId = Date.now().toString();
        const newChat: ChatSession = {
          id: newId,
          title: userQuestion.substring(0, 40) || "Quick Chat",
          description: finalDescription,
          timestamp: Date.now(),
        };
        setChats((prev) => {
          const newChats = [newChat, ...prev];
          return newChats.length > 500 ? newChats.slice(0, 500) : newChats;
        });
        setCurrentQuickChatId(newId);
      }

    } catch (error) {
      console.error("Failed to ask quick question:", error);
      setQuickChatDescription((prev: string) => prev.replace("*Thinking...*", `\n\n**Error:** ${error}`));
    } finally {
      setIsQuickChatExplaining(false);
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setChats((prev) => prev.filter((c) => c.id !== id));
    if (currentChatId === id) {
      handleNewChat();
    }
  };



  const toggleAiService = () => {
    setAiService((prev) => (prev === "api" ? "web" : "api"));
  };

  const handleExplain = async () => {
    if (aiService === "web") return;
    setIsExplaining(true);
    setViewMode("ai");
    setIsAiAssistantVisible(true);

    if (!isTauri()) {
      setDescription("## Browser Mode\n\nAI features require the desktop application to access the backend. Please download the full application.");
      setIsExplaining(false);
      return;
    }

    console.log("Explaining code. Selection:", selectedModel);
    const currentApiKey = llmProvider === "openai" ? openAiApiKey : llmProvider === "anthropic" ? anthropicApiKey : llmProvider === "groq" ? groqApiKey : llmProvider === "huggingface" ? huggingFaceApiKey : apiKey;
    try {
      const response: { content: string; model: string } = await invoke("explain_code", {
        req: {
          api_key: currentApiKey,
          provider: llmProvider,
          code: code,
          language: (language === "dsa" || language === "ml") ? "python" : language,
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

    // If we are in learning mode, use persistent Q&A
    if (viewMode === "learning" && selectedTopic) {
      if (learningRef.current) {
        await learningRef.current.askQuestion(input);
        setInput("");
        return;
      }
    }

    setInput("");

    const isFirstMessage = description === INITIAL_DESCRIPTION;
    const cleanDescription = isFirstMessage ? "" : description.replace(/<span class="latest-question-anchor"><\/span>/g, ""); // Remove previous anchors
    const newDescription = cleanDescription + (isFirstMessage ? "" : "\n\n--- \n\n") + `<span class="latest-question-anchor"></span>**You asked:** ${input}\n\n*Thinking...*`; // Display original input to user
    setDescription(newDescription);
    scrollToLatestMessage(mainChatScrollRef);

    if (!isTauri()) {
      setTimeout(() => {
        setDescription((prev) => prev.replace("*Thinking...*", "\n\n**Browser Mode:** AI Chat requires the desktop application to access the backend."));
      }, 500);
      return;
    }

    console.log("Asking question. Selection:", selectedModel);
    const currentApiKey = llmProvider === "openai" ? openAiApiKey : llmProvider === "anthropic" ? anthropicApiKey : llmProvider === "groq" ? groqApiKey : llmProvider === "huggingface" ? huggingFaceApiKey : apiKey;
    try {
      const response: { content: string; model: string } = await invoke("ask_question", {
        req: {
          api_key: currentApiKey,
          provider: llmProvider,
          code: code,
          question: userQuestion, // Send context-enhanced question to AI
          language: (language === "dsa" || language === "ml") ? "python" : language,
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

  // Update Web Preview on code change
  useEffect(() => {
    if (language === "html") {
      setWebPreviewContent(code);
    } else if (language === "css") {
      // Check if the user pasted an entire HTML document into the CSS editor
      const hasHtmlStructure = /<html|<body|<head/i.test(code);

      if (hasHtmlStructure) {
        let contentToRender = code;
        const htmlMatch = code.match(/([\s\S]*<\/(?:html|body)>)([\s\S]*)/i);

        if (htmlMatch) {
          const htmlPart = htmlMatch[1];
          const cssPart = htmlMatch[2].trim();
          if (cssPart.length > 0) {
            const headEndIndex = htmlPart.toLowerCase().indexOf('</head>');
            if (headEndIndex !== -1) {
              contentToRender = htmlPart.substring(0, headEndIndex) + `\n<style>\n${cssPart}\n</style>\n` + htmlPart.substring(headEndIndex);
            } else {
              contentToRender = htmlPart + `\n<style>\n${cssPart}\n</style>`;
            }
          }
        }
        setWebPreviewContent(contentToRender);
      } else {
        setWebPreviewContent(`
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                ${code}
              </style>
            </head>
            <body>
              <div class="preview-container">
                <header class="preview-header">
                  <h1>Web Component Preview</h1>
                  <p>Edit the CSS on the left to style these elements dynamically.</p>
                </header>

                <div class="grid-layout">
                  <main class="main-card">
                    <h2>Main Content Area</h2>
                    <p>This is a primary card component demonstrating standard text typography and spacing.</p>
                    
                    <div class="form-group">
                      <label for="example-input">Email Address</label>
                      <input type="email" id="example-input" placeholder="Enter your email" />
                    </div>
                    
                    <div class="button-group">
                      <button class="btn btn-primary">Primary Action</button>
                      <button class="btn btn-secondary">Secondary Action</button>
                    </div>
                  </main>

                  <aside class="sidebar-card">
                    <h3>Quick Links</h3>
                    <ul class="nav-list">
                      <li><a href="#" class="nav-link active">Dashboard</a></li>
                      <li><a href="#" class="nav-link">Settings</a></li>
                      <li><a href="#" class="nav-link">Profile</a></li>
                      <li><a href="#" class="nav-link">Messages</a></li>
                    </ul>
                  </aside>
                </div>

                <section class="features-section">
                  <div class="feature-badge">New Feature</div>
                  <h3>Interactive Elements</h3>
                  <p>Hover over the elements or focus the input to test your pseudo-class styling.</p>
                  
                  <div class="toggle-switch">
                    <input type="checkbox" id="toggle" />
                    <label for="toggle">Enable notifications</label>
                  </div>
                </section>
              </div>
            </body>
          </html>
        `);
      }
    }
  }, [code, language]);

  const handleRunCode = async () => {
    if (isRunning) {
      // If already running, treating this as a STOP request
      try {
        await invoke("stop_execution");
      } catch (error) {
        console.error("Failed to stop execution:", error);
      }
      return;
    }

    if (!isTerminalVisible) setIsTerminalVisible(true);

    if (language === "html" || language === "css") {
      return;
    }

    setIsRunning(true);
    setTerminalOutput(`Running ${language.toUpperCase()} code...`);

    if (!isTauri()) {
      setTerminalOutput("Error: Running code requires the desktop application backend.\n\nBrowser mode mainly supports HTML/CSS Preview.");
      setIsRunning(false);
      return;
    }

    try {
      const output: string = await invoke("execute_code", { code, language: (language === "dsa" || language === "ml") ? "python" : language });
      setTerminalOutput(output);
    } catch (error) {
      console.error("Failed to run code:", error);
      setTerminalOutput(`Error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };


  const handleOpenWebLlm = async () => {
    try {
      await navigator.clipboard.writeText(code);
      let url = "https://gemini.google.com/app";
      if (webLlm === "openai") url = "https://chatgpt.com/";
      else if (webLlm === "anthropic") url = "https://claude.ai/new";
      else if (webLlm === "groq") url = "https://groq.com/";
      else if (webLlm === "huggingface") url = "https://huggingface.co/chat/";

      try {
        await openUrl(url);
      } catch (e) {
        window.open(url, "_blank");
      }
    } catch (error) {
      console.error("Failed to open Web LLM:", error);
    }
  };

  const handleRunCodeRef = useRef(handleRunCode);
  useEffect(() => {
    handleRunCodeRef.current = handleRunCode;
  }, [handleRunCode]);

  const handleExplainRef = useRef(handleExplain);
  useEffect(() => {
    handleExplainRef.current = handleExplain;
  }, [handleExplain]);

  // Global Keyboard Shortcuts (VS Code style)
  useEffect(() => {
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      // F11: Full Screen
      if (e.key === "F11") {
        e.preventDefault();
        if (isTauri()) {
          const appWindow = getCurrentWindow();
          const isFullscreen = await appWindow.isFullscreen();
          await appWindow.setFullscreen(!isFullscreen);
        }
      }

      // F5: Run Code
      if (e.key === "F5") {
        e.preventDefault();
        handleRunCodeRef.current();
      }

      // F4: Toggle Editor
      if (e.key === "F4") {
        e.preventDefault();
        setIsEditorVisible(prev => !prev);
      }

      // F7: Toggle Terminal Layout
      if (e.key === "F7") {
        e.preventDefault();
        setTerminalLayout(prev => prev === "vertical" ? "horizontal" : "vertical");
      }

      // F1: Command Palette / Settings
      if (e.key === "F1") {
        e.preventDefault();
        setIsSettingsOpen(true);
      }

      // Ctrl/Cmd + B: Toggle Sidebar
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === "KeyB") {
        e.preventDefault();
        setIsHistoryOpen(prev => !prev);
      }

      // Ctrl/Cmd + ` : Toggle Terminal
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === "`" || e.code === "Backquote")) {
        e.preventDefault();
        setIsTerminalVisible(prev => !prev);
      }

      // Ctrl + P: Quick Chat
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code === "KeyP") {
        e.preventDefault();
        setIsQuickChatOpen((prev) => {
          if (!prev && !currentQuickChatId) {
            setQuickChatDescription(INITIAL_QUICK_CHAT_DESCRIPTION);
          }
          return !prev;
        });
      }

      // Ctrl + Alt + B: Toggle AI Assistant
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyB") {
        e.preventDefault();
        setIsAiAssistantVisible(prev => !prev);
      }

      // Ctrl + Alt + C: Explain Code
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyC") {
        e.preventDefault();
        handleExplainRef.current();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  const handleEditorMount = (editor: any, monaco: any) => {
    console.log("Editor mounted, registering shortcuts");
    // Ctrl + Enter to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      console.log("Ctrl+Enter shortcut triggered");
      handleRunCodeRef.current();
    });

    // F5 to Run Code
    editor.addCommand(monaco.KeyCode.F5, () => {
      console.log("F5 shortcut triggered");
      handleRunCodeRef.current();
    });

    // F4 to Toggle Editor
    editor.addCommand(monaco.KeyCode.F4, () => {
      setIsEditorVisible(prev => !prev);
    });

    // F7 to Toggle Terminal Layout
    editor.addCommand(monaco.KeyCode.F7, () => {
      setTerminalLayout(prev => prev === "vertical" ? "horizontal" : "vertical");
    });

    // F11 to Toggle Full Screen
    editor.addCommand(monaco.KeyCode.F11, async () => {
      if (isTauri()) {
        const appWindow = getCurrentWindow();
        const isFullscreen = await appWindow.isFullscreen();
        await appWindow.setFullscreen(!isFullscreen);
      }
    });

    // F1 to Open Settings
    editor.addCommand(monaco.KeyCode.F1, () => {
      setIsSettingsOpen(true);
    });

    // Ctrl+B to Toggle Sidebar
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      setIsHistoryOpen(prev => !prev);
    });

    // Ctrl+` to Toggle Terminal (using backquote key code if available, otherwise rely on fallback)
    // We add this to the editor directly and prevent default bubbling
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_BACKTICK, () => {
      setIsTerminalVisible(prev => !prev);
    });

    // Ctrl+P to Toggle Quick Chat
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyP, () => {
      setIsQuickChatOpen((prev) => {
        if (!prev && !currentQuickChatId) {
          setQuickChatDescription(INITIAL_QUICK_CHAT_DESCRIPTION);
        }
        return !prev;
      });
    });

    // We also need to intercept onKeyDown directly because Windows/Linux might still send 
    // We also need to intercept onKeyDown directly because Windows/Linux might still send
    // AltGr/Ctrl+Alt combinations as text input even if a command is bound.
    editor.onKeyDown((e: any) => {
      // Monaco event wrapper doesn't have .code, we must use e.browserEvent.code
      const browserEvt = e.browserEvent as KeyboardEvent;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      if (isCtrlOrMeta && e.shiftKey) {
        // Removed J and M shift bindings as they are moved to F keys
      }

      // Intercept functional keys to prevent default behavior like Caret Browsing (F7)
      if (e.keyCode === monaco.KeyCode.F4) {
        e.preventDefault();
        setIsEditorVisible(prev => !prev);
      } else if (e.keyCode === monaco.KeyCode.F7) {
        e.preventDefault();
        setTerminalLayout(prev => prev === "vertical" ? "horizontal" : "vertical");
      }

      if (isCtrlOrMeta && e.altKey) {
        const physicalCode = browserEvt.code;

        if (physicalCode === "KeyB") {
          e.preventDefault();
          e.stopPropagation();
          setIsAiAssistantVisible(prev => !prev);
        } else if (physicalCode === "KeyC") {
          e.preventDefault();
          e.stopPropagation();
          handleExplainRef.current();
        }
      }
    });

    // Also explicitly override the default "Toggle Line Comment" behavior to use standard Ctrl+/ instead 
    // and make sure Ctrl+` doesn't fall through to it
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Slash, () => {
      editor.getAction('editor.action.commentLine').run();
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

  const handleSelectTopic = (topic: Topic, groupTitle: string) => {
    setSelectedTopic(topic);
    setSelectedGroup(groupTitle);
    setIsHistoryOpen(false); // Close sidebar on selection logic can be here
  };

  const markdownComponents = useMemo(() => ({
    table: ({ node, ...props }: any) => (
      <div className="table-wrapper" style={{ overflowX: "auto", margin: "1.5em 0", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
        <table {...props} style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", margin: 0, border: "none" }} />
      </div>
    ),
    th: ({ node, ...props }: any) => (
      <th {...props} style={{ borderBottom: "2px solid var(--border-color)", borderRight: "1px solid var(--border-color)", padding: "12px 16px", textAlign: "left", background: "rgba(88, 166, 255, 0.15)", color: "var(--accent-text)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em", resize: "horizontal", overflow: "hidden", minWidth: "120px", position: "relative" }} />
    ),
    td: ({ node, ...props }: any) => (
      <td {...props} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", wordBreak: "break-word" }} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr {...props} className="markdown-row" />
    ),
    pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    code({ className, children, ...props }: { className?: string, children?: React.ReactNode, [key: string]: any }) {
      const match = /language-(\w+)/.exec(className || "");
      let displayLang = match ? match[1] : "";
      if (displayLang === "ml" || displayLang === "dsa") displayLang = "python";
      const mappedClassName = displayLang ? `language-${displayLang}` : className;
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
            <span style={{ textTransform: "uppercase" }}>{displayLang || "Code"}</span>
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
          <pre style={{
            background: "#1e1e1e", // Force dark bg for code
            padding: "16px",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            border: "1px solid var(--border-color)",
            overflowX: "auto",
            margin: 0 // Remove default pre margin
          }} className={mappedClassName}>
            <code className={mappedClassName} {...props} style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              color: "#e5e5e5",
              whiteSpace: "pre",
              textAlign: "left",
              display: "block"
            }}>
              {children}
            </code>
          </pre>
        </div>
      );
    }
  }), []);

  const quickChatMarkdownComponents = useMemo(() => ({
    table: ({ node, ...props }: any) => (
      <div className="table-wrapper" style={{ overflowX: "auto", margin: "1.5em 0", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
        <table {...props} style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", margin: 0, border: "none" }} />
      </div>
    ),
    th: ({ node, ...props }: any) => (
      <th {...props} style={{ borderBottom: "2px solid var(--border-color)", borderRight: "1px solid var(--border-color)", padding: "12px 16px", textAlign: "left", background: "rgba(88, 166, 255, 0.15)", color: "var(--accent-text)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em", resize: "horizontal", overflow: "hidden", minWidth: "120px", position: "relative" }} />
    ),
    td: ({ node, ...props }: any) => (
      <td {...props} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", wordBreak: "break-word" }} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr {...props} className="markdown-row" />
    ),
    pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    code({ className, children, ...props }: { className?: string, children?: React.ReactNode, [key: string]: any }) {
      const match = /language-(\w+)/.exec(className || "");
      let displayLang = match ? match[1] : "";
      if (displayLang === "ml" || displayLang === "dsa") displayLang = "python";
      const mappedClassName = displayLang ? `language-${displayLang}` : className;
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
            <span style={{ textTransform: "uppercase" }}>{displayLang || "Code"}</span>
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
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0 }}
                title="Replace Editor Content"
                className="code-action-btn"
              >
                <TerminalIcon size={13} /> Apply
              </button>
            </div>
          </div>
          <pre style={{
            background: "#1e1e1e",
            padding: "16px",
            borderBottomLeftRadius: "8px",
            borderBottomRightRadius: "8px",
            border: "1px solid var(--border-color)",
            overflowX: "auto",
            margin: 0
          }} className={mappedClassName}>
            <code className={mappedClassName} {...props} style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.9rem",
              color: "#e5e5e5",
              whiteSpace: "pre",
              textAlign: "left",
              display: "block"
            }}>
              {children}
            </code>
          </pre>
        </div>
      );
    }
  }), []);

  return (
    <div className="app-container">


      <main className="main-content">
        <PanelGroup orientation="horizontal">
          {isAiAssistantVisible && (
            <>
              <Panel defaultSize={50} minSize={30}>
                <div className="panel" style={{ position: "relative" }}>
                  <div className="panel-header">
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <button
                        id="sidebar-toggle"
                        className="tab-btn"
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        style={{ padding: "4px" }}
                        title="Toggle History (Ctrl+B)"
                      >
                        <Menu size={18} />
                      </button>
                      <button className={`tab-btn ${viewMode === "ai" ? "active" : ""}`} onClick={() => setViewMode("ai")}>
                        <MessageSquare size={14} /> AI Assistant
                      </button>
                      <button
                        className={`tab-btn ${isQuickChatOpen ? "active" : ""}`}
                        onClick={() => {
                          setIsQuickChatOpen(!isQuickChatOpen);
                          if (!isQuickChatOpen && !currentQuickChatId) {
                            setQuickChatDescription(INITIAL_QUICK_CHAT_DESCRIPTION);
                          }
                        }}
                        style={{ border: "none", color: "var(--accent-color)", padding: "4px 8px", marginLeft: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                        title="Quick Chat (Ctrl+P)"
                      >
                        <Zap size={14} fill={isQuickChatOpen ? "currentColor" : "none"} /> <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>Quick Chat</span>
                      </button>
                      <button
                        className={`tab-btn ${!isEditorVisible ? "active" : ""}`}
                        onClick={() => setIsEditorVisible(!isEditorVisible)}
                        style={{ border: "none", color: "var(--accent-color)", padding: "4px 8px", marginLeft: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                        title={isEditorVisible ? "Hide Editor (F4)" : "Show Editor (F4)"}
                      >
                        <PanelRight size={14} /> <span style={{ fontSize: "0.8rem", fontWeight: "600" }}>{isEditorVisible ? "Hide Editor" : "Show Editor"}</span>
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
                            <><Globe size={12} style={{ marginRight: 6 }} /> {webLlm === "openai" ? "ChatGPT" : webLlm === "anthropic" ? "Claude" : webLlm === "groq" ? "Groq" : webLlm === "huggingface" ? "Hugging Face" : "Gemini"} Web</>
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
                              {language.toUpperCase()} Course
                            </h3>
                          </div>

                          {(
                            language === "rust" ? TOPICS_RUST :
                              language === "python" ? TOPICS_PYTHON :
                                language === "dsa" ? TOPICS_DSA :
                                  language === "html" ? TOPICS_HTML :
                                    language === "css" ? TOPICS_CSS :
                                      language === "ml" ? TOPICS_ML :
                                        TOPICS_JS
                          ).map((group) => (
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
                                      onClick={() => handleSelectTopic(topic, group.title)}
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
                              <Book size={16} /> Official Docs
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
                          <div className="sidebar-content" style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

                            <div className="sidebar-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: "8px" }}><MessageSquare size={12} /> Recent Activity</div>
                            {chats.length === 0 ? (
                              <div className="empty-history">No history yet</div>
                            ) : (
                              <>
                                {chats.slice(0, visibleChats).map((chat) => (
                                  <div key={chat.id} className={`history-item ${currentChatId === chat.id ? "active" : ""}`} onClick={() => handleSelectChat(chat)}>
                                    <MessageSquare size={14} />
                                    <span className="history-title">{chat.title}</span>
                                    <button className="delete-btn" onClick={(e) => handleDeleteChat(e, chat.id)}>
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                ))}
                                {visibleChats < chats.length && (
                                  <button
                                    className="btn btn-secondary"
                                    style={{ width: "100%", justifyContent: "center", marginTop: "8px", fontSize: "0.8rem", padding: "6px", border: "1px solid var(--border-color)" }}
                                    onClick={() => setVisibleChats(prev => prev + 20)}
                                  >
                                    Load More
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div style={{ display: viewMode === "ai" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    {aiService === "api" ? (
                      <>
                        <div className="description-container" ref={mainChatScrollRef}>
                          <ReactMarkdown
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm]}
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
                          <h3 style={{ marginBottom: 8, color: "var(--text-main)" }}>Open Web LLM</h3>
                          <p style={{ color: "var(--text-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                            Select your preferred web LLM to chat, analyze images, and more. We'll copy your code to the clipboard for you.
                          </p>
                          <select
                            className="settings-input"
                            style={{ appearance: 'auto', WebkitAppearance: 'auto' as any, marginBottom: 24, padding: "8px 12px", width: "100%", backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)", borderRadius: 4 }}
                            value={webLlm}
                            onChange={(e) => setWebLlm(e.target.value)}
                          >
                            <option value="groq">Groq</option>
                            <option value="huggingface">Hugging Face</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                          </select>
                          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={handleOpenWebLlm}>
                            <Copy size={16} /> Copy Code & Open {webLlm === "openai" ? "ChatGPT" : webLlm === "anthropic" ? "Claude" : webLlm === "groq" ? "Groq" : webLlm === "huggingface" ? "Hugging Face" : "Gemini"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: viewMode === "docs" ? "flex" : "none", flex: 1, flexDirection: "column" }}>
                    {(language === "rust" || language === "python" || language === "ml") ? (
                      <iframe
                        src={language === "rust" ? "https://doc.rust-lang.org/book/" : language === "ml" ? "https://scikit-learn.org/stable/user_guide.html" : "https://docs.python.org/3/"}
                        title="Documentation"
                        style={{ flex: 1, border: "none", width: "100%", height: "100%", backgroundColor: "var(--bg-color)" }}
                      />
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
                          height: "100%"
                        }}
                      >
                        <div style={{ background: "var(--bg-color)", padding: 32, borderRadius: 16, border: "1px solid var(--border-color)", maxWidth: 400 }}>
                          <Book size={48} color="var(--accent-color)" style={{ marginBottom: 16 }} />
                          <h3 style={{ marginBottom: 8, color: "var(--text-main)" }}>Official Documentation</h3>
                          <p style={{ color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                            MDN documentation cannot be embedded directly. Please open it in your browser.
                          </p>
                          <button
                            className="btn btn-primary"
                            style={{ width: "100%", justifyContent: "center" }}
                            onClick={async () => {
                              const url =
                                language === "html" ? "https://developer.mozilla.org/en-US/docs/Web/HTML" :
                                  language === "css" ? "https://developer.mozilla.org/en-US/docs/Web/CSS" :
                                    "https://developer.mozilla.org/en-US/docs/Web/JavaScript";
                              try {
                                await openUrl(url);
                              } catch (e) {
                                window.open(url, "_blank");
                              }
                            }}
                          >
                            <Globe size={16} style={{ marginRight: 8 }} /> Open {language.toUpperCase()} Docs
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: viewMode === "shortcuts" ? "flex" : "none", flex: 1, flexDirection: "column", overflow: "hidden" }}>
                    <Shortcuts />
                  </div>

                  <div style={{ display: viewMode === "learning" ? "flex" : "none", flex: 1, flexDirection: "column", overflow: "hidden" }}>
                    <AiLearning
                      ref={learningRef}
                      language={language}
                      apiKey={llmProvider === "openai" ? openAiApiKey : llmProvider === "anthropic" ? anthropicApiKey : llmProvider === "groq" ? groqApiKey : llmProvider === "huggingface" ? huggingFaceApiKey : apiKey}
                      provider={llmProvider}
                      selectedModel={selectedModel}
                      topic={selectedTopic}
                      groupTitle={selectedGroup}
                      onBack={() => setIsHistoryOpen(true)}
                      onApplyCode={setCode}
                    />
                  </div>



                  {/* Shared AI Controls */}
                  {((viewMode === "ai" && aiService === "api") || viewMode === "learning") && (
                    <div className="ai-controls" style={{ borderTop: "1px solid var(--border-color)", background: "var(--panel-bg)", zIndex: 10, padding: "12px" }}>
                      <textarea
                        className="ai-input"
                        placeholder={viewMode === "learning" && selectedTopic ? `Ask about ${selectedTopic.title}...` : "Ask a question about this code..."}
                        value={input}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
                            e.preventDefault();
                            handleSend();
                            e.currentTarget.style.height = 'auto';
                          }
                        }}
                        rows={1}
                        style={{ resize: "none", minHeight: "40px", maxHeight: "200px", boxSizing: "border-box", overflowY: "auto", fontFamily: "inherit", overflowX: "hidden" }}
                      />
                      <button className="btn btn-primary" onClick={handleSend}>
                        <Send size={18} />
                      </button>
                    </div>
                  )}

                  {/* Removed duplicate Floating Quick Chat Modal here */}
                </div>
              </Panel >
              <PanelResizeHandle className="resizer horizontal" />
            </>
          )}

          {isEditorVisible && (
            <Panel defaultSize={50} minSize={30}>
              <PanelGroup orientation={terminalLayout}>
                <Panel defaultSize={70} minSize={20}>
                  <div className="panel">
                    <div className="panel-header">
                      <select
                        value={language}
                        onChange={(e) => {
                          const newLang = e.target.value as any;
                          setLanguage(newLang);
                          localStorage.setItem("language", newLang);
                          setIsSettingsOpen(false);

                          // Load saved code for new language or default
                          const savedCode = localStorage.getItem(`code_${newLang}`);
                          const newCode = savedCode || getDefaultCode(newLang);
                          setCode(newCode);

                          // Load saved topic for new language or default
                          const savedTopicParams = localStorage.getItem(`topic_${newLang}`);
                          const savedTopic = savedTopicParams ? JSON.parse(savedTopicParams) : null;
                          setSelectedTopic(savedTopic);

                          // Trigger Preview Update if needed (done by useEffect)
                          if (newLang === "html") {
                            setWebPreviewContent(newCode);
                          } else if (newLang === "css") {
                            const hasHtmlStructure = /<html|<body|<head/i.test(newCode);

                            if (hasHtmlStructure) {
                              let contentToRender = newCode;
                              const htmlMatch = newCode.match(/([\s\S]*<\/(?:html|body)>)([\s\S]*)/i);

                              if (htmlMatch) {
                                const htmlPart = htmlMatch[1];
                                const cssPart = htmlMatch[2].trim();
                                if (cssPart.length > 0) {
                                  const headEndIndex = htmlPart.toLowerCase().indexOf('</head>');
                                  if (headEndIndex !== -1) {
                                    contentToRender = htmlPart.substring(0, headEndIndex) + `\n<style>\n${cssPart}\n</style>\n` + htmlPart.substring(headEndIndex);
                                  } else {
                                    contentToRender = htmlPart + `\n<style>\n${cssPart}\n</style>`;
                                  }
                                }
                              }
                              setWebPreviewContent(contentToRender);
                            } else {
                              setWebPreviewContent(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <style>${newCode}</style>
                                </head>
                                <body>
                                  <div class="preview-container">
                                    <header class="preview-header">
                                      <h1>Web Component Preview</h1>
                                      <p>Edit the CSS on the left to style these elements dynamically.</p>
                                    </header>

                                    <div class="grid-layout">
                                      <main class="main-card">
                                        <h2>Main Content Area</h2>
                                        <p>This is a primary card component demonstrating standard text typography and spacing.</p>
                                        
                                        <div class="form-group">
                                          <label for="example-input">Email Address</label>
                                          <input type="email" id="example-input" placeholder="Enter your email" />
                                        </div>
                                        
                                        <div class="button-group">
                                          <button class="btn btn-primary">Primary Action</button>
                                          <button class="btn btn-secondary">Secondary Action</button>
                                        </div>
                                      </main>

                                      <aside class="sidebar-card">
                                        <h3>Quick Links</h3>
                                        <ul class="nav-list">
                                          <li><a href="#" class="nav-link active">Dashboard</a></li>
                                          <li><a href="#" class="nav-link">Settings</a></li>
                                          <li><a href="#" class="nav-link">Profile</a></li>
                                          <li><a href="#" class="nav-link">Messages</a></li>
                                        </ul>
                                      </aside>
                                    </div>

                                    <section class="features-section">
                                      <div class="feature-badge">New Feature</div>
                                      <h3>Interactive Elements</h3>
                                      <p>Hover over the elements or focus the input to test your pseudo-class styling.</p>
                                      
                                      <div class="toggle-switch">
                                        <input type="checkbox" id="toggle" />
                                        <label for="toggle">Enable notifications</label>
                                      </div>
                                    </section>
                                  </div>
                                </body>
                              </html>
                            `);
                            }
                          }

                          // Auto-open preview for HTML/CSS
                          if (newLang === "html" || newLang === "css") {
                            setIsTerminalVisible(true);
                          }
                        }}
                        className="language-select"
                        style={{
                          background: "transparent",
                          color: "var(--text-main)",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          outline: "none",
                          fontWeight: "600",
                          fontSize: "0.85rem",
                          marginTop: -2
                        }}
                      >
                        <option value="python">🐍 Python</option>
                        <option value="rust">🦀 Rust</option>
                        <option value="dsa">📊 DSA</option>
                        <option value="html">🌐 HTML</option>
                        <option value="css">🎨 CSS</option>
                        <option value="javascript">⚡ JavaScript</option>
                        <option value="ml">🤖 Machine Learning</option>
                      </select>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          className="tab-btn"
                          onClick={() => setIsSettingsOpen(true)}
                          style={{ border: "none", color: "var(--text-muted)", padding: "4px 8px" }}
                          title="Settings (F1)"
                        >
                          <Settings size={16} />
                        </button>
                        <button
                          className={`tab-btn ${!isAiAssistantVisible ? "active" : ""}`}
                          title={isAiAssistantVisible ? "Hide AI Assistant (Ctrl+Alt+B)" : "Show AI Assistant (Ctrl+Alt+B)"}
                          onClick={() => setIsAiAssistantVisible(!isAiAssistantVisible)}
                          style={{ padding: "4px 8px" }}
                        >
                          {isAiAssistantVisible ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
                        </button>
                        <button
                          className={`tab-btn ${isMinimapVisible ? "active" : ""}`}
                          title={isMinimapVisible ? "Hide Minimap" : "Show Minimap"}
                          onClick={() => setIsMinimapVisible(!isMinimapVisible)}
                          style={{ padding: "4px 8px" }}
                        >
                          <Layout size={14} />
                        </button>
                        <button
                          className={`tab-btn`}
                          title={terminalLayout === "vertical" ? "Move Terminal to Right (F7)" : "Move Terminal to Bottom (F7)"}
                          onClick={() => setTerminalLayout(prev => prev === "vertical" ? "horizontal" : "vertical")}
                          style={{ padding: "4px 8px" }}
                        >
                          {terminalLayout === "vertical" ? <PanelRight size={14} /> : <PanelBottom size={14} />}
                        </button>
                        <button
                          className={`tab-btn ${isTerminalVisible ? "active" : ""}`}
                          title={language === "html" || language === "css" ? "Toggle Preview (Ctrl+`)" : (isTerminalVisible ? "Hide Terminal (Ctrl+`)" : "Show Terminal (Ctrl+`)")}
                          onClick={() => setIsTerminalVisible(!isTerminalVisible)}
                          style={{ padding: "4px 8px" }}
                        >
                          {language === "html" || language === "css" ? <Eye size={14} /> : <TerminalIcon size={14} />}
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleExplain}
                          title="Explain Code (Ctrl+Alt+C)"
                          disabled={isExplaining || aiService === "web"}
                          style={{
                            marginRight: 8,
                            padding: "4px 12px",
                            fontSize: "0.8rem",
                            opacity: aiService === "web" ? 0.5 : 1,
                            cursor: aiService === "web" ? "not-allowed" : "pointer"
                          }}
                        >
                          {isExplaining ? <Sparkles size={14} className="animate-pulse" /> : <Code2 size={14} />}
                          <span style={{ marginLeft: 6 }}>{isExplaining ? "Thinking..." : "Explain Code"}</span>
                        </button>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={handleRunCode}
                          title="Run Code (F5 / Ctrl+Enter)"
                          style={{
                            padding: "4px 12px",
                            fontSize: "0.8rem",
                            backgroundColor: isRunning ? "#ef4444" : "var(--accent-color)", // Red when running
                            transition: "background-color 0.2s"
                          }}
                        >
                          {isRunning ? (
                            <><Square size={12} fill="currentColor" style={{ marginRight: 6 }} /> Stop</>
                          ) : (language === "html" || language === "css") ? (
                            <><Globe size={12} style={{ marginRight: 6 }} /> Preview</>
                          ) : (
                            "Run Code"
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="editor-container" style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
                      {isSettingsOpen ? (
                        <SettingsModal
                          isOpen={isSettingsOpen}
                          onClose={() => setIsSettingsOpen(false)}
                          llmProvider={llmProvider}
                          setLlmProvider={setLlmProvider}
                          apiKey={apiKey}
                          setApiKey={setApiKey}
                          openAiApiKey={openAiApiKey}
                          setOpenAiApiKey={setOpenAiApiKey}
                          anthropicApiKey={anthropicApiKey}
                          setAnthropicApiKey={setAnthropicApiKey}
                          groqApiKey={groqApiKey}
                          setGroqApiKey={setGroqApiKey}
                          huggingFaceApiKey={huggingFaceApiKey}
                          setHuggingFaceApiKey={setHuggingFaceApiKey}
                          theme={theme}
                          setTheme={setTheme}
                          onViewShortcuts={() => { setIsSettingsOpen(false); setViewMode("shortcuts"); }}
                          selectedModel={selectedModel}
                          availableModels={availableModels}
                          setSelectedModel={setSelectedModel}
                          activeModel={activeModel}
                        />
                      ) : (
                        <Editor
                          height="100%"
                          language={language === "ml" || language === "dsa" ? "python" : language}
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
                      )}
                    </div>
                  </div>
                </Panel>

                {isTerminalVisible && (
                  <>
                    <PanelResizeHandle className={`resizer ${terminalLayout}`} />
                    <Panel defaultSize={30} minSize={15}>
                      <div className="panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                        {(language === "html" || language === "css") ? (
                          <>
                            <div className="panel-header" style={{ justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", padding: "8px 16px", background: "var(--panel-bg)" }}>
                              <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--text-main)" }}>WEB PREVIEW</span>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                {language === "html" ? "index.html" : "style.css (Wrapped)"}
                              </div>
                            </div>
                            <iframe
                              srcDoc={webPreviewContent}
                              title="Web Preview"
                              style={{ flex: 1, border: "none", background: "white", width: "100%" }}
                              sandbox="allow-scripts"
                            />
                          </>
                        ) : (
                          <Terminal output={terminalOutput} isRunning={isRunning} onClear={() => setTerminalOutput("")} />
                        )}
                      </div>
                    </Panel>
                  </>
                )}
              </PanelGroup>
            </Panel>
          )}
        </PanelGroup >

        {/* Floating Quick Chat Modal - Moved to root of main-content to allow dragging anywhere */}
        {isQuickChatOpen && (
          <Rnd
            size={{ width: quickChatGeometry.width, height: quickChatGeometry.height }}
            position={{ x: quickChatGeometry.x, y: quickChatGeometry.y }}
            onDragStop={(_e, d) => {
              setQuickChatGeometry((prev: any) => ({ ...prev, x: d.x, y: d.y }));
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
              setQuickChatGeometry({
                width: parseInt(ref.style.width, 10),
                height: parseInt(ref.style.height, 10),
                ...position
              });
            }}
            minWidth={300}
            minHeight={300}
            bounds="parent"
            dragHandleClassName="quick-chat-drag-handle"
            style={{
              zIndex: 1000,
              position: 'fixed'
            }}
          >
            <div style={{
              width: "100%",
              height: "100%",
              background: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden"
            }}>
              <div className="quick-chat-drag-handle" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid var(--border-color)", background: "var(--panel-bg)", cursor: "move" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--accent-color)", fontWeight: "bold" }}>
                  <Zap size={16} fill="currentColor" /> Quick Chat
                </div>
                <div style={{ display: "flex", gap: "8px" }} onPointerDown={(e) => e.stopPropagation()}>
                  <button onClick={() => {
                    setCurrentQuickChatId(null);
                    setQuickChatDescription(INITIAL_QUICK_CHAT_DESCRIPTION);
                  }} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                    <Plus size={14} /> New
                  </button>
                  <button onClick={() => setIsQuickChatOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="description-container" style={{ flex: 1, padding: "16px", overflowY: "auto" }} onPointerDown={(e) => e.stopPropagation()} ref={quickChatScrollRef}>
                <ReactMarkdown
                  components={quickChatMarkdownComponents}
                  remarkPlugins={[remarkGfm]}
                >
                  {quickChatDescription}
                </ReactMarkdown>
              </div>
              <div className="ai-controls" style={{ borderTop: "1px solid var(--border-color)", background: "var(--panel-bg)", padding: "12px" }} onPointerDown={(e) => e.stopPropagation()}>
                <textarea
                  className="ai-input"
                  placeholder="Ask a quick question..."
                  value={quickChatInput}
                  onChange={(e) => {
                    setQuickChatInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !isQuickChatExplaining) {
                      e.preventDefault();
                      handleSendQuickChat();
                      e.currentTarget.style.height = 'auto';
                    }
                  }}
                  disabled={isQuickChatExplaining}
                  rows={1}
                  style={{ resize: "none", minHeight: "40px", maxHeight: "200px", boxSizing: "border-box", overflowY: "auto", fontFamily: "inherit", overflowX: "hidden" }}
                />
                <button className="btn btn-primary" onClick={handleSendQuickChat} disabled={isQuickChatExplaining}>
                  {isQuickChatExplaining ? <Zap size={18} className="animate-pulse" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </Rnd>
        )}

      </main >
    </div >
  );
}

export default App;
