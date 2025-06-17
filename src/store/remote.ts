import { create } from "zustand";
import { fetch } from "@tauri-apps/plugin-http";
import { WEB_API_BASE } from "../constants";

interface ISocial {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface IGame {
  id: string;
  icon?: string;
  title?: string;
  description?: string;
  version?: string;
  ip?: string;
  port?: number;
  directConnect?: boolean;
  minecraft?: {
    version: string;
    loader: {
      type: string;
      version: string;
    };
    exclude: string[];
    optionalMods: IOptionalMod[];
  };
  videoUrl?: string;
}

export interface IOptionalMod {
  name: string;
  fileName: string;
  default: boolean;
  enabled?: boolean;
}

interface IRemote {
  discordRpc?: {
    clientId: string;
    stateText: string;
    largeImage: string;
    largeText: string;
    details: string;
  };
  about?: {
    title: string;
    description: string;
  };
  social?: ISocial[];
  games?: IGame[];
  version?: string;
  website?: string;
  notes?: string;
  pub_date?: string;
  platforms?: {
    "windows-x86_64": {
      signature: string;
      url: string;
    };
    "darwin-x86_64": {
      signature: string;
      url: string;
    };
    "darwin-aarch64": {
      signature: string;
      url: string;
    };
    "linux-x86_64": {
      signature: string;
      url: string;
    };
  };
}
interface RemoteStore extends IRemote {
  init: () => Promise<void>;
}

export const useRemote = create<RemoteStore>((set) => ({
  init: async () => {
    const response = await fetch(`${WEB_API_BASE}/config.json`);

    if (!response.ok) {
      throw new Error("Could not fetch the data");
    }

    const data = await response.json();
    console.log(data);
    set({
      ...data,
    });
  },
}));
