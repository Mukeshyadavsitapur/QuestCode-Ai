import { useState, useEffect, useRef, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { openUrl } from "@tauri-apps/plugin-opener";
import { speak, stop, isSpeaking, isInitialized } from "tauri-plugin-tts-api";
import {
  Panel,
  Group as PanelGroup,
  Separator as PanelResizeHandle
} from "react-resizable-panels";
import Editor, { loader } from "@monaco-editor/react";
import { Notebook } from "./Notebook";
import { Rnd } from "react-rnd";
import {
  Send, Sparkles, Settings, Book, MessageSquare, Copy, Globe, Bot, Terminal as TerminalIcon, Layout, Menu, Plus,
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
  PanelLeftClose,
  Trash2, RefreshCw, VolumeX, Volume2,
  Cloud, Server, ExternalLink
} from "lucide-react";
import { ChatBubble } from "./ChatBubble";
import { SettingsModal } from "./SettingsModal";
import { Shortcuts } from "./Shortcuts";
import { themes } from "./themes";
import { Terminal } from "./Terminal"; // Import Terminal
import { AiLearning, AiLearningHandle } from "./AiLearning";
import { TOPICS_RUST, TOPICS_PYTHON, TOPICS_DSA, TOPICS_HTML, TOPICS_CSS, TOPICS_JS, TOPICS_ML, Topic } from "./learningData";
import Quiz from "./Quiz";
import "./App.css";
import {
  DEFAULT_RUST_CODE, DEFAULT_PYTHON_CODE, DEFAULT_HTML_CODE, DEFAULT_CSS_CODE, DEFAULT_JS_CODE,
  DEFAULT_ML_NOTES_CODE,
} from "./defaultCode";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-markup";
import { usePython } from "./usePython";


import { Message, SmartContent, generateAIResponseStream } from "./aiUtils";

interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  messages: Message[];
  description?: string; // Optional for backward compatibility with older chats
}



const INITIAL_DESCRIPTION = "# Getting Started\n\nWelcome! Type some code on the left and click **'Explain Code'** to get an AI-powered breakdown of what's happening.\n\nYou can also ask specific questions using the chat bar below.";
const INITIAL_MESSAGES: Message[] = [
  { role: 'system', content: INITIAL_DESCRIPTION }
];
// NOTE: Do NOT use a module-level constant for Tauri detection.
// Tauri injects __TAURI_INTERNALS__ asynchronously after module load.
// Always check at call time using: !!(window as any).__TAURI_INTERNALS__

