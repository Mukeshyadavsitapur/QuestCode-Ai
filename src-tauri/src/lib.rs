use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;
use std::process::Stdio;
use tauri::State;
use tokio::process::Command as TokioCommand;
use tokio::sync::{oneshot, Mutex};
// actually simple std::fs::write is fine for small files.

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GenerationConfig {
    temperature: Option<f32>,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
    #[serde(skip_serializing_if = "Option::is_none")]
    #[serde(rename = "generationConfig")] // Keep JSON key as camelCase for API
    generation_config: Option<GenerationConfig>,
}

#[derive(Deserialize)]
struct GeminiResponsePart {
    text: String,
}

#[derive(Deserialize)]
struct GeminiResponseContent {
    parts: Vec<GeminiResponsePart>,
}

#[derive(Deserialize)]
struct GeminiResponseCandidate {
    content: GeminiResponseContent,
}

#[derive(Deserialize)]
struct GeminiResponse {
    candidates: Option<Vec<GeminiResponseCandidate>>,
}

#[derive(Serialize)]
struct AIResponse {
    content: String,
    model: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct GeminiModel {
    name: String,
    supported_generation_methods: Vec<String>,
}

#[derive(Deserialize)]
struct GeminiModelList {
    models: Vec<GeminiModel>,
}

// Global state to manage the running process cancellation and adaptive model priority
struct AppState {
    stop_tx: Mutex<Option<oneshot::Sender<()>>>,
}

async fn fetch_gemini_models_raw(api_key: &str) -> Result<Vec<String>, String> {
    let client = Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models?key={}",
        api_key
    );

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API Error: {}", error_text));
    }

    let model_list: GeminiModelList = response
        .json()
        .await
        .map_err(|e| format!("Parse error: {}", e))?;

    // Basic structural filter for "generateContent" and Gemini naming
    let models: Vec<String> = model_list
        .models
        .into_iter()
        .filter(|m| {
            let name = m.name.to_lowercase();
            m.supported_generation_methods
                .contains(&"generateContent".to_string())
                && !name.contains("tts")
                && !name.contains("embedding")
                && name.contains("gemini")
        })
        .map(|m| m.name.replace("models/", ""))
        .collect();

    Ok(models)
}

