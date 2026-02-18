import { useState, useEffect } from "react";
import { X, Moon, Key, Sparkles } from "lucide-react";
import { themes } from "./themes";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    theme: string;
    setTheme: (theme: string) => void;
    onViewShortcuts: () => void;
    selectedModel: string | null;
    availableModels: string[];
    setSelectedModel: (model: string | null) => void;
    activeModel: string;
}

export function SettingsModal({
    isOpen,
    onClose,
    apiKey,
    setApiKey,
    theme,
    setTheme,
    onViewShortcuts,
    selectedModel,
    availableModels,
    setSelectedModel,
    activeModel,
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
                        <select
                            className="settings-input"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                            value={theme}
                            onChange={(e) => setTheme(e.target.value)}
                        >
                            {Object.values(themes).map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            <Sparkles size={18} />
                            <span>AI Model</span>
                        </label>
                        <select
                            className="settings-input"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', background: 'var(--panel-bg)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                            value={selectedModel || ""}
                            onChange={(e) => setSelectedModel(e.target.value || null)}
                        >
                            <option value="">Auto Select (Recommended)</option>
                            {availableModels.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                        <p className="setting-hint">
                            Choose a specific Gemini model or let the system auto-select.
                        </p>
                        {activeModel && (
                            <div
                                className={`model-status ${selectedModel && activeModel && selectedModel !== activeModel ? "status-warning" : ""}`}
                                style={{ marginTop: 8, alignSelf: 'flex-start' }}
                            >
                                {selectedModel && activeModel && selectedModel !== activeModel
                                    ? `⚠️ FALLBACK ACTIVE: ${activeModel}`
                                    : `CURRENTLY ACTIVE: ${activeModel}`}
                            </div>
                        )}
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
