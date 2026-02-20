use serde::{Deserialize, Serialize};
use reqwest::Client;
use std::process::Stdio;
use tokio::process::Command as TokioCommand;
use tokio::sync::{Mutex, oneshot};
use tauri::State;
use std::env;
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
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

    let response = client.get(&url)
        .send()
        .await
        .map_err(|e| format!("Network error: {}", e))?;

    if !response.status().is_success() {
        let error_text = response.text().await.unwrap_or_default();
        return Err(format!("API Error: {}", error_text));
    }

    let model_list: GeminiModelList = response.json().await.map_err(|e| format!("Parse error: {}", e))?;
    
    // Basic structural filter for "generateContent" and Gemini naming
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

async fn call_gemini(api_key: &str, prompt: &str, selected_model: Option<String>, temperature: Option<f32>) -> Result<AIResponse, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing. Please add it in Settings.".to_string());
    }

    // 1. Fetch available models
    let all_models = match fetch_gemini_models_raw(api_key).await {
        Ok(m) => m,
        Err(e) => {
            println!("⚠️ Failed to fetch models dynamically: {}. Using hardcoded fallbacks.", e);
            vec![
                "gemini-2.0-flash".to_string(), 
                "gemini-1.5-flash".to_string()
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
        if m_clean.contains("1.5") { selected_family = Some("1.5"); }
        else if m_clean.contains("2.0") { selected_family = Some("2.0"); }
        else if m_clean.contains("2.5") { selected_family = Some("2.5"); }
        else if m_clean.contains("3.0") { selected_family = Some("3.0"); }
        
        // Add specific selected model first (Priority 1)
        execution_chain.push(m_clean);
    }

    // Helper to add unique models from a family
    let mut add_family = |chain: &mut Vec<String>, family: &str| {
        let mut family_models: Vec<String> = all_models.iter()
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
        println!("Attempting request with model: {}, temp: {:?}", model, temperature);
        let client = Client::new();
        let model_path = if model.starts_with("models/") { model.to_string() } else { format!("models/{}", model) };
        
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

        let response_res = client.post(&url)
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
            
            if status.is_success() {
                 return Err(last_error);
            }
            println!("🔄 FALLBACK: Model {} failed with {}. Trying next...", model, status);
        }
    }

    Err(format!("Request failed after trying chain: {:?}. Last error: {}", execution_chain, last_error))
}

#[tauri::command]
async fn get_available_models(api_key: String) -> Result<Vec<String>, String> {
    if api_key.trim().is_empty() {
        return Err("API Key is missing.".to_string());
    }

    let all_models = fetch_gemini_models_raw(&api_key).await?;

    // Filter for UI: Keep 2.5 and newer (exclude 1.0, 1.5, 2.0)
    let ui_models: Vec<String> = all_models.into_iter()
        .filter(|name| {
            !name.contains("1.0") &&
            !name.contains("1.5") &&
            !name.contains("2.0")
        })
        .collect();

    Ok(ui_models)
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

        #[cfg(target_os = "windows")]
        compile_cmd.creation_flags(0x08000000); 

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

            #[cfg(target_os = "windows")]
            run_cmd.creation_flags(0x08000000);

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

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

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

        let child = cmd.spawn()
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
        cmd.arg("/C")
           .arg("start")
           .arg(&file_path)
           .arg(&file_path);

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

        match cmd.spawn() {
            Ok(_) => Ok("Opened index.html in your default browser.".to_string()),
            Err(e) => Err(format!("Failed to open browser: {}", e))
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
        cmd.arg("/C")
           .arg("start")
           .arg(&file_path)
           .arg(&file_path);

        #[cfg(target_os = "windows")]
        cmd.creation_flags(0x08000000);

        match cmd.spawn() {
            Ok(_) => Ok("Opened CSS preview in your default browser.".to_string()),
            Err(e) => Err(format!("Failed to open browser: {}", e))
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
