import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { X, Moon, Key, Sparkles, Loader2, Trash2, ChevronDown, Check } from "lucide-react";
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

    // Local draft for API key input — only saved on explicit Save click
    const [localApiKeyDraft, setLocalApiKeyDraft] = useState(getCurrentApiKeyValue);
    const [apiKeySaved, setApiKeySaved] = useState(false);

    // Debounce and fetch models when apiKey or llmProvider changes
    useEffect(() => {
        const fetchModels = async () => {
            if (llmProvider !== "gemini") {
                setFetchedModels([]);
                setFetchError(null);
                return;
            }

            if (!apiKey.trim()) {
                setFetchedModels([]);
                setFetchError(null);
                return;
            }

            // Don't re-fetch if we already have models passed in props
            if (availableModels.length > 0) {
                setFetchedModels(availableModels);
                return;
            }

            setIsLoadingModels(true);
            setFetchError(null);
            try {
                const models = await invoke<string[]>("get_available_models", { apiKey });
                setFetchedModels(models);
            } catch (error) {
                console.error("Failed to fetch models:", error);
                setFetchedModels([]);
                setFetchError("Invalid API Key or Network Error");
            } finally {
                setIsLoadingModels(false);
            }
        };

        const timer = setTimeout(fetchModels, 800);
        return () => clearTimeout(timer);
    }, [apiKey, availableModels, llmProvider]);

    if (!isOpen) return null;

    // Determine which list to show
    const baseModels = fetchedModels.length > 0 ? fetchedModels : availableModels;

    // Combine base models and custom models, then filter out deleted models
    const displayModels = (() => {
        const added = customModelsMap[llmProvider] || [];
        const deleted = deletedModelsMap[llmProvider] || [];
        const providerModels = [...new Set([...baseModels, ...added])].filter(m => !deleted.includes(m));
        return providerModels;
    })();

    const deleteModel = (modelToDelete: string) => {
        if (window.confirm(`Are you sure you want to remove '${modelToDelete}'?`)) {
            const updatedDeleted = { ...deletedModelsMap };
            if (!updatedDeleted[llmProvider]) updatedDeleted[llmProvider] = [];
            if (!updatedDeleted[llmProvider].includes(modelToDelete)) {
                updatedDeleted[llmProvider].push(modelToDelete);
            }
            setDeletedModelsMap(updatedDeleted);
            localStorage.setItem('deletedModelsMap', JSON.stringify(updatedDeleted));

            // If we deleted the active model, auto-switch to the next available one
            if (activeModel === modelToDelete || selectedModel === modelToDelete) {
                const added = customModelsMap[llmProvider] || [];
                const remainingModels = [...new Set([...baseModels, ...added])].filter(m => !updatedDeleted[llmProvider].includes(m));
                const nextModel = remainingModels.length > 0 ? remainingModels[0] : "";
                setSelectedModel(nextModel);
            }
        }
    };

    // Auto-save handler for provider change
    const handleProviderChange = (newProvider: string) => {
        setLlmProvider(newProvider);
        setFetchError(null);
        // Clear selected model when provider changes to avoid invalid model
        setSelectedModel("");
    };

    function getCurrentApiKeyValue() {
        if (llmProvider === 'gemini') return apiKey;
        if (llmProvider === 'openai') return openAiApiKey;
        if (llmProvider === 'anthropic') return anthropicApiKey;
        if (llmProvider === 'groq') return groqApiKey;
        return huggingFaceApiKey;
    }

    // Sync local draft when provider switches
    useEffect(() => {
        setLocalApiKeyDraft(getCurrentApiKeyValue());
        setApiKeySaved(false);
    }, [llmProvider]);

    const saveApiKey = () => {
        if (llmProvider === 'gemini') setApiKey(localApiKeyDraft);
        else if (llmProvider === 'openai') setOpenAiApiKey(localApiKeyDraft);
        else if (llmProvider === 'anthropic') setAnthropicApiKey(localApiKeyDraft);
        else if (llmProvider === 'groq') setGroqApiKey(localApiKeyDraft);
        else setHuggingFaceApiKey(localApiKeyDraft);
        setApiKeySaved(true);
        setTimeout(() => setApiKeySaved(false), 2000);
    };

    const addNewModel = () => {
        const newModel = newModelInput.trim();
        if (!newModel) return;

        const updatedCustom = { ...customModelsMap };
        if (!updatedCustom[llmProvider]) updatedCustom[llmProvider] = [];
        if (!updatedCustom[llmProvider].includes(newModel)) {
            updatedCustom[llmProvider].push(newModel);
        }
        setCustomModelsMap(updatedCustom);
        localStorage.setItem('customModelsMap', JSON.stringify(updatedCustom));

        if (deletedModelsMap[llmProvider]?.includes(newModel)) {
            const updatedDeleted = { ...deletedModelsMap };
            updatedDeleted[llmProvider] = updatedDeleted[llmProvider].filter(m => m !== newModel);
            setDeletedModelsMap(updatedDeleted);
            localStorage.setItem('deletedModelsMap', JSON.stringify(updatedDeleted));
        }

        setNewModelInput('');
        setShowNewModelInput(false);
        setSelectedModel(newModel);
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
                            value={llmProvider}
                            onChange={(e) => handleProviderChange(e.target.value)}
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
                            <span>{llmProvider === 'gemini' ? 'Gemini ' : llmProvider === 'openai' ? 'OpenAI ' : llmProvider === 'anthropic' ? 'Anthropic ' : llmProvider === 'groq' ? 'Groq ' : 'Hugging Face '}API Key</span>
                        </label>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input
                                type="password"
                                className="settings-input"
                                style={{ flex: 1, margin: 0 }}
                                placeholder={`Enter your ${llmProvider === 'gemini' ? 'Gemini' : llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'anthropic' ? 'Anthropic' : llmProvider === 'groq' ? 'Groq' : 'Hugging Face'} API Key`}
                                value={localApiKeyDraft}
                                onChange={(e) => { setLocalApiKeyDraft(e.target.value); setApiKeySaved(false); }}
                                onKeyDown={(e) => { if (e.key === 'Enter') saveApiKey(); }}
                            />
                            <button
                                onClick={saveApiKey}
                                title="Save API Key"
                                style={{
                                    flexShrink: 0,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    padding: '8px 14px', borderRadius: 6,
                                    border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                    backgroundColor: apiKeySaved ? 'var(--accent-color)' : 'var(--accent-color)',
                                    color: 'white',
                                    opacity: apiKeySaved ? 0.85 : 1,
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                {apiKeySaved ? <><Check size={14} /> Saved</> : 'Save'}
                            </button>
                        </div>
                        {fetchError && llmProvider === "gemini" && (
                            <div style={{ color: "#ff6b6b", fontSize: "0.8rem", marginTop: 4 }}>
                                ⚠️ {fetchError}
                            </div>
                        )}
                        <p className="setting-hint">
                            Your key is stored locally on your device.
                            {llmProvider === "gemini" && (
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
                            {llmProvider === "openai" && (
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
                            {llmProvider === "anthropic" && (
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
                            {llmProvider === "groq" && (
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
                            {llmProvider === "huggingface" && (
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

                            {isLoadingModels && llmProvider === "gemini" && (
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
                                                    if (e.key === 'Enter') addNewModel();
                                                    if (e.key === 'Escape') { setShowNewModelInput(false); setNewModelInput(''); }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                onClick={(e) => { e.stopPropagation(); addNewModel(); }}
                                                style={{
                                                    padding: '0.4rem 0.6rem', backgroundColor: 'var(--accent-color)', color: 'white',
                                                    border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem'
                                                }}
                                            >
                                                Add
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
                            {isLoadingModels && llmProvider === "gemini" ? "Checking availability..." : `Choose a specific ${llmProvider === 'gemini' ? 'Gemini' : llmProvider === 'openai' ? 'OpenAI' : llmProvider === 'anthropic' ? 'Anthropic' : llmProvider === 'groq' ? 'Groq' : 'Hugging Face'} model or let the system auto-select.`}
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
            </div>
        </div>
    );
}
