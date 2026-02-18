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

async fn call_gemini(api_key: &str, prompt: &str) -> Result<String, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing. Please add it in Settings.".to_string());
    }

    let client = Client::new();
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={}",
        api_key
    );

    let request_body = GeminiRequest {
        contents: vec![GeminiContent {
            parts: vec![GeminiPart {
                text: prompt.to_string(),
            }],
        }],
    };

    let response = client.post(&url)
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
         let error_text = response.text().await.unwrap_or_default();
         return Err(format!("API Error: {}", error_text));
    }

    let gemini_resp: GeminiResponse = response.json().await.map_err(|e| format!("Parse error: {}", e))?;

    if let Some(candidates) = gemini_resp.candidates {
        if let Some(first_candidate) = candidates.first() {
            if let Some(first_part) = first_candidate.content.parts.first() {
                return Ok(first_part.text.clone());
            }
        }
    }

    Ok("No response generated.".to_string())
}

#[tauri::command]
async fn explain_code(api_key: String, code: String, language: String) -> Result<String, String> {
    let prompt = format!("Explain this {} code in markdown format:\n\n```{}\n{}\n```", language, language, code);
    call_gemini(&api_key, &prompt).await
}

#[tauri::command]
async fn ask_question(api_key: String, code: String, question: String, language: String) -> Result<String, String> {
    let prompt = format!("Given this {} code:\n\n```{}\n{}\n```\n\nQuestion: {}\n\nAnswer in markdown:", language, language, code, question);
    call_gemini(&api_key, &prompt).await
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
        .invoke_handler(tauri::generate_handler![explain_code, ask_question, execute_code])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