async fn call_gemini(
    api_key: &str,
    prompt: &str,
    selected_model: Option<String>,
    temperature: Option<f32>,
) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing. Please add it in Settings.".to_string());
    }

    // 1. Fetch available models
    let all_models = match fetch_gemini_models_raw(api_key).await {
        Ok(m) => m,
        Err(e) => {
            println!(
                "⚠️ Failed to fetch models dynamically: {}. Using hardcoded fallbacks.",
                e
            );
            vec![
                "gemini-2.0-flash".to_string(),
                "gemini-1.5-flash".to_string(),
            ]
        }
    };

    println!("Available models from API: {:?}", all_models);

    // 2. Build the "Smart Chain"
    let mut execution_chain = Vec::new();

    // Strategy:
    // Priority 1: User Selected Model (Specific)
    // Priority 2: All models in the SAME version family as selected (e.g. all 2.5s)
    // Priority 3: 3.0 Family
    // Priority 4: 2.5 Family
    // Priority 5: 2.0 Family
    // Priority 6: 1.5 Family (Deep fallback)

    let mut selected_family = None;
    if let Some(ref m) = selected_model {
        let m_clean = m.replace("models/", "");
        if m_clean.contains("1.5") {
            selected_family = Some("1.5");
        } else if m_clean.contains("2.0") {
            selected_family = Some("2.0");
        } else if m_clean.contains("2.5") {
            selected_family = Some("2.5");
        } else if m_clean.contains("3.0") {
            selected_family = Some("3.0");
        }

        // Add specific selected model first (Priority 1)
        execution_chain.push(m_clean);
    }

    // Helper to add unique models from a family
    let add_family = |chain: &mut Vec<String>, family: &str| {
        let mut family_models: Vec<String> = all_models
            .iter()
            .filter(|m| m.contains(family))
            .cloned()
            .collect();

        family_models.sort_by(|a, b| b.cmp(a));

        for m in family_models {
            if !chain.contains(&m) {
                chain.push(m);
            }
        }
    };

    // Priority 2: Selected Family
    if let Some(fam) = selected_family {
        add_family(&mut execution_chain, fam);
    }

    // Priority 3-6: Default Cascade (3.0 -> 2.5 -> 2.0 -> 1.5)
    let default_order = vec!["3.0", "2.5", "2.0", "1.5"];
    for fam in default_order {
        add_family(&mut execution_chain, fam);
    }

    println!("🔗 Final Execution Chain: {:?}", execution_chain);

    let mut last_error = "No response generated.".to_string();

    for model in &execution_chain {
        println!(
            "Attempting request with model: {}, temp: {:?}",
            model, temperature
        );
        let client = Client::new();
        let model_path = if model.starts_with("models/") {
            model.to_string()
        } else {
            format!("models/{}", model)
        };

        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/{}:generateContent?key={}",
            model_path, api_key
        );

        let mut request_body = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: prompt.to_string(),
                }],
            }],
            generation_config: None,
        };

        if let Some(temp) = temperature {
            request_body.generation_config = Some(GenerationConfig {
                temperature: Some(temp),
            });
        }

        let response_res = client.post(&url).json(&request_body).send().await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue; // Try next model
            }
        };

        if response.status().is_success() {
            let gemini_resp: GeminiResponse = response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;

            if let Some(candidates) = gemini_resp.candidates {
                if let Some(first_candidate) = candidates.first() {
                    if let Some(first_part) = first_candidate.content.parts.first() {
                        println!("✅ SUCCESS: Response received from model: {}", model);

                        return Ok(AIResponse {
                            content: first_part.text.clone(),
                            model: model.to_string(),
                        });
                    }
                }
            }
            println!(
                "⚠️ WARNING: Parse success but no content in candidates for {}",
                model
            );
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);

            if status.is_success() {
                return Err(last_error);
            }
            println!(
                "🔄 FALLBACK: Model {} failed with {}. Trying next...",
                model, status
            );
        }
    }

    Err(format!(
        "Request failed after trying chain: {:?}. Last error: {}",
        execution_chain, last_error
    ))
}

#[tauri::command]
async fn get_available_models(api_key: String) -> Result<Vec<String>, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing.".to_string());
    }

    let all_models = fetch_gemini_models_raw(&api_key).await?;

    // Filter for UI: Keep 2.5 and newer (exclude 1.0, 1.5, 2.0)
    let ui_models: Vec<String> = all_models
        .into_iter()
        .filter(|name| !name.contains("1.0") && !name.contains("1.5") && !name.contains("2.0"))
        .collect();

    Ok(ui_models)
}

