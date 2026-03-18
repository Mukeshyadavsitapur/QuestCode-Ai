import { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Sparkles, Loader2, RefreshCw, BookOpen, Copy, Terminal as TerminalIcon } from "lucide-react";
import Prism from "prismjs";
import { generateAIResponseStream, Message } from "./aiUtils";
import { ChatBubble } from "./ChatBubble";
import "prismjs/themes/prism-tomorrow.css"; // Basic dark theme, can be overridden by custom CSS
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import { Topic } from "./learningData";
import { OFFLINE_LEARNING_DATA } from "./offlineLearningData";

export interface AiLearningHandle {
    askQuestion: (question: string) => Promise<void>;
}

interface AiLearningProps {
    language: "rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml";
    apiKey: string;
    openAiApiKey: string;
    anthropicApiKey: string;
    groqApiKey: string;
    huggingFaceApiKey: string;
    provider: string;
    selectedModel: string | null;
    topic: Topic | null;
    groupTitle: string | null;
    onBack: () => void;
    onApplyCode: (code: string) => void;
    prevTopic?: (Topic & { groupTitle: string }) | null;
    nextTopic?: (Topic & { groupTitle: string }) | null;
    onSelectTopic?: (topic: Topic, groupTitle: string) => void;
    isDictionaryActive?: boolean;
    setIsDictionaryActive?: (val: boolean) => void;
    speakingMsgIdx?: { idx: number, isQuickChat: boolean } | null;
    handleListen?: (text: string, idx: number) => void;
    handleGenerateQuiz?: (content: string) => void;
    isQuizGenerating?: boolean;
}

