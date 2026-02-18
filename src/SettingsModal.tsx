import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Moon, Key, Sparkles, Loader2 } from "lucide-react";
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
    const [fetchedModels, setFetchedModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        setLocalKey(apiKey);
    }, [apiKey]);

    // Debounce and fetch models when localKey changes
    useEffect(() => {
        const fetchModels = async () => {
            if (!localKey.trim()) {
                setFetchedModels([]);
                setFetchError(null);
                return;
            }

            // Don't re-fetch if it matches the current global key and we already have models passed in props
            if (localKey === apiKey && availableModels.length > 0) {
                setFetchedModels(availableModels);
                return;
            }

            setIsLoadingModels(true);
            setFetchError(null);
            try {
                console.log("Fetching models for key...", localKey.substring(0, 5) + "...");
                const models = await invoke<string[]>("get_available_models", { apiKey: localKey });
                setFetchedModels(models);
            } catch (error) {
                console.error("Failed to fetch models:", error);
                setFetchedModels([]);
                setFetchError("Invalid API Key or Network Error");
            } finally {
                setIsLoadingModels(false);
            }
        };

        const timer = setTimeout(fetchModels, 800); // 800ms debounce

        return () => clearTimeout(timer);
    }, [localKey, apiKey, availableModels]); // Depend on availableModels to sync initial state

    const handleSave = () => {
        setApiKey(localKey);
        onClose();
    };

    if (!isOpen) return null;

    // Determine which list to show:
    // 1. If we have fetched models (specifically for the *current* localKey input), use them.
    // 2. Otherwise default to availableModels (though the effect above syncs them).
    const displayModels = fetchedModels.length > 0 ? fetchedModels : availableModels;

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
                        {fetchError && (
                            <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: 4 }}>
                                ⚠️ {fetchError}
                            </div>
                        )}
                        <p className="setting-hint">
                            Your key is stored locally on your device.
                            <br />
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                            >
                                Get a Gemini API Key mapped →
                            </a>
                        </p>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            <Sparkles size={18} />
                            <span>AI Model</span>
                        </label>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <select
                                className="settings-input"
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    background: 'var(--panel-bg)',
                                    color: 'var(--text-main)',
                                    border: '1px solid var(--border-color)',
                                    opacity: isLoadingModels ? 0.7 : 1
                                }}
                                value={selectedModel || ""}
                                onChange={(e) => setSelectedModel(e.target.value || null)}
                                disabled={isLoadingModels}
                            >
                                <option value="">Auto Select (Recommended)</option>
                                {displayModels.map(model => (
                                    <option key={model} value={model}>{model}</option>
                                ))}
                            </select>
                            {isLoadingModels && (
                                <div style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <Loader2 className="animate-spin" size={16} color="var(--text-muted)" />
                                </div>
                            )}
                        </div>
                        <p className="setting-hint">
                            {isLoadingModels ? "Checking availability..." : "Choose a specific Gemini model or let the system auto-select."}
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
