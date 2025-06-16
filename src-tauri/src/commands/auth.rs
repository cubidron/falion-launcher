use lyceris::auth::microsoft::{authenticate, create_link, MinecraftAccount};
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, State, Url, WebviewUrl, WebviewWindowBuilder};

use crate::AppState;

static AUTH_WINDOW_LABEL: &str = "authenticate";

#[derive(Serialize, Deserialize)]
pub struct User {
    access_token: Option<String>,
    refresh_token: Option<String>,
    uuid: Option<String>,
    username: String,
    exp: Option<u64>,
}

impl From<MinecraftAccount> for User {
    fn from(value: MinecraftAccount) -> Self {
        Self {
            access_token: Some(value.access_token),
            refresh_token: Some(value.refresh_token),
            uuid: Some(value.uuid),
            username: value.username,
            exp: Some(value.exp),
        }
    }
}

/// Handles the Microsoft authentication flow.
///
/// This function creates a new window for the Microsoft login page. Once the user
/// authenticates, it captures the authorization code, exchanges it for a Minecraft
/// account, and saves the account details to the store.
#[tauri::command]
pub async fn microsoft_auth(
    app: AppHandle,
    app_state: State<'_, AppState>,
) -> crate::Result<Option<User>> {
    let auth_error = |err: &str| crate::Error::General(format!("Authentication error: {}", err));
    let auth_link = create_link()?
        .parse::<Url>()
        .map_err(|_| auth_error("could not parse authentication url"))?;

    let (tx, mut rx) = tauri::async_runtime::channel(1);

    WebviewWindowBuilder::new(&app, AUTH_WINDOW_LABEL, WebviewUrl::External(auth_link))
        .title("Authenticate with Microsoft")
        .inner_size(800.0, 600.0)
        .center()
        .focused(true)
        .on_page_load(move |win, payload| {
            if let Some((_, code)) = payload.url().query_pairs().find(|(key, _)| key == "code") {
                let _ = tx.try_send(code.into_owned());
                let _ = win.close();
            }
        })
        .build()
        .map_err(|_| auth_error("Failed to build the authentication window."))?;

    if let Some(code) = rx.recv().await {
        Ok(Some(authenticate(code, &app_state.client).await?.into()))
    } else {
        Ok(None)
    }
}
