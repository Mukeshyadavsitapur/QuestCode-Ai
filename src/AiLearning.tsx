import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, RefreshCw, BookOpen } from "lucide-react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css"; // Basic dark theme, can be overridden by custom CSS
import "prismjs/components/prism-rust";
import "prismjs/components/prism-python";
import { Topic } from "./learningData";

interface AiLearningProps {
    language: "rust" | "python";
    apiKey: string;
    selectedModel: string | null;
    topic: Topic | null;
    onBack: () => void;
}

export function AiLearning({ language, apiKey, selectedModel, topic, onBack }: AiLearningProps) {
    const [content, setContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const fetchExplanation = async (currentTopic: Topic) => {
        setIsLoading(true);
        setContent("");
        setError(null);

        try {
            const prompt = `Explain the topic '${currentTopic.title}' for a beginner learning ${language}. 
      Act as a friendly, expert tutor.
      
      Structure your response like a high-quality documentation page:
      1.  **Introduction**: Briefly explain what the concept is and why it's used.
      2.  **Syntax/Usage**: Show the basic syntax.
      3.  **Examples**: Provide clear, commented code examples in ${language}.
      4.  **Best Practices (Optional)**: Mention any common idioms or pitfalls.
      5.  **Summary**: A one-sentence takeaway.

      Use clean Markdown formatting. Use code blocks for all code.`;

            const response: { content: string; model: string } = await invoke("ask_question", {
                req: {
                    api_key: apiKey,
                    code: "", // No context code needed
                    question: prompt,
                    language: language,
                    selected_model: selectedModel
                }
            });
            setContent(response.content);
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
                <Sparkles size={64} style={{ color: "var(--accent-color)", opacity: 0.5, marginBottom: "24px" }} />
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
                <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700", color: "var(--accent-color)", flex: 1 }}>
                    {topic.id} {topic.title}
                </h2>
                {/* Optional: Add navigation buttons specific to curriculum here if needed */}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }} className="custom-markdown-content">
                {isLoading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", minHeight: "300px" }}>
                        <Loader2 className="animate-spin" size={48} style={{ marginBottom: "24px", color: "var(--accent-color)" }} />
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
                        <ReactMarkdown
                            components={{
                                code({ className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    const isInline = !match;
                                    return isInline ? (
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
                                    ) : (
                                        <code className={className} {...props}>
                                            {children}
                                        </code>
                                    );
                                }
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
