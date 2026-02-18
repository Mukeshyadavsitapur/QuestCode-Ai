import { useState, useEffect } from "react";
import { X, Moon, Sun, Key } from "lucide-react";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    theme: "dark" | "light";
    setTheme: (theme: "dark" | "light") => void;
}

export function SettingsModal({
    isOpen,
    onClose,
    apiKey,
    setApiKey,
    theme,
    setTheme,
}: SettingsModalProps) {
    const [localKey, setLocalKey] = useState(apiKey);

    useEffect(() => {
        setLocalKey(apiKey);
    }, [apiKey]);

    const handleSave = () => {
        setApiKey(localKey);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="setting-group">
                        <label className="setting-label">
                            <Moon size={18} />
                            <span>Appearance</span>
                        </label>
                        <div className="theme-toggle">
                            <button
                                className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                                onClick={() => setTheme("dark")}
                            >
                                <Moon size={16} /> Dark
                            </button>
                            <button
                                className={`theme-btn ${theme === "light" ? "active" : ""}`}
                                onClick={() => setTheme("light")}
                            >
                                <Sun size={16} /> Light
                            </button>
                        </div>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            <Key size={18} />
                            <span>API Key</span>
                        </label>
                        <input
                            type="password"
                            className="settings-input"
                            placeholder="Enter your API Key"
                            value={localKey}
                            onChange={(e) => setLocalKey(e.target.value)}
                        />
                        <p className="setting-hint">
                            Your key is stored locally on your device.
                            <br />
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent-color)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                            >
                                Get a Gemini API Key mapped →
                            </a>
                        </p>
                    </div>
                </div>

                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="btn btn-primary">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
