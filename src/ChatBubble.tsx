import { BookOpen, VolumeX, Volume2, RefreshCw, Zap } from "lucide-react";
import { SmartContent, Message } from "./aiUtils";

interface ChatBubbleProps {
    msg: Message;
    idx: number;
    isLast: boolean;
    isDictionaryActive?: boolean;
    setIsDictionaryActive?: (val: boolean) => void;
    speakingMsgIdx?: { idx: number, isQuickChat: boolean } | null;
    handleListen?: (text: string, idx: number, isQuickChat?: boolean) => void;
    handleTryAgain?: (idx: number) => void;
    handleGenerateQuiz?: (content: string) => void;
    markdownComponents: any;
    isExplaining?: boolean;
    isQuizGenerating?: boolean;
    isQuickChat?: boolean;
}

export const ChatBubble = ({ 
    msg, 
    idx, 
    isLast,
    isDictionaryActive, 
    setIsDictionaryActive, 
    speakingMsgIdx, 
    handleListen, 
    handleTryAgain, 
    handleGenerateQuiz, 
    markdownComponents,
    isExplaining,
    isQuizGenerating,
    isQuickChat = false
}: ChatBubbleProps) => {
    return (
        <div className={`chat-bubble-container ${msg.role}`} data-msg-idx={idx}>
            <div className={`message-bubble ${msg.role}`}>
                {msg.role === 'ai' && msg.content && msg.content !== '*Thinking...*' && (
                    <div className="msg-bubble-tools">
                        {setIsDictionaryActive && (
                            <button
                                className={`icon-btn ${isDictionaryActive ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsDictionaryActive(!isDictionaryActive);
                                }}
                                title={isDictionaryActive ? "Disable Dictionary Mode" : "Enable Dictionary Mode (Click words)"}
                            >
                                <BookOpen size={16} />
                            </button>
                        )}
                        {handleListen && (
                            <button
                                className={`icon-btn ${speakingMsgIdx?.idx === idx && speakingMsgIdx?.isQuickChat === isQuickChat ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleListen(msg.content, idx, isQuickChat);
                                }}
                                title={speakingMsgIdx?.idx === idx && speakingMsgIdx?.isQuickChat === isQuickChat ? "Stop listening" : "Listen"}
                            >
                                {speakingMsgIdx?.idx === idx && speakingMsgIdx?.isQuickChat === isQuickChat ? <VolumeX size={15} /> : <Volume2 size={15} />}
                            </button>
                        )}
                    </div>
                )}

                <SmartContent
                    content={msg.content}
                    markdownComponents={markdownComponents}
                />

                {msg.role === 'ai' && isLast && (
                    <div className={msg.content === '*Thinking...*' ? "msg-actions-pulse" : "msg-action-bar"}>
                        {msg.content === '*Thinking...*' ? (
                            <div className="thinking-indicator">
                                <Zap size={14} className="animate-pulse text-accent" /> Analyzing context...
                            </div>
                        ) : (
                            <>
                                {handleTryAgain && (
                                    <button
                                        onClick={() => handleTryAgain(idx)}
                                        className="msg-action-btn"
                                        disabled={isExplaining}
                                    >
                                        <RefreshCw size={16} className={isExplaining ? "animate-spin" : ""} />
                                        <span>Try again</span>
                                    </button>
                                )}
                                {handleGenerateQuiz && (
                                    <button
                                        onClick={() => handleGenerateQuiz(msg.content)}
                                        className="msg-action-btn"
                                        disabled={isQuizGenerating}
                                    >
                                        <Zap size={16} className={isQuizGenerating ? "animate-pulse" : ""} />
                                        <span>{isQuizGenerating ? "Generating..." : "Generate Quiz"}</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
