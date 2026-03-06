import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Moon, Key, Sparkles, Loader2, Trash2, Save, ChevronDown } from "lucide-react";
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
    selectedModel: string;
    availableModels: string[];
    setSelectedModel: (model: string) => void;
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

    // Custom Models State Management
    const [customModelsMap, setCustomModelsMap] = useState<Record<string, string[]>>(() => {
        try {
            return JSON.parse(localStorage.getItem('customModelsMap') || '{}');
        } catch {
            return {};
        }
    });

    const [deletedModelsMap, setDeletedModelsMap] = useState<Record<string, string[]>>(() => {
        try {
            return JSON.parse(localStorage.getItem('deletedModelsMap') || '{}');
        } catch {
            return {};
        }
    });

    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showNewModelInput, setShowNewModelInput] = useState(false);
    const [newModelInput, setNewModelInput] = useState("");

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
            setSelectedModel("");
        }
        onClose();
    };

    if (!isOpen) return null;

    // Determine which list to show:
    // 1. If we have fetched models (specifically for the *current* localKey input), use them.
    // 2. Otherwise default to availableModels (though the effect above syncs them).
    const baseModels = fetchedModels.length > 0 ? fetchedModels : availableModels;

    // Combine base models and custom models, then filter out deleted models
    const displayModels = (() => {
        const added = customModelsMap[localProvider] || [];
        const deleted = deletedModelsMap[localProvider] || [];
        const providerModels = [...new Set([...baseModels, ...added])].filter(m => !deleted.includes(m));
        return providerModels;
    })();

    const deleteModel = (modelToDelete: string) => {
        if (window.confirm(`Are you sure you want to remove '${modelToDelete}'?`)) {
            const updatedDeleted = { ...deletedModelsMap };
            if (!updatedDeleted[localProvider]) updatedDeleted[localProvider] = [];
            if (!updatedDeleted[localProvider].includes(modelToDelete)) {
                updatedDeleted[localProvider].push(modelToDelete);
            }
            setDeletedModelsMap(updatedDeleted);
            localStorage.setItem('deletedModelsMap', JSON.stringify(updatedDeleted));

            // If we deleted the active model, auto-switch to the next available one
            if (activeModel === modelToDelete || selectedModel === modelToDelete) {
                // Calculate what the remaining models will be
                const added = customModelsMap[localProvider] || [];
                const remainingModels = [...new Set([...baseModels, ...added])].filter(m => !updatedDeleted[localProvider].includes(m));

                const nextModel = remainingModels.length > 0 ? remainingModels[0] : "";
                setSelectedModel(nextModel);
            }
        }
    };

    return (
        <div className="settings-container" style={{ width: '100%', height: '100%', overflowY: 'auto', background: 'var(--code-bg)' }}>
            <div className="settings-content" style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '24px' }}>
                <div className="settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Settings</h2>
                    <button onClick={onClose} className="close-btn" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', borderRadius: '4px' }}>
                        <X size={20} />
                    </button>
                </div>

                <div className="settings-body" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                            <div
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px', borderRadius: '4px', backgroundColor: 'var(--panel-bg)',
                                    color: 'var(--text-main)', border: '1px solid var(--border-color)',
                                    cursor: 'pointer', opacity: isLoadingModels ? 0.7 : 1
                                }}
                                onClick={() => !isLoadingModels && setShowModelDropdown(!showModelDropdown)}
                            >
                                <span>{selectedModel || "Auto Select (Recommended)"}</span>
                                <ChevronDown size={16} />
                            </div>

                            {isLoadingModels && localProvider === "gemini" && (
                                <div style={{ position: 'absolute', right: 30, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <Loader2 className="animate-spin" size={16} color="var(--text-muted)" />
                                </div>
                            )}

                            {showModelDropdown && !isLoadingModels && (
                                <div style={{
                                    position: 'absolute', left: 0, right: 0, top: '100%',
                                    backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)',
                                    borderRadius: '0.5rem', marginTop: '0.2rem', overflow: 'hidden', zIndex: 10,
                                    maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <div
                                        style={{ padding: '0.7rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', backgroundColor: selectedModel === "" ? 'var(--bg-secondary)' : 'transparent' }}
                                        onClick={() => {
                                            setSelectedModel("");
                                            setShowModelDropdown(false);
                                        }}
                                    >
                                        <span>Auto Select (Recommended)</span>
                                    </div>
                                    {displayModels.map(m => (
                                        <div
                                            key={m}
                                            style={{ padding: '0.7rem', borderBottom: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', backgroundColor: selectedModel === m ? 'var(--bg-secondary)' : 'transparent' }}
                                            onClick={() => {
                                                setSelectedModel(m);
                                                setShowModelDropdown(false);
                                            }}
                                        >
                                            <span>{m}</span>
                                            <Trash2 size={14} style={{ color: 'var(--text-muted)' }} onClick={(e: React.MouseEvent) => { e.stopPropagation(); deleteModel(m); }} />
                                        </div>
                                    ))}

                                    {showNewModelInput ? (
                                        <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
                                            <input
                                                type="text"
                                                value={newModelInput}
                                                onChange={(e) => setNewModelInput(e.target.value)}
                                                placeholder="Custom model name..."
                                                style={{
                                                    flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)',
                                                    backgroundColor: 'var(--bg-color)', color: 'var(--text-main)', fontSize: '0.8rem'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newModelInput.trim()) {
                                                        const newModel = newModelInput.trim();
                                                        const updatedCustom = { ...customModelsMap };
                                                        if (!updatedCustom[localProvider]) updatedCustom[localProvider] = [];
                                                        if (!updatedCustom[localProvider].includes(newModel)) {
                                                            updatedCustom[localProvider].push(newModel);
                                                        }
                                                        setCustomModelsMap(updatedCustom);
                                                        localStorage.setItem('customModelsMap', JSON.stringify(updatedCustom));

                                                        if (deletedModelsMap[localProvider]?.includes(newModel)) {
                                                            const updatedDeleted = { ...deletedModelsMap };
                                                            updatedDeleted[localProvider] = updatedDeleted[localProvider].filter(m => m !== newModel);
                                                            setDeletedModelsMap(updatedDeleted);
                                                            localStorage.setItem('deletedModelsMap', JSON.stringify(updatedDeleted));
                                                        }

                                                        setNewModelInput('');
                                                        setShowNewModelInput(false);
                                                        setSelectedModel(newModel);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (newModelInput.trim()) {
                                                        const newModel = newModelInput.trim();
                                                        const updatedCustom = { ...customModelsMap };
                                                        if (!updatedCustom[localProvider]) updatedCustom[localProvider] = [];
                                                        if (!updatedCustom[localProvider].includes(newModel)) {
                                                            updatedCustom[localProvider].push(newModel);
                                                        }
                                                        setCustomModelsMap(updatedCustom);
                                                        localStorage.setItem('customModelsMap', JSON.stringify(updatedCustom));

                                                        if (deletedModelsMap[localProvider]?.includes(newModel)) {
                                                            const updatedDeleted = { ...deletedModelsMap };
                                                            updatedDeleted[localProvider] = updatedDeleted[localProvider].filter(m => m !== newModel);
                                                            setDeletedModelsMap(updatedDeleted);
                                                            localStorage.setItem('deletedModelsMap', JSON.stringify(updatedDeleted));
                                                        }

                                                        setNewModelInput('');
                                                        setShowNewModelInput(false);
                                                        setSelectedModel(newModel);
                                                    }
                                                }}
                                                style={{
                                                    padding: '0.4rem', backgroundColor: 'var(--accent-color)', color: 'white',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center'
                                                }}
                                            >
                                                <Save size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            style={{ padding: '0.7rem', color: 'var(--accent-color)', cursor: 'pointer', textAlign: 'center', fontWeight: '500', borderTop: '1px solid var(--border-color)' }}
                                            onClick={(e) => { e.stopPropagation(); setShowNewModelInput(true); }}
                                        >
                                            + New Model
                                        </div>
                                    )}
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

                <div className="settings-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
