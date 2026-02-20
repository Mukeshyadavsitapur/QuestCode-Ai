import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Moon, Key, Sparkles, Loader2 } from "lucide-react";
import { themes } from "./themes";

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    llmProvider: string;
    setLlmProvider: (provider: string) => void;
    apiKey: string;
    setApiKey: (key: string) => void;
    openAiApiKey: string;
    setOpenAiApiKey: (key: string) => void;
    anthropicApiKey: string;
    setAnthropicApiKey: (key: string) => void;
    groqApiKey: string;
    setGroqApiKey: (key: string) => void;
    huggingFaceApiKey: string;
    setHuggingFaceApiKey: (key: string) => void;
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
    llmProvider,
    setLlmProvider,
    apiKey,
    setApiKey,
    openAiApiKey,
    setOpenAiApiKey,
    anthropicApiKey,
    setAnthropicApiKey,
    groqApiKey,
    setGroqApiKey,
    huggingFaceApiKey,
    setHuggingFaceApiKey,
    theme,
    setTheme,
    onViewShortcuts,
    selectedModel,
    availableModels,
    setSelectedModel,
    activeModel,
}: SettingsModalProps) {
    const [localProvider, setLocalProvider] = useState(llmProvider);
    const [localKey, setLocalKey] = useState(apiKey);
    const [localOpenAiKey, setLocalOpenAiKey] = useState(openAiApiKey);
    const [localAnthropicKey, setLocalAnthropicKey] = useState(anthropicApiKey);
    const [localGroqKey, setLocalGroqKey] = useState(groqApiKey);
    const [localHuggingFaceKey, setLocalHuggingFaceKey] = useState(huggingFaceApiKey);
    const [fetchedModels, setFetchedModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        setLocalProvider(llmProvider);
        setLocalKey(apiKey);
        setLocalOpenAiKey(openAiApiKey);
        setLocalAnthropicKey(anthropicApiKey);
        setLocalGroqKey(groqApiKey);
        setLocalHuggingFaceKey(huggingFaceApiKey);
    }, [llmProvider, apiKey, openAiApiKey, anthropicApiKey, groqApiKey, huggingFaceApiKey]);

    // Debounce and fetch models when localKey or localProvider changes
    useEffect(() => {
        const fetchModels = async () => {
            if (localProvider !== "gemini") {
                setFetchedModels([]);
                setFetchError(null);
                return;
            }

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
    }, [localKey, apiKey, availableModels, localProvider]); // Depend on availableModels to sync initial state

    const handleSave = () => {
        setLlmProvider(localProvider);
        setApiKey(localKey);
        setOpenAiApiKey(localOpenAiKey);
        setAnthropicApiKey(localAnthropicKey);
        setGroqApiKey(localGroqKey);
        setHuggingFaceApiKey(localHuggingFaceKey);
        // Clear selected model if provider changed to avoid invalid model selection
        if (localProvider !== llmProvider) {
            setSelectedModel(null);
        }
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
                            <Sparkles size={18} />
                            <span>LLM Provider</span>
                        </label>
                        <select
                            className="settings-input"
                            style={{ appearance: 'auto', WebkitAppearance: 'auto' as any, backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            value={localProvider}
                            onChange={(e) => {
                                setLocalProvider(e.target.value);
                                setLocalKey(e.target.value === 'gemini' ? apiKey : e.target.value === 'openai' ? openAiApiKey : e.target.value === 'anthropic' ? anthropicApiKey : e.target.value === 'groq' ? groqApiKey : huggingFaceApiKey);
                                setFetchError(null);
                            }}
                        >
                            <option value="groq">Groq</option>
                            <option value="huggingface">Hugging Face</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI (ChatGPT)</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                        </select>
                    </div>

                    <div className="setting-group">
                        <label className="setting-label">
                            <Key size={18} />
                            <span>{localProvider === 'gemini' ? 'Gemini ' : localProvider === 'openai' ? 'OpenAI ' : localProvider === 'anthropic' ? 'Anthropic ' : localProvider === 'groq' ? 'Groq ' : 'Hugging Face '}API Key</span>
                        </label>
                        <input
                            type="password"
                            className="settings-input"
                            placeholder={`Enter your ${localProvider === 'gemini' ? 'Gemini' : localProvider === 'openai' ? 'OpenAI' : localProvider === 'anthropic' ? 'Anthropic' : localProvider === 'groq' ? 'Groq' : 'Hugging Face'} API Key`}
                            value={localProvider === 'gemini' ? localKey : localProvider === 'openai' ? localOpenAiKey : localProvider === 'anthropic' ? localAnthropicKey : localProvider === 'groq' ? localGroqKey : localHuggingFaceKey}
                            onChange={(e) => {
                                if (localProvider === 'gemini') setLocalKey(e.target.value);
                                else if (localProvider === 'openai') setLocalOpenAiKey(e.target.value);
                                else if (localProvider === 'anthropic') setLocalAnthropicKey(e.target.value);
                                else if (localProvider === 'groq') setLocalGroqKey(e.target.value);
                                else setLocalHuggingFaceKey(e.target.value);
                            }}
                        />
                        {fetchError && localProvider === "gemini" && (
                            <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: 4 }}>
                                ⚠️ {fetchError}
                            </div>
                        )}
                        <p className="setting-hint">
                            Your key is stored locally on your device.
                            {localProvider === "gemini" && (
                                <>
                                    <br />
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                    >
                                        Get a Gemini API Key mapped →
                                    </a>
                                </>
                            )}
                            {localProvider === "openai" && (
                                <>
                                    <br />
                                    <a
                                        href="https://platform.openai.com/api-keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                    >
                                        Get an OpenAI API Key →
                                    </a>
                                </>
                            )}
                            {localProvider === "anthropic" && (
                                <>
                                    <br />
                                    <a
                                        href="https://console.anthropic.com/settings/keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                    >
                                        Get an Anthropic API Key →
                                    </a>
                                </>
                            )}
                            {localProvider === "groq" && (
                                <>
                                    <br />
                                    <a
                                        href="https://console.groq.com/keys"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                    >
                                        Get a Groq API Key →
                                    </a>
                                </>
                            )}
                            {localProvider === "huggingface" && (
                                <>
                                    <br />
                                    <a
                                        href="https://huggingface.co/settings/tokens"
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: 'var(--accent-text)', textDecoration: 'none', marginTop: 4, display: 'inline-block' }}
                                    >
                                        Get a Hugging Face Access Token →
                                    </a>
                                </>
                            )}
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
                            {isLoadingModels && localProvider === "gemini" && (
                                <div style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <Loader2 className="animate-spin" size={16} color="var(--text-muted)" />
                                </div>
                            )}
                        </div>
                        <p className="setting-hint">
                            {isLoadingModels && localProvider === "gemini" ? "Checking availability..." : `Choose a specific ${localProvider === 'gemini' ? 'Gemini' : localProvider === 'openai' ? 'OpenAI' : localProvider === 'anthropic' ? 'Anthropic' : localProvider === 'groq' ? 'Groq' : 'Hugging Face'} model or let the system auto-select.`}
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