// --- OpenAI Support ---
#[derive(Serialize, Deserialize)]
struct OpenAIMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct OpenAIRequest {
    model: String,
    messages: Vec<OpenAIMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

#[derive(Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

async fn call_openai(
    api_key: &str,
    prompt: &str,
    selected_model: Option<String>,
    temperature: Option<f32>,
) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("OpenAI API Key is missing. Please add it in Settings.".to_string());
    }

    let default_models = vec![
        "gpt-4o".to_string(),
        "chatgpt-4o-latest".to_string(),
        "gpt-4-turbo".to_string(),
        "gpt-4".to_string(),
        "gpt-3.5-turbo".to_string(),
    ];

    let mut execution_chain = Vec::new();

    if let Some(ref m) = selected_model {
        let m_clean = m.trim().to_string();
        execution_chain.push(m_clean);
    }

    for m in default_models {
        if !execution_chain.contains(&m) {
            execution_chain.push(m);
        }
    }

    println!("🔗 OpenAI Execution Chain: {:?}", execution_chain);
    let mut last_error = "No response generated.".to_string();

    for model in execution_chain {
        println!(
            "Attempting OpenAI request with model: {}, temp: {:?}",
            model, temperature
        );
        let client = Client::new();

        let request_body = OpenAIRequest {
            model: model.clone(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature,
        };

        let response_res = client
            .post("https://api.openai.com/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue;
            }
        };

        if response.status().is_success() {
            let openai_resp: OpenAIResponse = response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;
            if let Some(choice) = openai_resp.choices.first() {
                println!("✅ SUCCESS: Response received from OpenAI model: {}", model);
                return Ok(AIResponse {
                    content: choice.message.content.clone(),
                    model,
                });
            }
            println!(
                "⚠️ WARNING: Parse success but no valid choices returned for {}",
                model
            );
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);

            println!(
                "🔄 FALLBACK: OpenAI model {} failed with {}. Trying next...",
                model, status
            );
        }
    }

    Err(format!(
        "OpenAI request failed after trying chain. Last error: {}",
        last_error
    ))
}

// --- Anthropic Support ---
#[derive(Serialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct AnthropicRequest {
    model: String,
    messages: Vec<AnthropicMessage>,
    max_tokens: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Deserialize)]
struct AnthropicContentBlock {
    text: String,
}

#[derive(Deserialize)]
struct AnthropicResponse {
    content: Vec<AnthropicContentBlock>,
}

async fn call_anthropic(
    api_key: &str,
    prompt: &str,
    selected_model: Option<String>,
    temperature: Option<f32>,
) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("Anthropic API Key is missing. Please add it in Settings.".to_string());
    }

    let default_models = vec![
        "claude-3-5-sonnet-20241022".to_string(),
        "claude-3-5-haiku-20241022".to_string(),
        "claude-3-opus-20240229".to_string(),
        "claude-3-sonnet-20240229".to_string(),
        "claude-3-haiku-20240307".to_string(),
    ];

    let mut execution_chain = Vec::new();

    if let Some(ref m) = selected_model {
        let m_clean = m.trim().to_string();
        execution_chain.push(m_clean);
    }

    for m in default_models {
        if !execution_chain.contains(&m) {
            execution_chain.push(m);
        }
    }

    println!("🔗 Anthropic Execution Chain: {:?}", execution_chain);
    let mut last_error = "No response generated.".to_string();

    for model in execution_chain {
        println!(
            "Attempting Anthropic request with model: {}, temp: {:?}",
            model, temperature
        );
        let client = Client::new();

        let request_body = AnthropicRequest {
            model: model.clone(),
            messages: vec![AnthropicMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            max_tokens: 4096,
            temperature,
        };

        let response_res = client
            .post("https://api.anthropic.com/v1/messages")
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .json(&request_body)
            .send()
            .await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue; // Try next model
            }
        };

        if response.status().is_success() {
            let anthropic_resp: AnthropicResponse = response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;
            if let Some(block) = anthropic_resp.content.first() {
                println!(
                    "✅ SUCCESS: Response received from Anthropic model: {}",
                    model
                );
                return Ok(AIResponse {
                    content: block.text.clone(),
                    model,
                });
            }
            println!(
                "⚠️ WARNING: Parse success but no content returned for {}",
                model
            );
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);

            println!(
                "🔄 FALLBACK: Anthropic model {} failed with {}. Trying next...",
                model, status
            );
        }
    }

    Err(format!(
        "Anthropic request failed after trying chain. Last error: {}",
        last_error
    ))
}

