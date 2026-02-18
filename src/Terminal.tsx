import { Terminal as TerminalIcon, XCircle } from "lucide-react";
import "./Terminal.css";

interface TerminalProps {
    output: string;
    isRunning: boolean;
    onClear: () => void;
}

export function Terminal({ output, isRunning, onClear }: TerminalProps) {
    return (
        <div className="terminal-container">
            <div className="terminal-header">
                <div className="terminal-title">
                    <TerminalIcon size={16} />
                    <span>TERMINAL</span>
                </div>
                <div className="terminal-actions">
                    <button className="terminal-btn clear-btn" onClick={onClear}>
                        <XCircle size={14} /> Clear
                    </button>
                </div>
            </div>
            <div className="terminal-output">
                {isRunning ? (
                    <div className="terminal-running">
                        <span className="spinner"></span> Compiling and running...
                    </div>
                ) : (
                    <pre>{output || "Click 'Run Code' to see output here..."}</pre>
                )}
            </div>
        </div>
    );
}
