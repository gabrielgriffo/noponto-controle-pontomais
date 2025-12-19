use tauri::Manager;
use tauri_plugin_window_state::{WindowExt, StateFlags};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            // Restaura o estado salvo (posição, tamanho, etc)
            window.restore_state(StateFlags::all()).ok();

            // força layout após restaurar
            window.set_resizable(false)?;
            window.set_decorations(false)?;
            window.set_size(tauri::Size::Logical(
                tauri::LogicalSize {
                    width: 420.0,
                    height: 620.0,
                },
            ))?;

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