function App() {
  // Helper to get default code for a language
  const getDefaultCode = (lang: string) => {
    if (lang === "rust") return DEFAULT_RUST_CODE;
    if (lang === "python") return DEFAULT_PYTHON_CODE;
    if (lang === "html") return DEFAULT_HTML_CODE;
    if (lang === "css") return DEFAULT_CSS_CODE;
    if (lang === "javascript") return DEFAULT_JS_CODE;
    if (lang === "ml") return DEFAULT_ML_NOTES_CODE;
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
  
  const isJupyterMode = language === "ml";
  
  // Jupyter Notebook State
  const [jupyterMode, setJupyterMode] = useState<"lite" | "local">(() => {
    return (localStorage.getItem("jupyter_mode") as "lite" | "local") || "lite";
  });
  const [jupyterLocalUrl, setJupyterLocalUrl] = useState(() => {
    return localStorage.getItem("jupyter_local_url") || "http://localhost:8888";
  });
  const [jupyterRefreshKey, setJupyterRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem("jupyter_mode", jupyterMode);
  }, [jupyterMode]);

  useEffect(() => {
    localStorage.setItem("jupyter_local_url", jupyterLocalUrl);
  }, [jupyterLocalUrl]);

  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  // PromptTest Chat Features State
  const [isDictionaryActive, setIsDictionaryActive] = useState(true);
  const [dictionaryPopup, setDictionaryPopup] = useState<{
    word: string;
    definition: string;
    x: number;
    y: number;
    isLoading: boolean;
  } | null>(null);
  const [isDictionarySpeaking, setIsDictionarySpeaking] = useState(false);
  const [speakingMsgIdx, setSpeakingMsgIdx] = useState<{ idx: number, isQuickChat: boolean } | null>(null);
  const [isQuizGenerating, setIsQuizGenerating] = useState(false);
  const [activeQuizQuestions, setActiveQuizQuestions] = useState<any[] | null>(null);
  const ttsGeneration = useRef(0);
  const [input, setInput] = useState("");
  const [temperature, setTemperature] = useState<number>(0.3);
  const [isExplaining, setIsExplaining] = useState(false);
  const [webLlmCopied, setWebLlmCopied] = useState(false);
  const { isPyodideLoading, runPython, stopPython, error: pyodideError } = usePython();

  // AI Chat History State
  const [chats, setChats] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem("ai_chats");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(() => {
    return localStorage.getItem("current_chat_id");
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWideLayout, setIsWideLayout] = useState(window.innerWidth > 1200);

  // Responsive Sidebar Listener
  useEffect(() => {
    const handleResize = () => {
      const wide = window.innerWidth > 1200;
      setIsWideLayout(wide);
      if (wide) {
        setIsHistoryOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [visibleChats, setVisibleChats] = useState(20);
  const [isAiAssistantVisible, setIsAiAssistantVisible] = useState(true);

  const [currentQuickChatId, setCurrentQuickChatId] = useState<string | null>(() => {
    return localStorage.getItem("current_quick_chat_id");
  });
  const [isQuickChatOpen, setIsQuickChatOpen] = useState(false);
  const [quickChatInput, setQuickChatInput] = useState("");
  const INITIAL_QUICK_CHAT_DESCRIPTION = "## Quick Chat\n\nAsk me anything! Let me help you while you read the documentation.";
  const [quickChatMessages, setQuickChatMessages] = useState<Message[]>(() => {
    const savedId = localStorage.getItem("current_quick_chat_id");
    if (savedId) {
      const savedChats = localStorage.getItem("ai_quick_chats");
      if (savedChats) {
        const parsedChats: ChatSession[] = JSON.parse(savedChats);
        const currentChat = parsedChats.find(c => c.id === savedId);
        if (currentChat) return currentChat.messages;
      }
    }
    return [{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }];
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
      x: typeof window !== 'undefined' ? Math.max(0, (window.innerWidth / 2) - 200) : 50,
      y: typeof window !== 'undefined' ? Math.max(0, (window.innerHeight / 2) - 250) : 50,
      width: typeof window !== 'undefined' ? Math.min(400, window.innerWidth - 40) : 400,
      height: typeof window !== 'undefined' ? Math.min(500, window.innerHeight - 100) : 500
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
  }, [messages, quickChatMessages, viewMode, isQuickChatOpen]);

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
    // Wait for a tiny bit for render to finish
    setTimeout(() => {
      if (ref.current) {
        const containers = ref.current.querySelectorAll('.chat-bubble-container');
        if (containers.length > 0) {
          const lastContainer = containers[containers.length - 1] as HTMLElement;
          if (lastContainer.classList.contains('ai')) {
            ref.current.scrollTop = lastContainer.offsetTop - 16;
          } else {
            ref.current.scrollTop = ref.current.scrollHeight;
          }
        } else {
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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);

  useEffect(() => {
    const handleMobileResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleMobileResize);
    return () => window.removeEventListener("resize", handleMobileResize);
  }, []);

  // Editor State — on mobile, start with only AI assistant visible
  const [isEditorVisible, setIsEditorVisible] = useState(() => window.innerWidth > 768);

  // Terminal State
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isTerminalVisible, setIsTerminalVisible] = useState(true);
  const [terminalLayout, setTerminalLayout] = useState<"vertical" | "horizontal">(() => {
    return (localStorage.getItem("terminalLayout") as "vertical" | "horizontal") || "vertical";
  });
  const [webPreviewContent, setWebPreviewContent] = useState("");

  useEffect(() => {
    localStorage.setItem("terminalLayout", terminalLayout);
  }, [terminalLayout]);

  // Force vertical layout on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && terminalLayout === "horizontal") {
        setTerminalLayout("vertical");
      }
    };
    handleResize(); // Check on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const getCurrentApiKey = () => {
    switch (llmProvider) {
      case 'openai': return openAiApiKey;
      case 'anthropic': return anthropicApiKey;
      case 'groq': return groqApiKey;
      case 'huggingface': return huggingFaceApiKey;
      default: return apiKey;
    }
  };

  const [activeModel, setActiveModel] = useState<string>("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Advanced feature states
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    return localStorage.getItem("selected_model") || "gpt-3.5-turbo";
  });
  const [isMinimapVisible, setIsMinimapVisible] = useState(false);

  useEffect(() => {
    localStorage.setItem("llmProvider", llmProvider);
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("openAiApiKey", openAiApiKey);
    localStorage.setItem("anthropicApiKey", anthropicApiKey);
    localStorage.setItem("groqApiKey", groqApiKey);
    localStorage.setItem("huggingFaceApiKey", huggingFaceApiKey);
    if (llmProvider === "gemini") {
      if (apiKey) {
        if (!!!(window as any).__TAURI_INTERNALS__) {
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
        "Qwen/Qwen2.5-Coder-7B-7B-Instruct",
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
    root.style.setProperty("--code-bg", selectedTheme.codeBg);
    root.style.setProperty("--code-header-bg", selectedTheme.codeHeaderBg);

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
        // 'day' and 'e-reader' are our light themes
        const isLight = ["day", "e-reader"].includes(t.id);
        const base = isLight ? "vs" : "vs-dark";

        // High contrast syntax highlighting for perfect readability
        const rules = isLight
          ? [
            { token: "", foreground: t.text.replace("#", "") }, // Default text color
            { token: "comment", foreground: "666666" },
            { token: "keyword", foreground: "0033b3", fontStyle: "bold" },
            { token: "string", foreground: "067d17" },
            { token: "number", foreground: "1750eb" },
            { token: "regexp", foreground: "264eff" },
            { token: "type", foreground: "000000", fontStyle: "bold" },
            { token: "class", foreground: "000000", fontStyle: "bold" },
            { token: "function", foreground: "00627a" },
            { token: "variable", foreground: "000000" },
            { token: "operator", foreground: "000000" },
            { token: "tag", foreground: "0033b3" },
            { token: "attribute.name", foreground: "000000" },
            { token: "attribute.value", foreground: "067d17" },
          ]
          : [
            { token: "", foreground: t.text.replace("#", "") }, // Default text color
            { token: "comment", foreground: "8b949e" },
            { token: "keyword", foreground: "ff7b72", fontStyle: "bold" },
            { token: "string", foreground: "a5d6ff" },
            { token: "number", foreground: "79c0ff" },
            { token: "regexp", foreground: "a5d6ff" },
            { token: "type", foreground: "ff7b72" },
            { token: "class", foreground: "d2a8ff" },
            { token: "function", foreground: "d2a8ff" },
            { token: "variable", foreground: "c9d1d9" },
            { token: "operator", foreground: "c9d1d9" },
            { token: "tag", foreground: "7ee787" },
            { token: "attribute.name", foreground: "79c0ff" },
            { token: "attribute.value", foreground: "a5d6ff" },
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
      if (isWideLayout) return; // Don't close on click outside in wide layout
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
    // If we only have messages, we just grab first 40 chars of the text
    const cleanSource = text.replace(/<[^>]+>/g, '').trim();
    return cleanSource.substring(0, 40) || "New Chat";
  };

  const updateChatHistory = (msgs: Message[], forcedTitle?: string) => {
    if (currentChatId) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === currentChatId
            ? {
              ...chat,
              messages: msgs,
            }
            : chat
        )
      );
    } else {
      const newId = Date.now().toString();
      const firstUserMsg = msgs.find(m => m.role === 'user');
      const newTitle = forcedTitle || (firstUserMsg ? extractTitle(firstUserMsg.content) : "New Chat");
      const newChat: ChatSession = {
        id: newId,
        title: newTitle,
        messages: msgs,
        timestamp: new Date().toISOString(),
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
    setMessages(INITIAL_MESSAGES);
    if (!isWideLayout) setIsHistoryOpen(false);
    setViewMode("ai");
  };





  const handleSelectChat = (chat: ChatSession) => {
    setCurrentChatId(chat.id);
    setMessages(chat.messages || [{ role: 'system', content: chat.description || '' }]);
    if (!isWideLayout) setIsHistoryOpen(false);
    setViewMode("ai");
  };

  const sendQuickChatMessage = async (userQuestion: string, contextMessages: Message[]) => {
    const newUserMsg: Message = { role: 'user', content: userQuestion };
    const newThinkingMsg: Message = { role: 'ai', content: '*Thinking...*' };
    const updatedMessages = [...contextMessages, newUserMsg, newThinkingMsg];

    setQuickChatMessages(updatedMessages);
    scrollToLatestMessage(quickChatScrollRef);

    // On mobile/browser, we can still use the AI if API keys are provided
    if (!!!(window as any).__TAURI_INTERNALS__) {
      console.log("Browser Mode: AI Chat is available if API keys are configured.");
    }

    setIsQuickChatExplaining(true);
    try {
      const stream = generateAIResponseStream(userQuestion, contextMessages.filter(m => m.role !== 'system'), {
        provider: llmProvider,
        model: selectedModel,
        apiKey,
        openAiApiKey,
        anthropicApiKey,
        groqApiKey,
        huggingFaceApiKey,
        temperature
      });

      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setQuickChatMessages(prev => {
          const newArr = [...prev];
          if (newArr.length > 0) {
            newArr[newArr.length - 1] = { role: 'ai', content: fullContent };
          }
          return newArr;
        });
        scrollToLatestMessage(quickChatScrollRef);
      }

      const finalMessages = [...updatedMessages];
      finalMessages[finalMessages.length - 1] = { role: 'ai', content: fullContent };

      // Save to main unified chat history directly
      if (currentQuickChatId) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentQuickChatId
              ? {
                ...chat,
                messages: finalMessages,
              }
              : chat
          )
        );
      } else {
        const newId = Date.now().toString();
        const newChat: ChatSession = {
          id: newId,
          title: userQuestion.substring(0, 40) || "Quick Chat",
          messages: finalMessages,
          timestamp: new Date().toISOString(),
        };
        setChats((prev) => {
          const newChats = [newChat, ...prev];
          return newChats.length > 500 ? newChats.slice(0, 500) : newChats;
        });
        setCurrentQuickChatId(newId);
      }
      setActiveModel(selectedModel);
    } catch (error) {
      console.error("Failed to ask quick question:", error);
      setQuickChatMessages(prev => {
        const newArr = [...prev];
        newArr[newArr.length - 1] = { role: 'ai', content: `**Error:** ${error}` };
        return newArr;
      });
    } finally {
      setIsQuickChatExplaining(false);
    }
  };

  const handleSendQuickChat = async () => {
    if (!quickChatInput.trim() || aiService === "web") return;
    const userQuestion = quickChatInput;
    setQuickChatInput("");
    const isFirstMessage = quickChatMessages.length === 1 && quickChatMessages[0].role === 'system';
    const context = isFirstMessage ? [] : quickChatMessages;
    await sendQuickChatMessage(userQuestion, context);
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
    // On mobile: showing AI assistant hides editor
    if (isMobile) setIsEditorVisible(false);

    // On mobile/browser, we can still use the AI if API keys are provided
    if (!!!(window as any).__TAURI_INTERNALS__) {
      console.log("Browser Mode: AI features are available if API keys are configured.");
    }

    // Add Thinking Message
    const isFirstMessage = messages.length === 1 && messages[0].role === 'system';
    const newMsgs = isFirstMessage
      ? [{ role: 'user', content: 'Explain this code.' } as Message, { role: 'ai', content: '*Thinking...*' } as Message]
      : [...messages, { role: 'user', content: 'Explain this code.' } as Message, { role: 'ai', content: '*Thinking...*' } as Message];
    setMessages(newMsgs);
    scrollToLatestMessage(mainChatScrollRef);

    try {
      const stream = generateAIResponseStream(`Explain this code in detail:\n\n\`\`\`${language}\n${code}\n\`\`\``, messages.filter(m => m.role !== 'system'), {
        provider: llmProvider,
        model: selectedModel,
        apiKey,
        openAiApiKey,
        anthropicApiKey,
        groqApiKey,
        huggingFaceApiKey,
        temperature
      });

      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newArr = [...prev];
          if (newArr.length > 0) {
            newArr[newArr.length - 1] = { role: 'ai', content: fullContent };
          }
          return newArr;
        });
        scrollToLatestMessage(mainChatScrollRef);
      }

      const updatedMsgs = isFirstMessage
        ? [{ role: 'user', content: 'Explain this code.' }, { role: 'ai', content: fullContent }]
        : [...messages, { role: 'user', content: 'Explain this code.' }, { role: 'ai', content: fullContent }];

      // Create new chat session for explanation
      const newId = Date.now().toString();
      const newChat: ChatSession = {
        id: newId,
        title: "Code Explanation",
        messages: updatedMsgs as Message[],
        timestamp: new Date().toISOString(),
      };
      setChats(prev => [newChat, ...prev].slice(0, 500));
      setCurrentChatId(newId);
    } catch (error) {
      console.error("Failed to explain code:", error);
      setMessages(prev => {
        const newArr = [...prev];
        if (newArr.length > 0) {
          newArr[newArr.length - 1] = { role: 'ai', content: `## Error\n\n${error}` };
        }
        return newArr;
      });
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

    const isFirstMessage = messages.length === 1 && messages[0].role === 'system';
    const newUserMsg: Message = { role: 'user', content: userQuestion };
    const newThinkingMsg: Message = { role: 'ai', content: '*Thinking...*' };

    const updatedMessages = isFirstMessage
      ? [newUserMsg, newThinkingMsg]
      : [...messages, newUserMsg, newThinkingMsg];

    setMessages(updatedMessages);
    scrollToLatestMessage(mainChatScrollRef);

    // On mobile/browser, we can still use the AI if API keys are provided
    if (!!!(window as any).__TAURI_INTERNALS__) {
      console.log("Browser Mode: AI Chat is available if API keys are configured.");
    }

    try {
      const stream = generateAIResponseStream(userQuestion, messages.filter(m => m.role !== 'system'), {
        provider: llmProvider,
        model: selectedModel,
        apiKey,
        openAiApiKey,
        anthropicApiKey,
        groqApiKey,
        huggingFaceApiKey,
        temperature
      });

      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newArr = [...prev];
          if (newArr.length > 0) {
            newArr[newArr.length - 1] = { role: 'ai', content: fullContent };
          }
          return newArr;
        });
        scrollToLatestMessage(mainChatScrollRef);
      }

      const finalMessages = isFirstMessage
        ? [newUserMsg, { role: 'ai', content: fullContent }]
        : [...messages, newUserMsg, { role: 'ai', content: fullContent }];

      updateChatHistory(finalMessages as Message[], isFirstMessage ? userQuestion.substring(0, 40) : undefined);
      setActiveModel(selectedModel);
    } catch (error) {
      console.error("Failed to ask question:", error);
      setMessages(prev => {
        const newArr = [...prev];
        if (newArr.length > 0) {
          newArr[newArr.length - 1] = { role: 'ai', content: `**Error:** ${error}` };
        }
        return newArr;
      });
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

  const handleLanguageChange = (newLang: "rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml") => {
    setLanguage(newLang);
    localStorage.setItem("language", newLang);

    // Load saved code for new language or default
    const savedCode = localStorage.getItem(`code_${newLang}`);
    const newCode = savedCode || getDefaultCode(newLang);
    setCode(newCode);

    setIsSettingsOpen(false);

    // Load saved topic for new language or default
    const savedTopicParams = localStorage.getItem(`topic_${newLang}`);
    const savedTopic = savedTopicParams ? JSON.parse(savedTopicParams) : null;
    setSelectedTopic(savedTopic);

    // Trigger Preview Update if needed
    if (newLang === "html") {
      setWebPreviewContent(code);
    } else if (newLang === "css") {
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
                                  <style>${code}</style>
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
  };

  const handleCycleLanguage = () => {
    const languages: ("python" | "rust" | "dsa" | "html" | "css" | "javascript" | "ml")[] =
      ["python", "rust", "dsa", "html", "css", "javascript", "ml"];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    handleLanguageChange(languages[nextIndex]);
  };




  // No longer using window.speechSynthesis pre-loading logic as we are switching to native plugin
  useEffect(() => {
    // Initializing native TTS engine
    const initTts = async () => {
      try {
        console.log("TTS: Initializing native engine...");
        for (let i = 0; i < 15; i++) {
          const status = await isInitialized();
          console.log(`TTS: Initialization poll ${i + 1}: initialized=${status.initialized}, voices=${status.voiceCount}`);
          if (status.initialized && status.voiceCount > 0) {
            console.log(`TTS: Native engine ready with ${status.voiceCount} voices.`);
            break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      } catch (err) {
        console.error("TTS: Initialization error:", err);
      }
    };
    initTts();
  }, []);

  const chunkText = (text: string): string[] => {
    const sentenceRegex = /[^.!?\n]+[.!?\n]+/g;
    let sentences = text.match(sentenceRegex) || [text];

    const chunks: string[] = [];
    let currentChunk = '';

    for (const s of sentences) {
      if (currentChunk.length + s.length > 300) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = s;
      } else {
        currentChunk += " " + s;
      }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
  };

  const handleListen = async (text: string, idx: number, isQuickChat: boolean = false) => {
    ttsGeneration.current++;
    const thisGen = ttsGeneration.current;
    const isAndroidTauri = navigator.userAgent.includes("Android") && !!(window as any).__TAURI_INTERNALS__;
    console.log(`[TTS] handleListen called. idx=${idx}, thisGen=${thisGen}, isAndroidTauri=${isAndroidTauri}`);

    if (speakingMsgIdx?.idx === idx && speakingMsgIdx?.isQuickChat === isQuickChat) {
      console.log(`[TTS] Stopping active speech for idx=${idx}`);
      setSpeakingMsgIdx(null);
      if (isAndroidTauri) {
        try { await stop(); } catch (e) { console.error("[TTS] Stop failed:", e); }
      } else {
        window.speechSynthesis.cancel();
      }
      return;
    }

    try {
      // Clean up text
      const cleanText = text
        .replace(/[*#]/g, '') // Remove markdown
        .replace(/<[^>]*>?/gm, ''); // Remove tags

      console.log(`[TTS] Cleaned text snippet: "${cleanText.substring(0, 50)}"`);

      // Set state IMMEDIATELY to show the stop icon
      setSpeakingMsgIdx({ idx, isQuickChat });
      console.log(`[TTS] State set to idx=${idx}. Stopping any prior speech...`);

      // Stop any existing speech safely BEFORE starting new speech
      if (isAndroidTauri) {
        try { await stop(); } catch (e) { console.warn("[TTS] Pre-stop failed:", e); }
      } else {
        window.speechSynthesis.cancel();
      }
      console.log(`[TTS] Pre-stop done. Chunking text...`);

      const chunks = chunkText(cleanText);
      console.log(`[TTS] Speaking ${chunks.length} chunk(s)...`);

      if (isAndroidTauri) {
        // Wait for TTS engine to be ready (may not be initialized on first use)
        let initWait = 0;
        while (initWait < 6) { // Max 3 seconds (6 x 500ms)  
          try {
            const ready = await isInitialized();
            console.log(`[TTS] isInitialized=${ready} (attempt ${initWait + 1})`);
            if (ready) break;
          } catch (e) { console.warn('[TTS] isInitialized check failed:', e); }
          await new Promise(r => setTimeout(r, 500));
          initWait++;
        }

        for (let i = 0; i < chunks.length; i++) {
          // Check if we've been cancelled by a newer request
          if (ttsGeneration.current !== thisGen) {
            console.log(`[TTS] Cancelled at chunk ${i}: gen ${thisGen} vs current ${ttsGeneration.current}.`);
            return;
          }

          console.log(`[TTS] Speaking chunk ${i + 1}/${chunks.length}...`);
          try {
            await speak({
              text: chunks[i],
              queueMode: i === 0 ? 'flush' : 'add'
            } as any);
            console.log(`[TTS] Chunk ${i + 1} speak() resolved successfully.`);
          } catch (speakErr) {
            console.error(`[TTS] speak() chunk ${i + 1} THREW:`, speakErr);
            throw speakErr; // Re-throw to outer catch
          }

          // Small delay to prevent IPC throughput issues on mobile
          await new Promise(r => setTimeout(r, 100));
        }

        // Monitoring loop with GRACE PERIOD to allow Android engine to start
        console.log(`[TTS] All chunks sent. Waiting grace period...`);
        await new Promise(r => setTimeout(r, 1500));

        let pollCount = 0;
        let consecutiveFalse = 0;

        while (ttsGeneration.current === thisGen && pollCount < 600) { // Max 10 mins
          try {
            const active = await isSpeaking();
            console.log(`[TTS] Poll ${pollCount}: isSpeaking=${active}, consecutiveFalse=${consecutiveFalse}`);
            if (!active) {
              consecutiveFalse++;
              // Require 3 consecutive checks (~1.5s total gap) to confirm truly stopped
              // This accounts for gaps between chunk processing
              if (consecutiveFalse >= 3) break;
            } else {
              consecutiveFalse = 0; // Reset if speaking
            }
          } catch (e) {
            console.warn("[TTS] isSpeaking check failed:", e);
          }
          await new Promise(r => setTimeout(r, 500));
          pollCount++;
        }
      } else { // Web Speech API fallback (Browser and Desktop Tauri)
        if (!('speechSynthesis' in window)) {
          console.error("Web Speech API not supported.");
          setSpeakingMsgIdx(null);
          return;
        }

        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Google')) || voices.find(voice => voice.lang === 'en-US') || voices[0];

        for (let i = 0; i < chunks.length; i++) {
          if (ttsGeneration.current !== thisGen) {
            console.log(`[TTS] Web Speech API: Cancelled at chunk ${i}: gen ${thisGen} vs current ${ttsGeneration.current}.`);
            window.speechSynthesis.cancel();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(chunks[i]);
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          await new Promise<void>((resolve, reject) => {
            utterance.onend = () => {
              console.log(`[TTS] Web Speech API: Chunk ${i + 1} finished.`);
              resolve();
            };
            utterance.onerror = (event) => {
              console.error(`[TTS] Web Speech API: Error speaking chunk ${i + 1}:`, event);
              reject(event);
            };
            window.speechSynthesis.speak(utterance);
            console.log(`[TTS] Web Speech API: Speaking chunk ${i + 1}/${chunks.length}...`);
          });
        }
      }

      console.log(`[TTS] Polling ended. gen match: ${ttsGeneration.current === thisGen}. Resetting state.`);
      if (ttsGeneration.current === thisGen) {
        setSpeakingMsgIdx(null);
      }
    } catch (err) {
      console.error('[TTS] OUTER CATCH - TTS failed:', err);
      if (ttsGeneration.current === thisGen) {
        setSpeakingMsgIdx(null);
      }
    }
  };

  const handleListenDictionaryWord = async (word: string) => {
    ttsGeneration.current++;
    const thisGen = ttsGeneration.current;
    const isAndroidTauri = navigator.userAgent.includes("Android") && !!(window as any).__TAURI_INTERNALS__;

    if (isDictionarySpeaking) {
      setIsDictionarySpeaking(false);
      if (isAndroidTauri) {
        try { await stop(); } catch (e) { console.error("TTS Dictionary Stop failed:", e); }
      } else {
        window.speechSynthesis.cancel();
      }
      return;
    }

    try {
      setIsDictionarySpeaking(true);
      if (isAndroidTauri) {
        try { await stop(); } catch (e) { console.warn("TTS Stop failed:", e); }
      } else {
        window.speechSynthesis.cancel();
      }

      if (isAndroidTauri) {
        // NATIVE path for Android
        let initWait = 0;
        while (initWait < 6) {
          try { const ready = await isInitialized(); if (ready) break; } catch (e) { /**/ }
          await new Promise(r => setTimeout(r, 500));
          initWait++;
        }
        await speak({ text: word, queueMode: 'flush' } as any);
        await new Promise(r => setTimeout(r, 1000));
        let pollCount = 0;
        let consecutiveFalse = 0;
        while (ttsGeneration.current === thisGen && pollCount < 60) {
          try {
            const active = await isSpeaking();
            if (!active) { consecutiveFalse++; if (consecutiveFalse >= 3) break; }
            else { consecutiveFalse = 0; }
          } catch (e) { /**/ }
          await new Promise(r => setTimeout(r, 500));
          pollCount++;
        }
      } else {
        // WEB SPEECH API path for Desktop + Browser
        if (!('speechSynthesis' in window)) { setIsDictionarySpeaking(false); return; }
        await new Promise(r => setTimeout(r, 50));
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.localService) ||
          voices.find(v => v.lang.startsWith('en')) || voices[0];
        const utterance = new SpeechSynthesisUtterance(word);
        if (preferredVoice) utterance.voice = preferredVoice;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        await new Promise<void>((resolve, reject) => {
          utterance.onend = () => resolve();
          utterance.onerror = (e) => reject(e);
          window.speechSynthesis.speak(utterance);
        });
      }

      if (ttsGeneration.current === thisGen) setIsDictionarySpeaking(false);
    } catch (err) {
      console.error('TTS Dictionary failed:', err);
      if (ttsGeneration.current === thisGen) setIsDictionarySpeaking(false);
    }
  };



  const handleExplainWithContext = async (question: string, context: Message[]) => {
    if (!question.trim() || aiService === "web") return;

    setIsExplaining(true);
    const newUserMsg: Message = { role: 'user', content: question };
    const newThinkingMsg: Message = { role: 'ai', content: '*Thinking...*' };

    const updatedMessages = [...context, newUserMsg, newThinkingMsg];
    setMessages(updatedMessages);
    scrollToLatestMessage(mainChatScrollRef);

    try {
      const stream = generateAIResponseStream(question, context, {
        provider: llmProvider,
        model: selectedModel,
        apiKey,
        openAiApiKey,
        anthropicApiKey,
        groqApiKey,
        huggingFaceApiKey,
        temperature
      });

      let fullContent = "";
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => {
          const newArr = [...prev];
          if (newArr.length > 0) {
            newArr[newArr.length - 1] = { role: 'ai', content: fullContent };
          }
          return newArr;
        });
        scrollToLatestMessage(mainChatScrollRef);
      }

      updateChatHistory([...context, newUserMsg, { role: 'ai', content: fullContent }]);
      setActiveModel(selectedModel);
    } catch (error) {
      console.error("Failed to explain code:", error);
      setMessages(prev => {
        const newArr = [...prev];
        if (newArr.length > 0) {
          newArr[newArr.length - 1] = { role: 'ai', content: `Error: ${error}` };
        }
        return newArr;
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleTryAgain = (idx: number) => {
    const userMsg = messages[idx - 1];
    if (userMsg && userMsg.role === 'user') {
      const newMessages = messages.slice(0, idx - 1);
      setMessages(newMessages);
      handleExplainWithContext(userMsg.content, newMessages);
    }
  };

  const handleTryAgainQuickChat = (idx: number) => {
    const userMsg = quickChatMessages[idx - 1];
    if (userMsg && userMsg.role === 'user') {
      const contextMessages = quickChatMessages.slice(0, idx - 1);
      setQuickChatMessages(contextMessages);
      sendQuickChatMessage(userMsg.content, contextMessages);
    }
  };

  const triggerDefinitionFetch = async (word: string, x: number, y: number) => {
    setDictionaryPopup({
      word,
      definition: '',
      x,
      y,
      isLoading: true
    });

    try {
      const prompt = `Explain the word or phrase "${word}". Give a short, basic definition and one simple example sentence. Keep it very concise.`;
      const stream = generateAIResponseStream(prompt, [], {
        provider: llmProvider,
        model: selectedModel,
        apiKey: getCurrentApiKey(),
        openAiApiKey,
        anthropicApiKey,
        groqApiKey,
        huggingFaceApiKey
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setDictionaryPopup(prev => prev && prev.word === word ? {
          ...prev,
          definition: fullResponse,
          isLoading: false
        } : prev);
      }
    } catch (err) {
      setDictionaryPopup(prev => prev && prev.word === word ? {
        ...prev,
        definition: 'Failed to define word.',
        isLoading: false
      } : prev);
    }
  };

  useEffect(() => {
    if (!isDictionaryActive) {
      setDictionaryPopup(null);
      return;
    }

    const handleGlobalClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (!document.contains(target)) {
        return; // Ignore clicks on elements that have been removed from the DOM
      }

      if (target.closest('.dictionary-popup') || target.closest('button') || target.closest('.icon-btn') || target.closest('summary')) {
        return;
      }

      const isInsideMessage = target.closest('.message-bubble');
      const isInsideInput = target.closest('.input-textarea');
      if (!isInsideMessage && !isInsideInput && !target.closest('.smart-content')) {
        setDictionaryPopup(null);
        return;
      }

      let range = null;
      let textNode = null;
      let offset = 0;

      if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(e.clientX, e.clientY);
        if (range) {
          textNode = range.startContainer;
          offset = range.startOffset;
        }
      } else if ((document as any).caretPositionFromPoint) {
        const position = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
        if (position) {
          textNode = position.offsetNode;
          offset = position.offset;
        }
      }

      if (!textNode || textNode.nodeType !== Node.TEXT_NODE) return;

      const text = textNode.textContent || '';
      const isWordChar = (char: string) => /[a-zA-Z0-9\'-]/.test(char);

      if (!text[offset] || !isWordChar(text[offset])) {
        setDictionaryPopup(null);
        return;
      }

      let start = offset;
      let end = offset;
      while (start > 0 && isWordChar(text[start - 1])) start--;
      while (end < text.length && isWordChar(text[end])) end++;

      const word = text.slice(start, end).trim();
      if (!word) return;

      triggerDefinitionFetch(word, e.clientX, e.clientY);
    };

    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isDictionaryActive, llmProvider, selectedModel, apiKey, openAiApiKey, anthropicApiKey, groqApiKey, huggingFaceApiKey]);

  const handleGenerateQuiz = async (content: string) => {
    setIsQuizGenerating(true);
    try {
      const prompt = `Generate a 10-question multiple choice quiz based on this text:\n\n${content}\n\nFormat the response EXACTLY as a JSON array of objects. Each object should have 'question' (string), 'options' (array of strings), and 'correctAnswerIndex' (integer 0-3). No other text.`;
      const response: { content: string } = await invoke("ask_question", {
        req: {
          api_key: getCurrentApiKey(),
          provider: llmProvider,
          code: "",
          question: prompt,
          language: language === "dsa" ? "python" : language,
          selected_model: selectedModel
        }
      });

      const jsonStr = response.content.replace(/```json/g, "").replace(/```/g, "").trim();
      const questions = JSON.parse(jsonStr);
      // Map to include explanations if missing
      const formattedQuestions = questions.map((q: any) => ({
        ...q,
        options: q.options.map((opt: any) => typeof opt === 'string' ? { text: opt, explanation: "Based on the content provided." } : opt)
      }));
      setActiveQuizQuestions(formattedQuestions);
    } catch (error) {
      console.error("Error generating quiz:", error);
      alert("Failed to generate quiz. Check console for details.");
    } finally {
      setIsQuizGenerating(false);
    }
  };


  const handleRunCode = async () => {
    if (isRunning) {
      // If already running, treating this as a STOP request
      try {
        if (language === "python" || language === "dsa" || language === "ml") {
          stopPython();
        } else {
          await invoke("stop_execution");
        }
      } catch (error) {
        console.error("Failed to stop execution:", error);
      }
      return;
    }

    if (!isTerminalVisible) setIsTerminalVisible(true);

    if (language === "html" || language === "css" || language === "ml") {
      return;
    }

    setIsRunning(true);
    setTerminalOutput("");

    if (language === "python" || language === "dsa") {
      if (pyodideError) {
        setTerminalOutput(`Error: Python engine failed to load: ${pyodideError}\nPlease refresh to try again.\n`);
        setIsRunning(false);
        return;
      }
      
      if (isPyodideLoading) {
        setTerminalOutput("Error: Python engine is still loading... Please wait a moment and try again.\n");
        setIsRunning(false);
        return;
      }

      await runPython(
        code,
        (str) => setTerminalOutput(prev => prev + str)
      );
      setIsRunning(false);
      return;
    }

    if (language === "javascript") {
      try {
        // Native secure evaluation of JS within browser context
        let logOutput = "";
        const originalLog = console.log;
        const originalError = console.error;
        console.log = (...args) => {
          logOutput += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\\n";
        };
        console.error = (...args) => {
          logOutput += args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(" ") + "\\n";
        };

        let evalResult = undefined;
        try {
          // eslint-disable-next-line no-eval
          evalResult = eval(code);
        } catch (e: any) {
          logOutput += `\\nError: ${e.message}`;
        }

        console.log = originalLog;
        console.error = originalError;

        if (evalResult !== undefined && typeof evalResult !== 'function') {
          logOutput += `\\n=> ${typeof evalResult === 'object' ? JSON.stringify(evalResult) : String(evalResult)}`;
        }

        setTerminalOutput(logOutput);
      } catch (e: any) {
        setTerminalOutput(`Error executing JS: ${e.message}`);
      }
      setIsRunning(false);
      return;
    }

    if (!!!(window as any).__TAURI_INTERNALS__) {
      setTerminalOutput("Error: Running Rust code requires the desktop application backend.\\n\\nBrowser mode mainly supports HTML/CSS/JS/Python.\\n");
      setIsRunning(false);
      return;
    }

    try {
      // Check if we are running on mobile securely
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile && language === "rust") {
        setTerminalOutput("🎓 Rust Execution Notice:\\n\\nCompiling and running Rust code locally requires a full Rust Toolchain (rustc), which is not available on mobile phones.\\n\\nTo run your Rust code, please use the Desktop version of QuestCode-Ai! You can still use 'Explain Code' here on mobile.");
        setIsRunning(false);
        return;
      }

      const output: string = await invoke("execute_code", { code, language });
      setTerminalOutput(prev => prev + output);
    } catch (error) {
      console.error("Failed to run code:", error);
      setTerminalOutput(prev => prev + `\\nError: ${error}`);
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
  const handleExplainRef = useRef(handleExplain);
  const handleCycleLanguageRef = useRef(handleCycleLanguage);

  useEffect(() => {
    handleRunCodeRef.current = handleRunCode;
    handleExplainRef.current = handleExplain;
    handleCycleLanguageRef.current = handleCycleLanguage;
  }, [handleRunCode, handleExplain, handleCycleLanguage]);

  // Global Keyboard Shortcuts (VS Code style)
  useEffect(() => {
    const handleGlobalKeyDown = async (e: KeyboardEvent) => {
      // F11: Full Screen
      if (e.key === "F11") {
        e.preventDefault();
        if (!!(window as any).__TAURI_INTERNALS__) {
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
            setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
          }
          return !prev;
        });
      }

      // Ctrl + Alt + B: Toggle AI Assistant
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyB") {
        e.preventDefault();
        setIsAiAssistantVisible(prev => {
          const newState = !prev;
          if (!newState) setIsHistoryOpen(false); // Auto-hide sidebar when expanding editor
          return newState;
        });
      }

      // Ctrl + Alt + C: Explain Code
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.code === "KeyC") {
        e.preventDefault();
        handleExplainRef.current();
      }

      // Ctrl + Tab: Switch Language
      if ((e.ctrlKey || e.metaKey) && e.key === "Tab") {
        e.preventDefault();
        handleCycleLanguageRef.current();
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
      if (!!(window as any).__TAURI_INTERNALS__) {
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
          setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
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
          setIsAiAssistantVisible(prev => {
            const newState = !prev;
            if (!newState) setIsHistoryOpen(false); // Auto-hide sidebar when expanding editor
            return newState;
          });
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

    // Ctrl + Tab to Cycle Language
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Tab, () => {
      handleCycleLanguageRef.current();
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
    if (!isWideLayout) setIsHistoryOpen(false);
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
    p: ({ node, children, ...props }: any) => <p {...props}>{children}</p>,
    code({ className, children, ...props }: { className?: string, children?: React.ReactNode, [key: string]: any }) {
      const [copied, setCopied] = useState(false);
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
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--accent-text)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}
                title="Copy to Clipboard"
                className="code-action-btn"
              >
                <Copy size={13} /> {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => {
                  if (isJupyterMode) {
                    setAppliedCode(codeText);
                  } else {
                    setCode(codeText);
                  }
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
            background: "var(--code-bg)",
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
              color: "var(--text-main)",
              whiteSpace: "pre",
              textAlign: "left",
              display: "block"
            }}>
              {children}
            </code>
          </pre>
        </div >
      );
    }
  }), [isJupyterMode, setAppliedCode, setCode]);

  const quickChatMarkdownComponents = useMemo(() => ({
    table: ({ node, ...props }: any) => (
      <div className="table-wrapper" style={{ overflowX: "auto", margin: "1.5em 0", borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--panel-bg)" }}>
        <table {...props} style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", margin: 0, border: "none" }} />
      </div>
    ),
    th: ({ node, ...props }: any) => (
      <th {...props} style={{ borderBottom: "2px solid var(--border-color)", borderRight: "1px solid var(--border-color)", padding: "12px 16px", textAlign: "left", background: "var(--code-header-bg)", color: "var(--text-main)", fontWeight: 600, textTransform: "uppercase", fontSize: "0.8rem", letterSpacing: "0.05em", resize: "horizontal", overflow: "hidden", minWidth: "120px", position: "relative" }} />
    ),
    td: ({ node, ...props }: any) => (
      <td {...props} style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)", borderRight: "1px solid var(--border-color)", wordBreak: "break-word" }} />
    ),
    tr: ({ node, ...props }: any) => (
      <tr {...props} className="markdown-row" />
    ),
    pre: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    code({ className, children, ...props }: { className?: string, children?: React.ReactNode, [key: string]: any }) {
      const [copied, setCopied] = useState(false);
      const match = /language-(\w+)/.exec(className || "");
      let displayLang = match ? match[1] : "";
      if (displayLang === "ml" || displayLang === "dsa") displayLang = "python";
      const mappedClassName = displayLang ? `language-${displayLang}` : className;
      const isInline = !match;
      const codeText = String(children).replace(/\n$/, "");

      if (isInline) {
        return (
          <code className={className} {...props} style={{
            background: "var(--highlight)",
            color: "var(--accent-text)",
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
            background: "var(--code-header-bg)",
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
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "var(--accent-text)" : "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0, transition: "color 0.2s" }}
                title="Copy to Clipboard"
                className="code-action-btn"
              >
                <Copy size={13} /> {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() => {
                  if (isJupyterMode) {
                    setAppliedCode(codeText);
                  } else {
                    setCode(codeText);
                  }
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
            background: "var(--code-bg)",
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
              color: "var(--text-main)",
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
  }), [isJupyterMode, setAppliedCode, setCode]);

  // Compute flat topics and prev/next
  const { prevTopic, nextTopic } = useMemo(() => {
    let topics: any[] = [];
    if (language === "rust") topics = TOPICS_RUST;
    else if (language === "python") topics = TOPICS_PYTHON;
    else if (language === "dsa") topics = TOPICS_DSA;
    else if (language === "html") topics = TOPICS_HTML;
    else if (language === "css") topics = TOPICS_CSS;
    else if (language === "javascript") topics = TOPICS_JS;
    else if (language === "ml") topics = TOPICS_ML;

    const flatTopics = topics.flatMap(group => group.topics.map((t: Topic) => ({ ...t, groupTitle: group.title })));
    const currentIndex = flatTopics.findIndex((t: Topic) => t.id === selectedTopic?.id);

    return {
      prevTopic: currentIndex > 0 ? flatTopics[currentIndex - 1] : null,
      nextTopic: currentIndex !== -1 && currentIndex < flatTopics.length - 1 ? flatTopics[currentIndex + 1] : null,
    };
  }, [language, selectedTopic]);

  return (
    <>
      <div className="app-container">


        <main className="main-content">
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
                              onClick={() => {
                                handleSelectTopic(topic, group.title);
                                setAppliedCode(null);
                              }}
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
                        if (!isWideLayout) setIsHistoryOpen(false);
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
                            onClick={() => setVisibleChats(prev => prev + 10)}
                            style={{ margin: "10px", fontSize: "0.8rem" }}
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

          <PanelGroup orientation="horizontal">
            {isAiAssistantVisible && (
              <>
                <Panel defaultSize={isMobile ? 100 : 50} minSize={isMobile ? 100 : 30}>
                  <div className="panel" style={{ position: "relative" }}>
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
                      <>
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
                              <MessageSquare size={14} /> AI
                            </button>
                            <button
                              className={`tab-btn ${isQuickChatOpen ? "active" : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setIsQuickChatOpen(!isQuickChatOpen);
                                if (!isQuickChatOpen && !currentQuickChatId) {
                                  setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
                                }
                              }}
                              onTouchEnd={(e) => {
                                e.preventDefault();
                                setIsQuickChatOpen(!isQuickChatOpen);
                                if (!isQuickChatOpen && !currentQuickChatId) {
                                  setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
                                }
                              }}
                              style={{ border: "none", color: "var(--accent-color)", padding: "8px", marginLeft: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                              title="Quick Chat (Ctrl+P)"
                            >
                              <Zap size={14} fill={isQuickChatOpen ? "currentColor" : "none"} />
                            </button>
                            <button
                              className={`tab-btn ${!isEditorVisible ? "active" : ""}`}
                              onClick={() => {
                                if (isMobile) {
                                  // On mobile: this button toggles between panels
                                  setIsEditorVisible(true);
                                  setIsAiAssistantVisible(false);
                                } else {
                                  setIsEditorVisible(!isEditorVisible);
                                }
                              }}
                              style={{ border: "none", color: "var(--accent-color)", padding: "4px 8px", marginLeft: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                              title={isEditorVisible ? "Hide Editor (F4)" : "Show Editor (F4)"}
                            >
                              <PanelRight size={14} />
                            </button>

                            <button
                              className={`tab-btn ${isSettingsOpen ? "active" : ""}`}
                              onClick={() => setIsSettingsOpen(prev => !prev)}
                              style={{ border: "none", color: isSettingsOpen ? "var(--accent-color)" : "var(--text-muted)", padding: "4px 8px", marginLeft: "4px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "6px" }}
                              title="Settings (F1)"
                            >
                              <Settings size={14} />
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

                        {/* Sidebar moved to top level of main-content */}

                        <div style={{ display: viewMode === "ai" ? "flex" : "none", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                          {aiService === "api" ? (
                            <>
                              <div className="description-container" ref={mainChatScrollRef} style={{ padding: "0 12px", paddingBottom: "100px" }}>
                                {messages.map((msg, idx) => (
                                  <ChatBubble
                                    key={idx}
                                    msg={msg}
                                    idx={idx}
                                    isLast={idx === messages.length - 1}
                                    isDictionaryActive={isDictionaryActive}
                                    setIsDictionaryActive={setIsDictionaryActive}
                                    speakingMsgIdx={speakingMsgIdx}
                                    handleListen={handleListen}
                                    handleTryAgain={handleTryAgain}
                                    handleGenerateQuiz={handleGenerateQuiz}
                                    markdownComponents={markdownComponents}
                                    isExplaining={isExplaining}
                                    isQuizGenerating={isQuizGenerating}
                                  />
                                ))}
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
                                <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => {
                                  handleOpenWebLlm();
                                  setWebLlmCopied(true);
                                  setTimeout(() => setWebLlmCopied(false), 2000);
                                }}>
                                  <Copy size={16} /> {webLlmCopied ? "Code Copied!" : `Copy Code & Open ${webLlm === "openai" ? "ChatGPT" : webLlm === "anthropic" ? "Claude" : webLlm === "groq" ? "Groq" : webLlm === "huggingface" ? "Hugging Face" : "Gemini"}`}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div style={{ display: viewMode === "docs" ? "flex" : "none", flex: 1, flexDirection: "column", position: "relative" }}>
                          <div style={{
                            padding: "8px 16px",
                            borderBottom: "1px solid var(--border-color)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            background: "var(--panel-bg)"
                          }}>
                            <span style={{ fontWeight: 500, color: "var(--text-main)" }}>
                              {language.toUpperCase()} Documentation
                            </span>
                            {(!(language === "rust" || language === "python" || language === "ml" || language === "dsa") || !!(window as any).__TAURI_INTERNALS__) && (
                              <button
                                className="btn btn-secondary"
                                style={{ fontSize: "12px", padding: "4px 8px" }}
                                onClick={async () => {
                                  const url = language === "rust" ? "https://doc.rust-lang.org/book/" :
                                    language === "ml" ? "https://scikit-learn.org/stable/user_guide.html" :
                                      "https://docs.python.org/3/";
                                  try {
                                    await openUrl(url);
                                  } catch (e) {
                                    window.open(url, "_blank");
                                  }
                                }}
                              >
                                <ExternalLink size={14} style={{ marginRight: 4 }} /> Open in Browser
                              </button>
                            )}
                          </div>
                          {(language === "rust" || language === "python" || language === "ml" || language === "dsa") ? (
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
                                <p style={{ color: "var(--text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
                                  This documentation cannot be embedded directly.
                                </p>
                                <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "14px" }}>
                                  Please use the <strong>Open in Browser</strong> button in the header.
                                </p>
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
                            apiKey={apiKey}
                            openAiApiKey={openAiApiKey}
                            anthropicApiKey={anthropicApiKey}
                            groqApiKey={groqApiKey}
                            huggingFaceApiKey={huggingFaceApiKey}
                            provider={llmProvider}
                            selectedModel={selectedModel}
                            topic={selectedTopic}
                            groupTitle={selectedGroup}
                            onBack={() => setIsHistoryOpen(true)}
                            onApplyCode={(codeText) => {
                              if (isJupyterMode) {
                                setAppliedCode(codeText);
                              } else {
                                setCode(codeText);
                              }
                            }}
                            prevTopic={prevTopic}
                            nextTopic={nextTopic}
                            onSelectTopic={handleSelectTopic}
                            isDictionaryActive={isDictionaryActive}
                            setIsDictionaryActive={setIsDictionaryActive}
                            speakingMsgIdx={speakingMsgIdx}
                            handleListen={handleListen}
                            handleGenerateQuiz={handleGenerateQuiz}
                            isQuizGenerating={isQuizGenerating}
                          />
                        </div>



                        {/* Shared AI Controls */}
                        {((viewMode === "ai" && aiService === "api") || viewMode === "learning") && (
                          <div className="ai-controls" style={{ borderTop: "1px solid var(--border-color)", background: "var(--panel-bg)", zIndex: 10, padding: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <div className="ai-input-wrapper">
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
                                style={{ resize: "none", minHeight: "40px", maxHeight: "200px", boxSizing: "border-box", overflowY: "auto", fontFamily: "inherit", overflowX: "hidden", flex: 1 }}
                              />
                            </div>
                            <button className="btn btn-primary" onClick={handleSend}>
                              <Send size={18} />
                            </button>
                          </div>
                        )}

                        {/* Removed duplicate Floating Quick Chat Modal here */}
                      </>
                    )}
                  </div>
                </Panel>
                {!isMobile && <PanelResizeHandle className="resizer horizontal" />}
              </>
            )}

            {isEditorVisible && (
              <Panel defaultSize={isMobile ? 100 : 50} minSize={isMobile ? 100 : 30}>
                <PanelGroup orientation={terminalLayout}>
                  <Panel defaultSize={70} minSize={20}>
                    <div className="panel">
                      <div className="panel-header">
                        <select
                          value={language}
                          onChange={(e) => handleLanguageChange(e.target.value as any)}
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
                          <option value="javascript">📜 JavaScript</option>
                          <option value="ml">🤖 Machine Learning</option>
                        </select>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            className={`tab-btn ${!isAiAssistantVisible ? "active" : ""}`}
                            title={isAiAssistantVisible ? "Hide AI Assistant (Ctrl+Alt+B)" : "Show AI Assistant (Ctrl+Alt+B)"}
                            onClick={() => {
                              if (isMobile) {
                                // On mobile: this button toggles between panels
                                setIsAiAssistantVisible(true);
                                setIsEditorVisible(false);
                              } else {
                                setIsAiAssistantVisible(prev => {
                                  const newState = !prev;
                                  if (!newState) setIsHistoryOpen(false); // Auto-hide sidebar when expanding editor
                                  return newState;
                                });
                              }
                            }}
                            style={{ padding: "4px 8px" }}
                          >
                            {isAiAssistantVisible ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
                          </button>
                          
                          {isJupyterMode ? (
                            <>
                              <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-color)" }}>
                                <button 
                                  className={`btn btn-sm ${jupyterMode === "lite" ? "btn-primary" : "btn-secondary"}`}
                                  onClick={() => setJupyterMode("lite")}
                                  title="JupyterLite (Cloud)"
                                  style={{ padding: "4px 8px", border: "none", borderRadius: 0 }}
                                >
                                  <Cloud size={14} /><span className="mobile-hidden" style={{ marginLeft: 6 }}>Cloud</span>
                                </button>
                                <button 
                                  className={`btn btn-sm ${jupyterMode === "local" ? "btn-primary" : "btn-secondary"}`}
                                  onClick={() => setJupyterMode("local")}
                                  title="Local Server"
                                  style={{ padding: "4px 8px", border: "none", borderRadius: 0 }}
                                >
                                  <Server size={14} /><span className="mobile-hidden" style={{ marginLeft: 6 }}>Local</span>
                                </button>
                              </div>

                              {jupyterMode === "local" && !isMobile && (
                                <input 
                                  type="text" 
                                  value={jupyterLocalUrl}
                                  onChange={(e) => setJupyterLocalUrl(e.target.value)}
                                  style={{ 
                                      padding: "4px 8px", 
                                      fontSize: "0.80rem", 
                                      borderRadius: "6px", 
                                      border: "1px solid var(--border-color)", 
                                      background: "var(--input-bg)", 
                                      color: "var(--text-main)",
                                      width: "160px"
                                  }}
                                  placeholder="http://localhost:8888"
                                />
                              )}

                              <button 
                                  className="btn btn-sm btn-secondary" 
                                  onClick={() => {
                                      setJupyterRefreshKey(prev => prev + 1);
                                      setAppliedCode(null);
                                  }}
                                  style={{ padding: "4px 8px" }}
                                  title="Reload Jupyter Env"
                              >
                                  <RefreshCw size={14} />
                              </button>
                              
                              <a 
                                  href={jupyterMode === "lite" ? "https://jupyterlite.github.io/demo/lab/index.html" : jupyterLocalUrl}
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="btn btn-sm btn-secondary"
                                  style={{ padding: "4px 8px", display: "flex", alignItems: "center", textDecoration: "none" }}
                                  title="Open Externally"
                              >
                                  <span className="mobile-hidden" style={{ marginRight: 6 }}>Open Externally</span> <ExternalLink size={14} />
                              </a>
                            </>
                          ) : (
                            <>
                              <button
                                className="tab-btn"
                                onClick={handleExplain}
                                title="Explain Code (Ctrl+Alt+C)"
                                disabled={isExplaining || aiService === "web"}
                                style={{
                                  padding: "4px 8px",
                                  opacity: aiService === "web" ? 0.5 : 1,
                                  cursor: aiService === "web" ? "not-allowed" : "pointer",
                                }}
                              >
                                {isExplaining ? <Sparkles size={14} className="animate-pulse" /> : <Sparkles size={14} />}
                              </button>
                              <button
                                className={`tab-btn ${isRunning ? "active" : ""}`}
                                onClick={handleRunCode}
                                title={isRunning ? "Stop" : (language === "html" || language === "css") ? "Preview" : "Run Code (F5 / Ctrl+Enter)"}
                                style={{
                                  padding: "4px 8px",
                                  color: isRunning ? "#ef4444" : undefined,
                                }}
                              >
                                {isRunning ? (
                                  <Square size={14} fill="currentColor" />
                                ) : (language === "html" || language === "css") ? (
                                  <Globe size={14} />
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                              </button>
                              <button
                                className={`tab-btn mobile-hidden ${isMinimapVisible ? "active" : ""}`}
                                title={isMinimapVisible ? "Hide Minimap" : "Show Minimap"}
                                onClick={() => setIsMinimapVisible(!isMinimapVisible)}
                                style={{ padding: "4px 8px" }}
                              >
                                <Layout size={14} />
                              </button>
                              <button
                                className={`tab-btn mobile-hidden`}
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
                                className="tab-btn"
                                onClick={() => setCode("")}
                                title="Clear Editor"
                                style={{
                                  padding: "4px 8px",
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="editor-container" style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                        {isJupyterMode ? (
                          <Notebook
                            theme={theme}
                            mode={jupyterMode}
                            localUrl={jupyterLocalUrl}
                            refreshKey={jupyterRefreshKey}
                            appliedCode={appliedCode}
                            onClearApplied={() => setAppliedCode(null)}
                            onCellsChange={(newCellsJson) => setCode(newCellsJson)}
                          />
                        ) : (
                          <Editor
                            height="100%"
                            language={language === "dsa" ? "python" : language}
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
                    </div >
                  </Panel >

                  {isTerminalVisible && !isJupyterMode && (
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
                  )
                  }
                </PanelGroup >
              </Panel >
            )}
          </PanelGroup >

          {/* Floating Quick Chat Modal - Moved to root of main-content to allow dragging anywhere */}
          {
            isQuickChatOpen && (
              <Rnd
                size={{
                  width: typeof window !== 'undefined' ? Math.min(quickChatGeometry.width, window.innerWidth - 20) : quickChatGeometry.width,
                  height: typeof window !== 'undefined' ? Math.min(quickChatGeometry.height, window.innerHeight - 80) : quickChatGeometry.height
                }}
                position={{
                  x: typeof window !== 'undefined' ? Math.min(Math.max(0, quickChatGeometry.x), window.innerWidth - 50) : quickChatGeometry.x,
                  y: typeof window !== 'undefined' ? Math.max(0, quickChatGeometry.y) : quickChatGeometry.y
                }}
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
                        setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
                      }} onTouchEnd={(e) => {
                        e.preventDefault();
                        setCurrentQuickChatId(null);
                        setQuickChatMessages([{ role: 'system', content: INITIAL_QUICK_CHAT_DESCRIPTION }]);
                      }} className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "0.8rem" }}>
                        <Plus size={14} /> New
                      </button>
                      <button onClick={() => setIsQuickChatOpen(false)} onTouchEnd={(e) => { e.preventDefault(); setIsQuickChatOpen(false); }} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="description-container" style={{ flex: 1, padding: "0 12px", overflowY: "auto", paddingBottom: "100px" }} onPointerDown={(e) => e.stopPropagation()} ref={quickChatScrollRef}>
                    {quickChatMessages.map((msg, idx) => (
                      <ChatBubble
                        key={idx}
                        msg={msg}
                        idx={idx}
                        isLast={idx === quickChatMessages.length - 1}
                        isDictionaryActive={isDictionaryActive}
                        setIsDictionaryActive={setIsDictionaryActive}
                        speakingMsgIdx={speakingMsgIdx}
                        handleListen={handleListen}
                        handleTryAgain={handleTryAgainQuickChat}
                        handleGenerateQuiz={handleGenerateQuiz}
                        markdownComponents={quickChatMarkdownComponents}
                        isExplaining={isQuickChatExplaining}
                        isQuizGenerating={isQuizGenerating}
                        isQuickChat={true}
                      />
                    ))}
                  </div>
                  <div className="ai-controls" style={{ borderTop: "1px solid var(--border-color)", background: "var(--panel-bg)", padding: "12px", display: "flex", gap: "8px", alignItems: "center" }} onPointerDown={(e) => e.stopPropagation()}>
                    <div className="ai-input-wrapper">
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
                        style={{ resize: "none", minHeight: "40px", maxHeight: "200px", boxSizing: "border-box", overflowY: "auto", fontFamily: "inherit", overflowX: "hidden", flex: 1 }}
                      />
                    </div>
                    <button className="btn btn-primary" onClick={handleSendQuickChat} disabled={isQuickChatExplaining}>
                      {isQuickChatExplaining ? <Zap size={18} className="animate-pulse" /> : <Send size={18} />}
                    </button>
                  </div>
                </div>
              </Rnd >
            )
          }

          {/* Dictionary Floating Popup Overlay */}
          {dictionaryPopup && (
            <div
              className="dictionary-popup"
              style={{
                position: 'fixed',
                left: Math.min(dictionaryPopup.x, window.innerWidth - 300) + 'px',
                top: Math.min(dictionaryPopup.y + 20, window.innerHeight - 200) + 'px',
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem',
                width: '300px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                zIndex: 2000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--accent-color)' }}>{dictionaryPopup.word}</h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
                      handleListenDictionaryWord(dictionaryPopup.word);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.nativeEvent) (e.nativeEvent as any).stopImmediatePropagation();
                      handleListenDictionaryWord(dictionaryPopup.word);
                    }}
                    style={{ background: 'none', border: 'none', color: isDictionarySpeaking ? 'var(--accent-color)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    title={isDictionarySpeaking ? "Stop pronunciation" : "Listen pronunciation"}
                  >
                    {isDictionarySpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation();
                    setDictionaryPopup(null);
                    if (isDictionarySpeaking && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      setIsDictionarySpeaking(false);
                    }
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (e.nativeEvent) (e.nativeEvent as any).stopImmediatePropagation();
                    setDictionaryPopup(null);
                    if (isDictionarySpeaking && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                      setIsDictionarySpeaking(false);
                    }
                  }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                >
                  <X size={16} />
                </button>
              </div>
              <div style={{ padding: '0.75rem', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.5, maxHeight: '200px', overflowY: 'auto' }}>
                {dictionaryPopup.isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Loading definition...</span>
                  </div>
                ) : (
                  <SmartContent
                    content={dictionaryPopup.definition}
                    markdownComponents={markdownComponents}
                  />
                )}
              </div>
            </div>
          )}

        </main >
      </div>
      {/* Quiz Overlay */}
      {activeQuizQuestions && (
        <Quiz
          questions={activeQuizQuestions}
          onClose={() => setActiveQuizQuestions(null)}
        />
      )}
    </>
  );
}

export default App;