// --- Groq Support ---
async fn call_groq(
    api_key: &str,
    prompt: &str,
    selected_model: Option<String>,
    temperature: Option<f32>,
) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("Groq API Key is missing.".to_string());
    }

    let default_models = vec![
        "openai/gpt-oss-20b".to_string(),
        "openai/gpt-oss-120b".to_string(),
        "openai/gpt-oss-safeguard-20b".to_string(),
        "moonshotai/kimi-k2-instruct-0905".to_string(),
        "meta-llama/llama-4-scout-17b-16e-instruct".to_string(),
        "llama-3.3-70b-versatile".to_string(),
        "llama-3.1-8b-instant".to_string(),
        "mixtral-8x7b-32768".to_string(),
        "gemma2-9b-it".to_string(),
    ];

    let mut execution_chain = Vec::new();

    if let Some(ref m) = selected_model {
        let m_clean = m.trim().to_string();
        execution_chain.push(m_clean);
    }

    for m in default_models {
        if !execution_chain.contains(&m) {
            execution_chain.push(m);
        }
    }

    println!("🔗 Groq Execution Chain: {:?}", execution_chain);
    let mut last_error = "No response generated.".to_string();

    for model in execution_chain {
        println!(
            "Attempting Groq request with model: {}, temp: {:?}",
            model, temperature
        );
        let client = Client::new();

        let request_body = OpenAIRequest {
            model: model.clone(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature,
        };

        let response_res = client
            .post("https://api.groq.com/openai/v1/chat/completions")
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue;
            }
        };

        if response.status().is_success() {
            let groq_resp: OpenAIResponse = response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;
            if let Some(choice) = groq_resp.choices.first() {
                println!("✅ SUCCESS: Response received from Groq model: {}", model);
                return Ok(AIResponse {
                    content: choice.message.content.clone(),
                    model,
                });
            }
            println!(
                "⚠️ WARNING: Parse success but no valid choices returned for {}",
                model
            );
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);

            println!(
                "🔄 FALLBACK: Groq model {} failed with {}. Trying next...",
                model, status
            );
        }
    }

    Err(format!(
        "Groq request failed after trying chain. Last error: {}",
        last_error
    ))
}

// --- Hugging Face Support ---
async fn call_huggingface(
    api_key: &str,
    prompt: &str,
    selected_model: Option<String>,
    temperature: Option<f32>,
) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("Hugging Face API Key is missing.".to_string());
    }

    let default_models = vec![
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-7B".to_string(),
        "Qwen/Qwen2.5-Coder-7B-Instruct".to_string(),
        "microsoft/phi-4-mini".to_string(),
        "meta-llama/Llama-3.1-8B-Instruct".to_string(),
        "google/gemma-2-9b-it".to_string(),
        "mistralai/Mistral-7B-Instruct-v0.3".to_string(),
        "bigcode/starcoder2-7b".to_string(),
        "ibm-granite/granite-3.0-8b-instruct".to_string(),
        "deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct".to_string(),
        "sentence-transformers/all-MiniLM-L6-v2".to_string(),
        "meta-llama/Llama-3.3-70B-Instruct".to_string(),
        "deepseek-ai/DeepSeek-R1-Distill-Qwen-32B".to_string(),
        "Qwen/Qwen2.5-72B-Instruct".to_string(),
        "mistralai/Mixtral-8x7B-Instruct-v0.1".to_string(),
    ];

    let mut execution_chain = Vec::new();

    if let Some(ref m) = selected_model {
        let m_clean = m.trim().to_string();
        execution_chain.push(m_clean);
    }

    for m in default_models {
        if !execution_chain.contains(&m) {
            execution_chain.push(m);
        }
    }

    println!("🔗 Hugging Face Execution Chain: {:?}", execution_chain);
    let mut last_error = "No response generated.".to_string();

    let url = "https://router.huggingface.co/v1/chat/completions";

    for model in execution_chain {
        println!(
            "Attempting Hugging Face request with model: {}, temp: {:?}",
            model, temperature
        );
        let client = Client::new();

        let request_body = OpenAIRequest {
            model: model.clone(),
            messages: vec![OpenAIMessage {
                role: "user".to_string(),
                content: prompt.to_string(),
            }],
            temperature: temperature.or(Some(0.1)), // HF often requires this
        };

        let response_res = client
            .post(url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request_body)
            .send()
            .await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue;
            }
        };

        if response.status().is_success() {
            let hf_resp: OpenAIResponse = response
                .json()
                .await
                .map_err(|e| format!("Parse error: {}", e))?;
            if let Some(choice) = hf_resp.choices.first() {
                println!(
                    "✅ SUCCESS: Response received from Hugging Face model: {}",
                    model
                );
                return Ok(AIResponse {
                    content: choice.message.content.clone(),
                    model,
                });
            }
            println!(
                "⚠️ WARNING: Parse success but no valid choices returned for {}",
                model
            );
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);

            println!(
                "🔄 FALLBACK: Hugging Face model {} failed with {}. Trying next...",
                model, status
            );
        }
    }

    Err(format!(
        "Hugging Face request failed after trying chain. Last error: {}",
        last_error
    ))
}

