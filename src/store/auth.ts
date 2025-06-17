import { create } from "zustand";
import { STORAGE } from "@/constants";

//SYSTEM AUTH
interface IUser {
  access_token?: string;
  refresh_token?: string;
  username: string;
  xuid?: string;
  exp?: string;
  client_id?: string;
  uuid?: string;
}
interface UserStore {
  user?: IUser;
  init: () => Promise<void>;
  offline: (username: string) => Promise<boolean>;
  online: (user: IUser) => Promise<boolean>;
}

export const useAuth = create<UserStore>((set) => ({
  init: async () => {
    const user = await STORAGE.get<IUser>("user");
    if (user) {
      set((state) => ({
        ...state,
        user,
      }));
    }
  },
  offline: async (username) => {
    await STORAGE.set("user", {
      access_token: "",
      username,
    });

    set((state) => ({
      ...state,
      user: {
        username: username,
      },
    }));
    return true;
  },
  online: async (user: IUser) => {
    await STORAGE.set("user", {
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      username: user.username,
      xuid: user.xuid || "asd",
      exp: user.exp,
      uuid: user.uuid,
      client_id: user.client_id || "asd",
    });

    set((state) => ({
      ...state,
      user: {
        access_token: user.access_token,
        refresh_token: user.refresh_token,
        username: user.username,
        xuid: user.xuid || "asd",
        exp: user.exp,
        uuid: user.uuid,
        client_id: user.client_id || "asd",
      },
    }));
    return true;
  },
}));
