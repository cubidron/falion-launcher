use std::{path::PathBuf, sync::LazyLock};
use tauri::{command, Emitter, State, Window};

use crate::AppState;
use lyceris::minecraft::emitter::Emitter as LycerisEmitter;

const EMITTER: LazyLock<LycerisEmitter> = LazyLock::new(LycerisEmitter::default);

#[command]
pub async fn download_file(
    window: Window,
    state: State<'_, AppState>,
    url: String,
    destination: String,
) -> crate::Result<u64> {
    let dest_path = PathBuf::from(destination);

    EMITTER
        .on(
            lyceris::minecraft::emitter::Event::SingleDownloadProgress,
            move |(path, current, total): (String, u64, u64)| {
                window
                    .emit("download_progress", (path, current, total))
                    .unwrap();
            },
        )
        .await;

    Ok(
        lyceris::http::downloader::download(&url, &dest_path, Some(&EMITTER), Some(&state.client))
            .await?,
    )
}