#[derive(Deserialize)]
struct AIRequest {
    api_key: String,
    provider: Option<String>,
    code: String,
    language: String,
    selected_model: Option<String>,
    temperature: Option<f32>,
}

#[derive(Deserialize)]
struct QuestionRequest {
    api_key: String,
    provider: Option<String>,
    code: String,
    question: String,
    language: String,
    selected_model: Option<String>,
    temperature: Option<f32>,
}

#[tauri::command]
async fn explain_code(req: AIRequest) -> Result<AIResponse, String> {
    let prompt = format!(
        "Explain this {} code in markdown format:\n\n```{}\n{}\n```",
        req.language, req.language, req.code
    );
    let provider = req.provider.as_deref().unwrap_or("groq");
    match provider {
        "openai" => call_openai(&req.api_key, &prompt, req.selected_model, req.temperature).await,
        "anthropic" => {
            call_anthropic(&req.api_key, &prompt, req.selected_model, req.temperature).await
        }
        "groq" => call_groq(&req.api_key, &prompt, req.selected_model, req.temperature).await,
        "huggingface" => {
            call_huggingface(&req.api_key, &prompt, req.selected_model, req.temperature).await
        }
        _ => call_gemini(&req.api_key, &prompt, req.selected_model, req.temperature).await,
    }
}

#[tauri::command]
async fn ask_question(req: QuestionRequest) -> Result<AIResponse, String> {
    let prompt = format!(
        "Given this {} code:\n\n```{}\n{}\n```\n\nQuestion: {}\n\nAnswer in markdown:",
        req.language, req.language, req.code, req.question
    );
    let provider = req.provider.as_deref().unwrap_or("groq");
    match provider {
        "openai" => call_openai(&req.api_key, &prompt, req.selected_model, req.temperature).await,
        "anthropic" => {
            call_anthropic(&req.api_key, &prompt, req.selected_model, req.temperature).await
        }
        "groq" => call_groq(&req.api_key, &prompt, req.selected_model, req.temperature).await,
        "huggingface" => {
            call_huggingface(&req.api_key, &prompt, req.selected_model, req.temperature).await
        }
        _ => call_gemini(&req.api_key, &prompt, req.selected_model, req.temperature).await,
    }
}

#[tauri::command]
async fn stop_execution(state: State<'_, AppState>) -> Result<(), String> {
    let mut lock = state.stop_tx.lock().await;
    if let Some(tx) = lock.take() {
        let _ = tx.send(()); // Send stop signal
        Ok(())
    } else {
        Ok(()) // No running process to stop
    }
}

