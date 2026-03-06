import { useState, useEffect, forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { Sparkles, Loader2, RefreshCw, BookOpen, Copy, Terminal as TerminalIcon } from "lucide-react";
import Prism from "prismjs";
import { SmartContent, generateAIResponseStream } from "./aiUtils";
import "prismjs/themes/prism-tomorrow.css"; // Basic dark theme, can be overridden by custom CSS
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import { Topic } from "./learningData";

export interface AiLearningHandle {
    askQuestion: (question: string) => Promise<void>;
}

interface AiLearningProps {
    language: "rust" | "python" | "dsa" | "html" | "css" | "javascript" | "ml";
    apiKey: string;
    provider: string;
    selectedModel: string | null;
    topic: Topic | null;
    groupTitle: string | null;
    onBack: () => void;
    onApplyCode: (code: string) => void;
    prevTopic?: (Topic & { groupTitle: string }) | null;
    nextTopic?: (Topic & { groupTitle: string }) | null;
    onSelectTopic?: (topic: Topic, groupTitle: string) => void;
}

export const AiLearning = forwardRef<AiLearningHandle, AiLearningProps>(({ language, apiKey, provider, selectedModel, topic, groupTitle, onBack, onApplyCode, prevTopic, nextTopic, onSelectTopic }, ref) => {
    const [content, setContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [temperature, setTemperature] = useState<number>(0.3);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollToLatestMessage = () => {
        // Wait for a tiny bit for render to finish
        setTimeout(() => {
            if (scrollRef.current) {
                const latestQuestion = scrollRef.current.querySelector('a[href="#latest-question"]') as HTMLElement;
                if (latestQuestion) {
                    scrollRef.current.scrollTop = latestQuestion.offsetTop - 16;
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

    useImperativeHandle(ref, () => ({
        askQuestion: async (question: string) => {
            if (!topic) return;

            const timestamp = new Date().toLocaleTimeString();
            const cleanContent = content.replace(/\[\s*\]\(#latest-question\)/g, "");
            const newContent = cleanContent + (cleanContent ? "\n\n--- \n\n" : "") + `[ ](#latest-question)**You (${timestamp}):** ${question}\n\n*Thinking...*`;
            setContent(newContent);
            scrollToLatestMessage();

            try {
                // Construct prompt with context
                // Truncate content if too long to avoid token limits, but keep recent context
                const contextContent = content.length > 8000 ? "..." + content.slice(-8000) : content;

                const prompt = `Regarding the topic '${topic.title}' in the ${language} course.
The current content is:
${contextContent}

User Question: ${question}

Answer the user's question in the context of this topic. Be concise and helpful. Use Markdown.`;

                const stream = generateAIResponseStream(prompt, [], {
                    provider: provider,
                    model: selectedModel || "",
                    apiKey: apiKey,
                    openAiApiKey: apiKey,
                    anthropicApiKey: apiKey,
                    groqApiKey: apiKey,
                    huggingFaceApiKey: apiKey,
                    temperature: temperature
                });

                let fullContent = "";
                for await (const chunk of stream) {
                    fullContent += chunk;
                    setContent(newContent.replace("*Thinking...*", "") + `\n\n**AI:** ${fullContent}`);
                    scrollToLatestMessage();
                }

                const finalContent = newContent.replace("*Thinking...*", "") + `\n\n**AI:** ${fullContent}`;
                setContent(finalContent);

                // Update Cache
                const cacheKey = `ai_learning_${language}_${topic.id}`;
                localStorage.setItem(cacheKey, finalContent);

            } catch (err) {
                console.error(err);
                const errorMsg = String(err);
                setContent(newContent.replace("*Thinking...*", "") + `\n\n**Error:** Failed to get response. ${errorMsg}`);
            }
        }
    }));

    useEffect(() => {
        if (topic) {
            fetchExplanation(topic);
        }
    }, [topic, language]);

    // Highlight code after content updates
    useEffect(() => {
        if (content) {
            Prism.highlightAll();
        }
    }, [content]);

    const fetchExplanation = async (currentTopic: Topic, forceRefresh = false) => {
        const cacheKey = `ai_learning_${language}_${currentTopic.id}`;

        if (!forceRefresh) {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                setContent(cached);
                return;
            }
        }

        setIsLoading(true);
        setContent("");
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
                openAiApiKey: apiKey,
                anthropicApiKey: apiKey,
                groqApiKey: apiKey,
                huggingFaceApiKey: apiKey,
                temperature: temperature
            });

            let fullContent = "";
            for await (const chunk of stream) {
                fullContent += chunk;
                setContent(fullContent);
            }

            localStorage.setItem(cacheKey, fullContent);
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
            <div style={{
                padding: "16px 24px",
                borderBottom: "1px solid var(--border-color)",
                background: "var(--panel-bg)",
                display: "flex",
                alignItems: "center",
                gap: "12px"
            }}>
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--accent-text)", flex: 1 }}>
                    {topic.id} {topic.title}
                </h2>

                <select
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="settings-input"
                    style={{
                        padding: "6px 8px",
                        borderRadius: "4px",
                        background: "var(--bg-color)",
                        color: "var(--text-main)",
                        border: "1px solid var(--border-color)",
                        marginRight: "8px",
                        fontSize: "0.85rem",
                        width: "auto",
                        maxWidth: "140px",
                        cursor: "pointer"
                    }}
                    title="Creativity Level (Temperature)"
                >
                    <option value={0.1}>Focused (0.1)</option>
                    <option value={0.3}>Default (0.3)</option>
                    <option value={0.5}>Balanced (0.5)</option>
                    <option value={0.8}>Creative (0.8)</option>
                    <option value={1.0}>Exploratory (1.0)</option>
                </select>

                <button
                    onClick={() => fetchExplanation(topic, true)}
                    disabled={isLoading}
                    className="btn btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.85rem", opacity: isLoading ? 0.5 : 1 }}
                    title="Regenerate Explanation"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} style={{ marginRight: "6px" }} />
                    {isLoading ? "Generating..." : "Regenerate"}
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }} className="custom-markdown-content" ref={scrollRef}>
                {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", minHeight: "300px" }}>
                        <Loader2 className="animate-spin" size={48} style={{ marginBottom: "24px", color: "var(--accent-text)" }} />
                        <p style={{ fontSize: "1.2rem", fontWeight: "500" }}>Creating your guide...</p>
                        <p style={{ opacity: 0.7 }}>Writing custom examples for <strong>{topic.title}</strong>.</p>
                    </div>
                ) : error ? (
                    <div style={{ color: "#ff6b6b", padding: "24px", border: "1px solid rgba(255, 107, 107, 0.3)", borderRadius: "12px", background: "rgba(255, 107, 107, 0.05)" }}>
                        <h3 style={{ marginTop: 0 }}>Unable to load content</h3>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => fetchExplanation(topic)} style={{ marginTop: "16px" }}>
                            <RefreshCw size={16} style={{ marginRight: "8px" }} /> Try Again
                        </button>
                    </div>
                ) : (
                    <div className="markdown-body">
                        <SmartContent
                            content={content}
                            markdownComponents={markdownComponents}
                        />

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