export const AiLearning = forwardRef<AiLearningHandle, AiLearningProps>(({ 
    language, apiKey, openAiApiKey, anthropicApiKey, groqApiKey, huggingFaceApiKey, provider, selectedModel, topic, groupTitle, onBack, onApplyCode, prevTopic, nextTopic, onSelectTopic,
    isDictionaryActive, setIsDictionaryActive, speakingMsgIdx, handleListen, handleGenerateQuiz, isQuizGenerating
}, ref) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const temperature = 0.3; // Default temperature - could be passed as prop in future
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToLatestMessage = () => {
        // Wait for a tiny bit for render to finish
        setTimeout(() => {
            if (scrollRef.current) {
                const bubbles = scrollRef.current.querySelectorAll('.chat-bubble-container');
                if (bubbles.length > 0) {
                    const lastBubble = bubbles[bubbles.length - 1] as HTMLElement;
                    scrollRef.current.scrollTop = lastBubble.offsetTop - 16;
                } else {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }
        }, 50);
    };

    const markdownComponents = useMemo(() => ({
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
        a: ({ node, ...props }: any) => {
            if (props.href === '#latest-question') {
                return <a {...props} style={{ visibility: 'hidden', fontSize: 0, padding: 0, margin: 0 }} />;
            }
            return <a {...props} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)', textDecoration: 'underline' }} />;
        },
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
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0 }}
                                title="Copy to Clipboard"
                                className="code-action-btn"
                            >
                                <Copy size={13} /> Copy
                            </button>
                            <button
                                onClick={() => {
                                    onApplyCode(codeText);
                                }}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--accent-text)", display: "flex", alignItems: "center", gap: "4px", fontSize: "inherit", padding: 0 }}
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
    }), []);

    const internalAskQuestion = async (question: string, currentMessages: Message[]) => {
        if (!topic) return;

        const newUserMsg: Message = { role: 'user', content: question };
        const newThinkingMsg: Message = { role: 'ai', content: '*Thinking...*' };

        const updatedMessages = [...currentMessages, newUserMsg, newThinkingMsg];
        setMessages(updatedMessages);
        scrollToLatestMessage();

        try {
            // Construct context from messages
            const contextText = currentMessages.map(m => m.role === 'user' ? `User: ${m.content}` : `AI: ${m.content}`).join("\n\n");
            const contextContent = contextText.length > 8000 ? "..." + contextText.slice(-8000) : contextText;

            const prompt = `Regarding the topic '${topic.title}' in the ${language} course.
The current context is:
${contextContent}

User Question: ${question}

Answer the user's question in the context of this topic. Be concise and helpful. Use Markdown.`;

            const stream = generateAIResponseStream(prompt, [], {
                provider: provider,
                model: selectedModel || "",
                apiKey: apiKey,
                openAiApiKey: openAiApiKey,
                anthropicApiKey: anthropicApiKey,
                groqApiKey: groqApiKey,
                huggingFaceApiKey: huggingFaceApiKey,
                temperature: temperature
            });

            let fullContent = "";
            for await (const chunk of stream) {
                fullContent += chunk;
                setMessages(prev => {
                    const newArr = [...prev];
                    newArr[newArr.length - 1] = { role: 'ai', content: fullContent };
                    return newArr;
                });
                scrollToLatestMessage();
            }

            // Update Cache
            const finalMessages = [...currentMessages, newUserMsg, { role: 'ai', content: fullContent }];
            const cacheKey = `ai_learning_${language}_${topic.id}`;
            localStorage.setItem(cacheKey, JSON.stringify(finalMessages));

        } catch (err) {
            console.error(err);
            const errorMsg = String(err);
            setMessages(prev => {
                const newArr = [...prev];
                newArr[newArr.length - 1] = { role: 'ai', content: `**Error:** Failed to get response. ${errorMsg}` };
                return newArr;
            });
        }
    };

    useImperativeHandle(ref, () => ({
        askQuestion: async (question: string) => {
            return internalAskQuestion(question, messages);
        }
    }));

    useEffect(() => {
        if (topic) {
            fetchExplanation(topic);
        }
    }, [topic, language]);

    // Highlight code after content updates
    useEffect(() => {
        if (messages.length > 0) {
            Prism.highlightAll();
        }
    }, [messages]);

    const fetchExplanation = async (currentTopic: Topic, forceRefresh = false) => {
        const cacheKey = `ai_learning_${language}_${currentTopic.id}`;

        if (!forceRefresh) {
            // Check for offline data first
            const offlineData = OFFLINE_LEARNING_DATA[language]?.[currentTopic.id];
            if (offlineData) {
                const initialOfflineMsg = [{ role: 'ai' as const, content: offlineData }];
                setMessages(initialOfflineMsg);
                localStorage.setItem(cacheKey, JSON.stringify(initialOfflineMsg));
                setIsLoading(false);
                return;
            }

            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed)) {
                        setMessages(parsed);
                        return;
                    }
                } catch {
                    // Fallback to storing as a single message
                    setMessages([{ role: 'ai', content: cached }]);
                    return;
                }
            }
        }

        setIsLoading(true);
        setMessages([{ role: 'ai', content: '*Thinking...*' }]);
        setError(null);

        try {
            let prompt = "";

            if (language === "dsa") {
                prompt = `Explain the topic '${currentTopic.title}' in the context of Data Structures and Algorithms using Python.
      Act as a friendly, expert tutor.

      Structure your response like a high-quality interactive textbook:
      1.  **Concept**: Clearly explain the data structure or algorithm.
      2.  **Visual Intuition**: Describe how it works conceptually (e.g., "Think of a Stack like a pile of plates").
      3.  **Complexity**: Time and Space complexity (Big O).
      4.  **Implementation**: Provide a clear, commented Python implementation.
      5.  **Usage**: When to use this vs other structures.

      Use clean Markdown formatting. Use code blocks for all code.`;
            } else if (currentTopic.title === "Practice Questions") {
                prompt = `Generate 10 beginner-friendly practice questions and exercises for the topic: "${groupTitle || "General Practice"}" in ${language}.
      Act as a friendly, expert tutor.

      Structure your response as follows:
      1.  **Introduction**: Briefly mention what these questions cover.
      2.  **Exercises**: List 10 questions. For each question:
          -   **Question**: A clear problem statement.
          -   **Hint**: A small clue (formatted as a quote or italicized).
          -   **Solution**: A collapsible or clear code block with the solution and brief explanation.

      Ensure the questions range from easy to medium difficulty. Use clean Markdown formatting.`;
            } else if (language === "html" || language === "css" || language === "javascript") {
                prompt = `Explain the topic '${currentTopic.title}' for a beginner learning ${language.toUpperCase()}.
        Act as a friendly, expert web development tutor.

        Structure your response like a high-quality interactive textbook:
        1.  **Concept**: What is it and why do we use it?
        2.  **Syntax**: Show the basic syntax.
        3.  **Visual Examples**: Provide clear, commented code examples.
        4.  **Best Practices**: Common patterns or mistakes to avoid.
        5.  **Mini-Challenge**: A small task for the user to try in the editor.

        Use clean Markdown. Code blocks must be tagged with '${language}'.`;
            } else {
                prompt = `Explain the topic '${currentTopic.title}' for a beginner learning ${language}. 
      Act as a friendly, expert tutor.
      
      Structure your response like a high-quality documentation page:
      1.  **Introduction**: Briefly explain what the concept is and why it's used.
      2.  **Syntax/Usage**: Show the basic syntax.
      3.  **Examples**: Provide clear, commented code examples in ${language}.
      4.  **Best Practices (Optional)**: Mention any common idioms or pitfalls.
      5.  **Summary**: A one-sentence takeaway.

      Use clean Markdown formatting. Use code blocks for all code.`;
            }

            const stream = generateAIResponseStream(prompt, [], {
                provider: provider,
                model: selectedModel || "",
                apiKey: apiKey,
                openAiApiKey: openAiApiKey,
                anthropicApiKey: anthropicApiKey,
                groqApiKey: groqApiKey,
                huggingFaceApiKey: huggingFaceApiKey,
                temperature: temperature
            });

            let fullContent = "";
            for await (const chunk of stream) {
                fullContent += chunk;
                setMessages([{ role: 'ai', content: fullContent }]);
            }

            localStorage.setItem(cacheKey, JSON.stringify([{ role: 'ai', content: fullContent }]));
        } catch (err) {
            console.error("Failed to fetch explanation:", err);
            setError(String(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (!topic) {
        return (
            <div style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px",
                textAlign: "center",
                color: "var(--text-muted)"
            }}>
                <Sparkles size={64} style={{ color: "var(--accent-text)", opacity: 0.5, marginBottom: "24px" }} />
                <h2 style={{ fontSize: "1.5rem", marginBottom: "16px", color: "var(--text-main)" }}>Select a Topic to Start Learning</h2>
                <p style={{ maxWidth: "400px", lineHeight: "1.6" }}>
                    Open the sidebar <span style={{ padding: "2px 6px", background: "var(--border-color)", borderRadius: "4px", fontSize: "0.85rem" }}>Top Left</span> to browse the curriculum and select a topic.
                </p>
                <button className="btn btn-primary" onClick={onBack} style={{ marginTop: "24px" }}>
                    <BookOpen size={16} style={{ marginRight: "8px" }} /> Browse Topics
                </button>
            </div>
        );
    }

    return (
        <div className="learning-content" style={{ display: "flex", flexDirection: "column", height: "100%", padding: "0", overflow: "hidden" }}>


            <div style={{ flex: 1, overflowY: "auto", padding: "0" }} className="custom-markdown-content" ref={scrollRef}>
                {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", minHeight: "300px" }}>
                        <Loader2 className="animate-spin" size={48} style={{ marginBottom: "24px", color: "var(--accent-text)" }} />
                        <p style={{ fontSize: "1.2rem", fontWeight: "500" }}>Creating your guide...</p>
                        <p style={{ opacity: 0.7 }}>Writing custom examples for <strong>{topic.title}</strong>.</p>
                    </div>
                ) : error ? (
                    <div style={{ color: "#ff6b6b", padding: "24px", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: "12px", background: "rgba(255, 107, 107, 0.05)", margin: "20px" }}>
                        <h3 style={{ marginTop: 0 }}>Unable to load content</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => fetchExplanation(topic)} style={{ marginTop: "16px" }}>
                            <RefreshCw size={16} style={{ marginRight: "8px" }} /> Try Again
                        </button>
                    </div>
                ) : (
                    <div className="description-container" style={{ padding: "0 12px", paddingBottom: "100px" }} onPointerDown={(e) => e.stopPropagation()}>
                        {messages.map((msg, idx) => (
                            <ChatBubble
                                key={idx}
                                msg={msg}
                                idx={idx}
                                isLast={idx === messages.length - 1}
                                isDictionaryActive={isDictionaryActive}
                                setIsDictionaryActive={setIsDictionaryActive}
                                speakingMsgIdx={speakingMsgIdx}
                                handleListen={handleListen ? (text, idx) => handleListen(text, idx) : undefined}
                                handleTryAgain={(idx) => {
                                    const userMsg = messages[idx - 1];
                                    if (userMsg && userMsg.role === 'user') {
                                        // Follow-up Q&A: ask the question again with context up to before the user's msg
                                        const newMessages = messages.slice(0, idx - 1);
                                        setMessages(newMessages);
                                        internalAskQuestion(userMsg.content, newMessages);
                                    } else {
                                        // Initial topic explanation: regenerate it
                                        if (topic) fetchExplanation(topic, true);
                                    }
                                }}
                                handleGenerateQuiz={handleGenerateQuiz}
                                markdownComponents={markdownComponents}
                                isExplaining={isLoading}
                                isQuizGenerating={isQuizGenerating}
                            />
                        ))}

                        {(prevTopic || nextTopic) && (
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "40px", borderTop: "1px solid var(--border-color)", paddingTop: "24px", gap: "16px" }}>
                                {prevTopic ? (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => onSelectTopic?.(prevTopic, prevTopic.groupTitle)}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "16px 20px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", flex: 1, height: "auto" }}
                                    >
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>&larr; Previous</span>
                                        <span style={{ fontWeight: 600, color: "var(--text-main)", textAlign: "left" }}>{prevTopic.title}</span>
                                    </button>
                                ) : <div style={{ flex: 1 }}></div>}

                                {nextTopic ? (
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => onSelectTopic?.(nextTopic, nextTopic.groupTitle)}
                                        style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", padding: "16px 20px", background: "var(--panel-bg)", border: "1px solid var(--border-color)", flex: 1, height: "auto" }}
                                    >
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>Next &rarr;</span>
                                        <span style={{ fontWeight: 600, color: "var(--accent-text)", textAlign: "right" }}>{nextTopic.title}</span>
                                    </button>
                                ) : <div style={{ flex: 1 }}></div>}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
});
