import { IOptionalMod } from "@/store/remote";
import { invoke } from "@tauri-apps/api/core";

interface LaunchConfig {
  version: string;
  auth: {
    Offline?: {
      username: string;
    };
    Microsoft?: MinecraftAccount;
  };
  memory: number;
  profile: string;
  gameDir: string;
  ip: string;
  port: number;
  directConnect: boolean;
  fullscreen?: boolean;
  minecraft?: {
    version: string;
    loader: {
      type: string;
      version: string;
    };
    exclude: string[];
  };
  remoteUrl: string;
  after: "close" | "minimize" | "keep";
  optionalMods?: IOptionalMod[];
}

export async function launchMinecraft(cfg: LaunchConfig): Promise<void> {
  return await invoke("launch_minecraft", { cfg });
}

interface MinecraftAccount {
  access_token: string;
  refresh_token: string;
  username: string;
  xuid: string;
  exp: string;
  client_id: string;
}

export async function microsoftAuth(): Promise<MinecraftAccount> {
  return await invoke("microsoft_auth");
}
