use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
};
use tauri_plugin_window_state::{StateFlags, WindowExt};

mod settings;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // Quando uma segunda instância é detectada, foca a janela existente
            if let Some(window) = app.get_webview_window("main") {
                window.unminimize().ok();
                window.show().ok();
                window.set_focus().ok();
            }
        }))
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            let window = app
                .get_webview_window("main")
                .expect("main window not found");

            // Restaura a última posição
            window.restore_state(StateFlags::POSITION).ok();

            // Configura propriedades da janela
            window.set_title("No Ponto")?;
            window.set_size(tauri::Size::Physical(tauri::PhysicalSize {
                width: 420,
                height: 588,
            }))?;
            window.set_decorations(false)?;
            window.set_resizable(false)?;
            window.set_fullscreen(false)?;
            window.set_maximizable(false)?;

            let open_i = MenuItem::with_id(app, "open", "Exibir Janela", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open_i, &quit_i])?;

            let tray_icon = app.default_window_icon().unwrap().clone();
            let _tray = TrayIconBuilder::new()
                .icon(tray_icon)
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_tray_icon_event(|tray, event| {
                    if let tauri::tray::TrayIconEvent::Click { button, .. } = event {
                        if button == tauri::tray::MouseButton::Left {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                window.unminimize().ok();
                                window.show().ok();
                                window.set_focus().ok();
                            }
                        }
                    }
                })
                .on_menu_event(|app, event| {
                    if event.id == "open" {
                        if let Some(window) = app.get_webview_window("main") {
                            window.unminimize().ok();
                            window.show().ok();
                            window.set_focus().ok();
                        }
                    }
                    if event.id == "quit" {
                        app.exit(0);
                    }
                })
                .build(app)?;

            // Intercepta o evento de fechar a janela para apenas escondê-la
            window.on_window_event(|event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    // Previne o fechamento padrão
                    api.prevent_close();
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested{ api, .. } => {
                api.prevent_close();
                window.hide().unwrap();
            }
            _ => {}
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            settings::save_settings,
            settings::load_settings
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
