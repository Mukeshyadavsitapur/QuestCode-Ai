use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Serialize)]
struct GeminiPart {
    text: String,
}

#[derive(Serialize)]
struct GeminiContent {
    parts: Vec<GeminiPart>,
}

#[derive(Serialize)]
struct GeminiRequest {
    contents: Vec<GeminiContent>,
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

async fn call_gemini(api_key: &str, prompt: &str, selected_model: Option<String>) -> Result<AIResponse, String> {
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
        println!("Attempting request with model: {}", model);
        let client = Client::new();
        let url = format!(
            "https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent?key={}",
            model, api_key
        );

        let request_body = GeminiRequest {
            contents: vec![GeminiContent {
                parts: vec![GeminiPart {
                    text: prompt.to_string(),
                }],
            }],
        };

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
}

#[derive(Deserialize)]
struct QuestionRequest {
    api_key: String,
    code: String,
    question: String,
    language: String,
    selected_model: Option<String>,
}

#[tauri::command]
async fn explain_code(req: AIRequest) -> Result<AIResponse, String> {
    let prompt = format!("Explain this {} code in markdown format:\n\n```{}\n{}\n```", req.language, req.language, req.code);
    call_gemini(&req.api_key, &prompt, req.selected_model).await
}

#[tauri::command]
async fn ask_question(req: QuestionRequest) -> Result<AIResponse, String> {
    let prompt = format!("Given this {} code:\n\n```{}\n{}\n```\n\nQuestion: {}\n\nAnswer in markdown:", req.language, req.language, req.code, req.question);
    call_gemini(&req.api_key, &prompt, req.selected_model).await
}

use std::process::Command;
use std::io::Write;
use std::fs::File;
use std::env;

#[tauri::command]
async fn execute_code(code: String, language: String) -> Result<String, String> {
    // 1. Create a temporary directory/file
    let mut temp_dir = env::temp_dir();
    temp_dir.push("rust_reader_pro_exec");
    
    // Ensure dir exists
    if !temp_dir.exists() {
        std::fs::create_dir(&temp_dir).map_err(|e| format!("Failed to create temp dir: {}", e))?;
    }

    if language.to_lowercase() == "rust" {
        let file_path = temp_dir.join("main.rs");
        let exe_path = temp_dir.join("main.exe"); // Windows extension

        // Write code to file
        let mut file = File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
        file.write_all(code.as_bytes()).map_err(|e| format!("Failed to write code: {}", e))?;

        // Compile using rustc
        let compile_output = Command::new("rustc")
            .arg(&file_path)
            .arg("-o")
            .arg(&exe_path)
            .output()
            .map_err(|e| format!("Failed to run rustc: {}. Is Rust installed?", e))?;

        if !compile_output.status.success() {
            return Ok(format!("Compilation Error:\n{}", String::from_utf8_lossy(&compile_output.stderr)));
        }

        // Run the executable
        let run_output = Command::new(&exe_path)
            .output()
            .map_err(|e| format!("Failed to run executable: {}", e))?;

        let stdout = String::from_utf8_lossy(&run_output.stdout);
        let stderr = String::from_utf8_lossy(&run_output.stderr);

        if !stderr.is_empty() {
            Ok(format!("Output:\n{}\n\nErrors:\n{}", stdout, stderr))
        } else {
            Ok(stdout.to_string())
        }
    } else if language.to_lowercase() == "python" {
        let file_path = temp_dir.join("script.py");

        // Write code to file
        let mut file = File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;
        file.write_all(code.as_bytes()).map_err(|e| format!("Failed to write code: {}", e))?;

        // Run using python
        let run_output = Command::new("python")
            .arg(&file_path)
            .output()
            .map_err(|e| format!("Failed to run python: {}. Is Python installed?", e))?;

        let stdout = String::from_utf8_lossy(&run_output.stdout);
        let stderr = String::from_utf8_lossy(&run_output.stderr);

        if !stderr.is_empty() {
            Ok(format!("Output:\n{}\n\nErrors:\n{}", stdout, stderr))
        } else {
            Ok(stdout.to_string())
        }
    } else {
        Err(format!("Unsupported language: {}", language))
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![explain_code, ask_question, execute_code, get_available_models])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
