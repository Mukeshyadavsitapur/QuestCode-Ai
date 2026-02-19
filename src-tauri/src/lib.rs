use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::process::Stdio;
use tokio::process::Command as TokioCommand;
use tokio::sync::{Mutex, oneshot};
use tauri::State;
use std::env;
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

// Global state to manage the running process cancellation
struct AppState {
    stop_tx: Mutex<Option<oneshot::Sender<()>>>,
}

async fn call_gemini(api_key: &str, prompt: &str, selected_model: Option<String>, temperature: Option<f32>) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing. Please add it in Settings.".to_string());
    }

    // Default sequence of models to try if rate limited (429)
    // The user asked for "gemini 2.5 model" as default instead of 2.0.
    let mut models = vec![
        "gemini-2.5-flash".to_string(),
        "gemini-2.0-flash".to_string(), 
        "gemini-1.5-flash".to_string(), 
        "gemini-1.5-pro".to_string()
    ];
    
    // If user has a selected model, try it first
    if let Some(m) = selected_model {
        println!("User selected model: {}", m);
        // Strip the "models/" prefix if it exists in the API return but not our internal strings
        let m_clean = m.replace("models/", "");
        if !models.contains(&m_clean) {
            models.insert(0, m_clean);
        } else {
            // Move it to front
            models.retain(|x| x != &m_clean);
            models.insert(0, m_clean);
        }
    }

    println!("Model chain to try: {:?}", models);

    let mut last_error = "No response generated.".to_string();

    for model in &models {
        println!("Attempting request with model: {}, temp: {:?}", model, temperature);
        let client = Client::new();
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model, api_key
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
             println!("Using temperature: {}", temp);
             request_body.generation_config = Some(GenerationConfig {
                temperature: Some(temp),
            });
        } else {
             println!("Using default temperature (None)");
        }

        let response_res = client.post(&url)
            .json(&request_body)
            .send()
            .await;

        let response = match response_res {
            Ok(resp) => resp,
            Err(e) => {
                last_error = format!("Network error for {}: {}", model, e);
                continue; // Try next model on network error as well
            }
        };

        if response.status().is_success() {
            let gemini_resp: GeminiResponse = response.json().await.map_err(|e| format!("Parse error: {}", e))?;

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
            println!("⚠️ WARNING: Parse success but no content in candidates for {}", model);
        } else {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            last_error = format!("Model {} Error ({}): {}", model, status, error_text);
            
            // Only fallback if status is 429 (Too Many Requests) or a network error occurred
            if status.as_u16() != 429 {
                println!("❌ ERROR: Model {} failed with {}. No fallback triggered.", model, status);
                return Err(last_error);
            }
            println!("🔄 FALLBACK: Model {} rate-limited (429). Trying next in chain...", model);
        }
    }

    Err(format!("Request failed after trying multiple models. Last error: {}", last_error))
}

#[tauri::command]
async fn get_available_models(api_key: String) -> Result<Vec<String>, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing.".to_string());
    }

    let client = Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models?key={}",
        api_key
    );

    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API Error: {}", error_text));
    }

    let model_list: GeminiModelList = response.json().await.map_err(|e| format!("Parse error: {}", e))?;
    
    // Filter for models that:
    // 1. Are "gemini" models
    // 2. Support "generateContent"
    // 3. Are NOT specifically for TTS or other non-text modalities
    let models: Vec<String> = model_list.models.into_iter()
        .filter(|m| {
            let name = m.name.to_lowercase();
            m.supported_generation_methods.contains(&"generateContent".to_string()) &&
            !name.contains("tts") &&
            !name.contains("embedding") &&
            name.contains("gemini")
        })
        .map(|m| m.name.replace("models/", ""))
        .collect();

    Ok(models)
}

#[derive(Deserialize)]
struct AIRequest {
    api_key: String,
    code: String,
    language: String,
    selected_model: Option<String>,
    temperature: Option<f32>,
}

#[derive(Deserialize)]
struct QuestionRequest {
    api_key: String,
    code: String,
    question: String,
    language: String,
    selected_model: Option<String>,
    temperature: Option<f32>,
}

#[tauri::command]
async fn explain_code(req: AIRequest) -> Result<AIResponse, String> {
    let prompt = format!("Explain this {} code in markdown format:\n\n```{}\n{}\n```", req.language, req.language, req.code);
    call_gemini(&req.api_key, &prompt, req.selected_model, req.temperature).await
}

#[tauri::command]
async fn ask_question(req: QuestionRequest) -> Result<AIResponse, String> {
    let prompt = format!("Given this {} code:\n\n```{}\n{}\n```\n\nQuestion: {}\n\nAnswer in markdown:", req.language, req.language, req.code, req.question);
    call_gemini(&req.api_key, &prompt, req.selected_model, req.temperature).await
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
async fn execute_code(state: State<'_, AppState>, code: String, language: String) -> Result<String, String> {
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
        compile_cmd.arg(&file_path)
            .arg("-o")
            .arg(&exe_path)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .kill_on_drop(true); 

        let compile_output = compile_cmd.output().await
            .map_err(|e| format!("Failed to run rustc: {}. Is Rust installed?", e))?;

        if !compile_output.status.success() {
             Ok(format!("Compilation Error:\n{}", String::from_utf8_lossy(&compile_output.stderr)))
        } else {
            // Run the executable
            let mut run_cmd = TokioCommand::new(&exe_path);
            run_cmd.stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .kill_on_drop(true);

            let child = run_cmd.spawn()
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

        let mut cmd = TokioCommand::new("python");
        cmd.arg(&file_path)
           .stdout(Stdio::piped())
           .stderr(Stdio::piped())
           .kill_on_drop(true);

        let child = cmd.spawn()
            .map_err(|e| format!("Failed to run python: {}. Is Python installed?", e))?;

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
        .manage(AppState { stop_tx: Mutex::new(None) })
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
