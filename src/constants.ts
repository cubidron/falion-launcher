import { LazyStore } from "@tauri-apps/plugin-store";

export const WEB_API_BASE = "http://40.160.19.221:8000";
export const LAUNCHER_BASE = "https://api.npoint.io/bc92b551996e57750c7b";
export const STORAGE = new LazyStore("store.json");