#[tauri::command]
async fn execute_code(
    state: State<'_, AppState>,
    code: String,
    language: String,
) -> Result<String, String> {
    // 1. Create a temporary directory/file
    let mut temp_dir = env::temp_dir();
    temp_dir.push("rust_reader_pro_exec");

    // Ensure dir exists
    if !temp_dir.exists() {
        std::fs::create_dir(&temp_dir).map_err(|e| format!("Failed to create temp dir: {}", e))?;
    }

    let (tx, rx) = oneshot::channel();

    // Store the cancellation sender
    {
        let mut lock = state.stop_tx.lock().await;
        *lock = Some(tx);
    }

    let result = if language.to_lowercase() == "rust" {
        let file_path = temp_dir.join("main.rs");
        let exe_path = temp_dir.join("main.exe");

        // Write code to file (synchronously is fine for small files)
        if let Err(e) = std::fs::write(&file_path, &code) {
            return Err(format!("Failed to write code: {}", e));
        }

        // Compile using rustc (cancellable)
        let mut compile_cmd = TokioCommand::new("rustc");
        compile_cmd
            .arg(&file_path)
            .arg("-o")
            .arg(&exe_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        #[cfg(target_os = "windows")]
        compile_cmd.creation_flags(0x08000000);

        let compile_output = compile_cmd
            .output()
            .await
            .map_err(|e| format!("Failed to run rustc: {}. Is Rust installed?", e))?;

        if !compile_output.status.success() {
            Ok(format!(
                "Compilation Error:\n{}",
                String::from_utf8_lossy(&compile_output.stderr)
            ))
        } else {
            // Run the executable
            let mut run_cmd = TokioCommand::new(&exe_path);
            run_cmd
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);

            #[cfg(target_os = "windows")]
            run_cmd.creation_flags(0x08000000);

            let child = run_cmd
                .spawn()
                .map_err(|e| format!("Failed to spawn executable: {}", e))?;

            tokio::select! {
                output_res = child.wait_with_output() => {
                    match output_res {
                        Ok(output) => {
                            let stdout = String::from_utf8_lossy(&output.stdout);
                            let stderr = String::from_utf8_lossy(&output.stderr);
                            if !stderr.is_empty() {
                                Ok(format!("Output:\n{}\n\nErrors:\n{}", stdout, stderr))
                            } else {
                                Ok(stdout.to_string())
                            }
                        }
                        Err(e) => Err(format!("Execution failed: {}", e))
                    }
                }
                _ = rx => {
                    Ok("Execution Stopped by User.".to_string())
                }
            }
        }
    } else if language.to_lowercase() == "python" {
        let file_path = temp_dir.join("script.py");

        if let Err(e) = std::fs::write(&file_path, &code) {
            return Err(format!("Failed to write code: {}", e));
        }

        let python_cmds = if cfg!(target_os = "windows") {
            vec!["py", "python", "python3"]
        } else {
            vec!["python3", "python"]
        };

        let mut child_opt = None;
        let mut last_err = String::new();

        for cmd_name in python_cmds {
            let mut cmd = TokioCommand::new(cmd_name);
            cmd.arg(&file_path)
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);

            #[cfg(target_os = "windows")]
            cmd.creation_flags(0x08000000);

            match cmd.spawn() {
                Ok(child) => {
                    child_opt = Some(child);
                    break;
                }
                Err(e) => {
                    last_err = format!("Failed to start {}: {}", cmd_name, e);
                }
            }
        }

        let child = match child_opt {
            Some(c) => c,
            None => return Err(format!("Could not find a Python interpreter. {}", last_err)),
        };

        tokio::select! {
             output_res = child.wait_with_output() => {
                match output_res {
                    Ok(output) => {
                        let stdout = String::from_utf8_lossy(&output.stdout);
                        let stderr = String::from_utf8_lossy(&output.stderr);

                        // Check if Windows intercepted 'python' with the Store App Execution Alias
                        let is_store_alias_error = stderr.contains("Python was not found") && stderr.contains("Microsoft Store");

                        if is_store_alias_error {
                            return Ok(format!("Execution failed because Windows intercepted the 'python' command.\n\nTo fix this:\n1. Open Windows Settings > Apps > Advanced app settings > App execution aliases\n2. Turn OFF the aliases for 'python.exe' and 'python3.exe'.\n\nOriginal Error:\n{}", stderr));
                        }

                        if !stderr.is_empty() {
                            Ok(format!("Output:\n{}\n\nErrors:\n{}", stdout, stderr))
                        } else {
                            Ok(stdout.to_string())
                        }
                    }
                    Err(e) => Err(format!("Execution failed: {}", e))
                }
            }
            _ = rx => {
                Ok("Execution Stopped by User.".to_string())
            }
        }
    } else if language.to_lowercase() == "javascript" {
        let file_path = temp_dir.join("script.js");

        if let Err(e) = std::fs::write(&file_path, &code) {
            return Err(format!("Failed to write code: {}", e));
        }

        let mut cmd = TokioCommand::new("node"); // Assumes node is in PATH
        cmd.arg(&file_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true);

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

        let child = cmd
            .spawn()
            .map_err(|e| format!("Failed to run node: {}. Is Node.js installed?", e))?;

        tokio::select! {
             output_res = child.wait_with_output() => {
                match output_res {
                    Ok(output) => {
                        let stdout = String::from_utf8_lossy(&output.stdout);
                        let stderr = String::from_utf8_lossy(&output.stderr);
                        if !stderr.is_empty() {
                            Ok(format!("Output:\n{}\n\nErrors:\n{}", stdout, stderr))
                        } else {
                            Ok(stdout.to_string())
                        }
                    }
                    Err(e) => Err(format!("Execution failed: {}", e))
                }
            }
            _ = rx => {
                Ok("Execution Stopped by User.".to_string())
            }
        }
    } else if language.to_lowercase() == "html" {
        let file_path = temp_dir.join("index.html");
        if let Err(e) = std::fs::write(&file_path, &code) {
            return Err(format!("Failed to write code: {}", e));
        }

        // Open the file in the default browser using 'start' command on Windows
        // For cross-platform, we might need different commands (open on Mac, xdg-open on Linux)
        // Since user is on Windows:
        let mut cmd = TokioCommand::new("cmd");
        cmd.arg("/C").arg("start").arg(&file_path).arg(&file_path);

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

        match cmd.spawn() {
            Ok(_) => Ok("Opened index.html in your default browser.".to_string()),
            Err(e) => Err(format!("Failed to open browser: {}", e)),
        }
    } else if language.to_lowercase() == "css" {
        let file_path = temp_dir.join("style_preview.html");
        let html_content = format!(
            r#"<!DOCTYPE html>
<html>
<head>
<title>CSS Preview</title>
<style>
{}
</style>
</head>
<body>
    <h1>CSS Preview</h1>
    <p>The CSS you wrote is applied to this page.</p>
    <div class="container">
        <div class="box">Sample Box</div>
        <button>Sample Button</button>
        <input type="text" placeholder="Sample Input" />
    </div>
    <hr />
    <h2>Common Elements</h2>
    <ul>
        <li>List Item 1</li>
        <li>List Item 2</li>
    </ul>
</body>
</html>"#,
            code
        );

        if let Err(e) = std::fs::write(&file_path, &html_content) {
            return Err(format!("Failed to write preview file: {}", e));
        }

        let mut cmd = TokioCommand::new("cmd");
        cmd.arg("/C").arg("start").arg(&file_path).arg(&file_path);

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

        match cmd.spawn() {
            Ok(_) => Ok("Opened CSS preview in your default browser.".to_string()),
            Err(e) => Err(format!("Failed to open browser: {}", e)),
        }
    } else {
        Err(format!("Unsupported language: {}", language))
    };

    // Cleanup state
    {
        let mut lock = state.stop_tx.lock().await;
        *lock = None;
    }

    result
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_tts::init())
        .manage(AppState {
            stop_tx: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            explain_code,
            ask_question,
            execute_code,
            stop_execution,
            get_available_models
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
