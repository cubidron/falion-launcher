import { create } from "zustand";
import { getVersion } from "@tauri-apps/api/app";
import * as path from "@tauri-apps/api/path";
import { STORAGE } from "@/constants";

export type TLaunchBehavior = "keep" | "minimize" | "close";

// Local profile tipi
export interface IGame {
  id: string;
  title: string;
  minecraft: {
    version: string;
    loader: { type: string; version?: string };
  };
  // Diğer gerekli alanlar...
}

// Local options that launcher will store
interface ILocalOptions {
  maxMemory?: number;
  fullScreen?: boolean;
  launchBehavior?: TLaunchBehavior;
  selectedGame?: string;
  discordRpc?: boolean;
  optionalMods?: {
    fileName: string;
    enabled: boolean;
    profile: string;
  }[];
}

// Options that will set at runtime
interface IOptions extends ILocalOptions {
  javaPath?: string;
  appDir?: string;
  version?: string;
  localProfiles?: IGame[];
}
interface IOptionsStore extends IOptions {
  init: () => Promise<void>;
  set: (change: IOptions) => Promise<void>;
  addLocalProfile: (profile: IGame) => Promise<void>;
  removeLocalProfile: (id: string) => Promise<void>;
  updateLocalProfile: (profile: IGame) => Promise<void>;
}
export const useOptions = create<IOptionsStore>((set, get) => ({
  init: async () => {
    const options = await STORAGE?.get<ILocalOptions>("options");
    const localProfiles = await STORAGE?.get<IGame[]>("localProfiles");
    const appDir = await path.join(await path.dataDir(), ".falion");

    set({
      version: await getVersion(),
      javaPath: await path.join(appDir, "runtimes"),
      appDir,
      launchBehavior: options?.launchBehavior ?? "minimize",
      maxMemory: options?.maxMemory ?? 4,
      fullScreen: options?.fullScreen ?? false,
      selectedGame: options?.selectedGame,
      discordRpc: options?.discordRpc ?? true,
      optionalMods: options?.optionalMods ?? [],
      localProfiles: localProfiles ?? [],
    });
  },
  set: async (change: IOptions) => {
    const options = {
      ...useOptions.getState(),
      ...change,
    };

    await STORAGE?.set("options", {
      launchBehavior: options.launchBehavior,
      maxMemory: options.maxMemory,
      fullScreen: options.fullScreen,
      selectedGame: options.selectedGame,
      discordRpc: options.discordRpc,
      optionalMods: options.optionalMods,
    });

    set(options);
  },
  addLocalProfile: async (profile: IGame) => {
    const options = get();
    const updatedProfiles = [...(options.localProfiles ?? []), profile];
    await STORAGE?.set("localProfiles", updatedProfiles);
    set({ localProfiles: updatedProfiles });
  },
  removeLocalProfile: async (id: string) => {
    const options = get();
    const updatedProfiles = (options.localProfiles ?? []).filter(
      (p) => p.id !== id,
    );
    await STORAGE?.set("localProfiles", updatedProfiles);
    set({ localProfiles: updatedProfiles });
  },
  updateLocalProfile: async (profile: IGame) => {
    const options = get();
    const updatedProfiles = (options.localProfiles ?? []).map((p) =>
      p.id === profile.id ? profile : p,
    );
    await STORAGE?.set("localProfiles", updatedProfiles);
    set({ localProfiles: updatedProfiles });
  },
}));
