import { useState, useEffect } from "react";
import { X, Moon, Key } from "lucide-react";
import { themes } from "./themes";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    onViewShortcuts: () => void;
}

export function SettingsModal({
    isOpen,
    onClose,
    apiKey,
    setApiKey,
    theme,
    setTheme,
    onViewShortcuts,
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
                        <div className="theme-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
                            {Object.values(themes).map((t) => (
                                <button
                                    key={t.id}
                                    className={`theme-btn ${theme === t.id ? "active" : ""}`}
                                    onClick={() => setTheme(t.id)}
                                    style={{
                                        flexDirection: 'column',
                                        height: 'auto',
                                        padding: 8,
                                        border: theme === t.id ? `2px solid var(--accent-color)` : '1px solid var(--border-color)',
                                        background: t.bg,
                                        color: t.text
                                    }}
                                >
                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: t.primary, marginBottom: 4 }}></div>
                                    <span style={{ fontSize: '0.75rem' }}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            <Key size={18} />
                            <span>Application Shortcuts</span>
                        </label>
                        <button
                            className="btn btn-secondary"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => {
                                onViewShortcuts();
                                onClose();
                            }}
                        >
                            View All Shortcuts
                        </button>
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
