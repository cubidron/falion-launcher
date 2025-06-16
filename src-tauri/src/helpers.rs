use std::path::{PathBuf, MAIN_SEPARATOR_STR};

use lyceris::{
    download_multiple,
    minecraft::{emitter::Emitter as LycerisEmitter, install::FileType},
};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::fs;

use crate::commands::launch::OptionalMod;

pub fn get_loader_by(
    r#type: &str,
    version: &str,
) -> Option<Box<dyn lyceris::minecraft::loader::Loader>> {
    match r#type {
        "fabric" => Some(Box::new(lyceris::minecraft::loader::fabric::Fabric(
            version.to_string(),
        ))),
        "forge" => Some(Box::new(lyceris::minecraft::loader::forge::Forge(
            version.to_string(),
        ))),
        "neoforge" => Some(Box::new(lyceris::minecraft::loader::neoforge::NeoForge(
            version.to_string(),
        ))),
        "quilt" => Some(Box::new(lyceris::minecraft::loader::quilt::Quilt(
            version.to_string(),
        ))),
        _ => None,
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RemoteFile {
    path: String,
    name: String,
    hash: String,
}

pub async fn list_files_recursively(dir: PathBuf) -> crate::Result<Vec<PathBuf>> {
    let mut files = vec![];
    let mut dir_entries = fs::read_dir(&dir).await?;
    while let Some(entry) = dir_entries.next_entry().await? {
        let path = entry.path();
        if path.is_file() {
            files.push(path);
        } else if path.is_dir() {
            let mut sub_dir_files = Box::pin(list_files_recursively(path)).await?;
            files.append(&mut sub_dir_files);
        }
    }
    Ok(files)
}

pub async fn set_optional_mods(
    profile_dir: PathBuf,
    optional_mods: &Vec<OptionalMod>,
) -> crate::Result<()> {
    let mods_dir = profile_dir.join("mods");
    if !mods_dir.exists() {
        fs::create_dir_all(&mods_dir).await?;
    }

    for optional_mod in optional_mods {
        let mod_path = mods_dir.join(&optional_mod.file_name);
        let ignored_mod_path = mods_dir.join(format!("{}.ignored", &optional_mod.file_name));
        if optional_mod.enabled {
            if ignored_mod_path.exists() {
                fs::rename(&ignored_mod_path, &mod_path).await?;
            }
        } else if mod_path.exists() {
            fs::rename(&mod_path, &ignored_mod_path).await?;
        }
    }

    Ok(())
}

pub async fn synchronize_files(
    remote_url: String,
    profile_dir: PathBuf,
    profile_name: String,
    exclude: Vec<String>,
    optional_mods: &[OptionalMod],
    emitter: LycerisEmitter,
    client: Client,
) -> crate::Result<()> {
    let remote_files: Vec<RemoteFile> = lyceris::http::fetch::fetch(
        format!("{}/files/?directory={}", remote_url, profile_name),
        Some(&client),
    )
    .await?;

    if !profile_dir.exists() {
        fs::create_dir_all(&profile_dir).await?;
    }

    let mut local_files = vec![];
    let mut dir_entries = fs::read_dir(&profile_dir).await?;
    while let Some(entry) = dir_entries.next_entry().await? {
        let path = entry.path();
        if path.is_file() {
            local_files.push(path);
        } else if path.is_dir() {
            let mut sub_dir_files = list_files_recursively(path).await?;
            local_files.append(&mut sub_dir_files);
        }
    }

    let mods_dir = profile_dir.join("mods");

    let mut files_to_be_downloaded = vec![];

    for remote_file in &remote_files {
        let local_path = profile_dir.join(&remote_file.path);
        let ignored_path = if local_path.starts_with(&mods_dir) {
            Some(mods_dir.join(format!("{}.ignored", &remote_file.name)))
        } else {
            None
        };

        let should_download = if let Some(ignored_path) = &ignored_path {
            !local_path.exists() && !ignored_path.exists()
        } else {
            !local_path.exists()
        };

        if should_download {
            if let Some(optional) = optional_mods
                .iter()
                .find(|om| om.file_name == remote_file.name)
            {
                if optional.enabled {
                    files_to_be_downloaded.push((
                        format!(
                            "{}/files/game/{}/{}",
                            remote_url, profile_name, remote_file.path
                        ),
                        local_path,
                        FileType::Custom,
                    ));
                }
            } else {
                files_to_be_downloaded.push((
                    format!(
                        "{}/files/game/{}/{}",
                        remote_url, profile_name, remote_file.path
                    ),
                    local_path,
                    FileType::Custom,
                ));
            }
        } else {
            let local_hash = lyceris::util::hash::calculate_sha1(&local_path).unwrap_or_default();
            let ignored_hash = if let Some(ignored_path) = &ignored_path {
                if ignored_path.exists() {
                    lyceris::util::hash::calculate_sha1(ignored_path).unwrap_or_default()
                } else {
                    "".to_string()
                }
            } else {
                "".to_string()
            };

            if local_hash != remote_file.hash && ignored_hash != remote_file.hash {
                files_to_be_downloaded.push((
                    format!(
                        "{}/files/game/{}/{}",
                        remote_url, profile_name, remote_file.path
                    ),
                    local_path,
                    FileType::Custom,
                ));
            }
        }
    }

    download_multiple(files_to_be_downloaded, Some(&emitter), Some(&client)).await?;

    for local_file in &local_files {
        let relative_path = local_file
            .strip_prefix(&profile_dir)
            .map_err(|_| {
                crate::Error::General("There was an error during stripping prefix".to_string())
            })?
            .to_str()
            .ok_or(crate::Error::General("Invalid path".to_string()))?;

        let is_remote_file = remote_files
            .iter()
            .any(|rf| rf.path.replace("/", MAIN_SEPARATOR_STR) == relative_path);

        let is_excluded = exclude
            .iter()
            .any(|e| relative_path.starts_with(&e.replace("/", MAIN_SEPARATOR_STR)));

        let is_ignored_mod = relative_path
            .starts_with(format!("mods{}", MAIN_SEPARATOR_STR).as_str())
            && relative_path.ends_with(".ignored");

        if !is_remote_file && !is_excluded && !is_ignored_mod {
            fs::remove_file(local_file).await?;
        }
    }

    Ok(())
}
