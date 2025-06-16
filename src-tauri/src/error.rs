use serde::{ser::SerializeStruct, Serialize};
use strum_macros::IntoStaticStr;

#[derive(thiserror::Error, Debug, IntoStaticStr)]
pub enum Error {
    #[error("There was an error in Tauri framework: {0}")]
    Tauri(#[from] tauri::Error),
    #[error("There was an error in core library: {0}")]
    Core(#[from] lyceris::Error),
    #[error("There was an error in store operations: {0}")]
    Store(#[from] tauri_plugin_store::Error),
    #[error("There was an error in JSON operations: {0}")]
    Serde(#[from] serde_json::Error),
    #[error("There was an error in IO opeartions: {0}")]
    Io(#[from] std::io::Error),
    #[error("{0}")]
    General(String),
}

impl Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let mut error = serializer.serialize_struct("Error", 2)?;

        error.serialize_field::<&'static str>("type", &self.into())?;
        error.serialize_field("message", &self.to_string())?;
        error.end()
    }
}
