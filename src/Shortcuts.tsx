import { Keyboard } from "lucide-react";
import "./Shortcuts.css";

export function Shortcuts() {
    const shortcuts = [
        { key: "Ctrl + Enter", desc: "Run Code" },
        { key: "Ctrl + F", desc: "Find" },
        { key: "Ctrl + H", desc: "Replace" },
        { key: "Ctrl + D", desc: "Add Selection to Next Find Match" },
        { key: "Alt + Click", desc: "Insert Cursor" },
        { key: "Ctrl + /", desc: "Toggle Line Comment" },
        { key: "Shift + Alt + F", desc: "Format Document" },
        { key: "F1", desc: "Command Palette" },
        { key: "Ctrl + P", desc: "Quick Open" },
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
