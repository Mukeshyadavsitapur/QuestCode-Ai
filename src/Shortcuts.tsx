import { Keyboard } from "lucide-react";
import "./Shortcuts.css";

export function Shortcuts() {
    const shortcuts = [
        { key: "F1", desc: "Settings / Command Palette" },
        { key: "F5", desc: "Run Code" },
        { key: "F11", desc: "Toggle Full Screen" },
        { key: "Ctrl + B", desc: "Toggle Sidebar" },
        { key: "Ctrl + `", desc: "Toggle Terminal" },
        { key: "Ctrl + P", desc: "Quick Chat" },
        { key: "F4", desc: "Toggle Editor" },
        { key: "F7", desc: "Move Terminal" },
        { key: "Ctrl + Alt + B", desc: "Toggle AI Assistant" },
        { key: "Ctrl + Alt + C", desc: "Explain Code" },
        { key: "Ctrl + Enter", desc: "Run Code (Editor)" },
        { key: "Ctrl + /", desc: "Toggle Line Comment" },
        { key: "Ctrl + F", desc: "Find" },
        { key: "Ctrl + H", desc: "Replace" },
        { key: "Ctrl + D", desc: "Add Selection to Next Find Match" },
        { key: "Alt + Click", desc: "Insert Cursor" },
        { key: "Shift + Alt + F", desc: "Format Document" },
        { key: "Ctrl + Shift + L", desc: "Select All Occurrences" },
    ];

    return (
        <div className="shortcuts-container">
            <div className="shortcuts-header">
                <Keyboard size={24} />
                <h2>Editor Shortcuts</h2>
            </div>
            <div className="shortcuts-list">
                {shortcuts.map((s, i) => (
                    <div key={i} className="shortcut-item">
                        <span className="shortcut-desc">{s.desc}</span>
                        <kbd className="shortcut-key">{s.key}</kbd>
                    </div>
                ))}
            </div>
        </div>
    );
}
