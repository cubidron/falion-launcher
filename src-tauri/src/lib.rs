pub mod commands;
mod error;
pub mod helpers;

use std::env::consts::{ARCH, OS};

use error::Error;
use reqwest::{Client, ClientBuilder};
use tauri::Manager;
use tauri_plugin_store::StoreExt;

pub type Result<T> = std::result::Result<T, crate::error::Error>;

pub struct AppState {
    client: Client,
}

pub static STORE_FILE: &str = "store.json";

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_drpc::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_os::init())
        .setup(|app| {
            // Load store or create a new one.
            app.store(STORE_FILE)?;

            let client = ClientBuilder::new()
                .user_agent(format!(
                    "{}/{} {}-{}",
                    env!("CARGO_PKG_NAME"),
                    env!("CARGO_PKG_VERSION"),
                    OS,
                    ARCH
                ))
                .build()?;

            app.manage(AppState { client });

            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::auth::microsoft_auth,
            commands::launch::launch_minecraft,
            commands::download::download_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
