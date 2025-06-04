import { create } from "zustand";

export interface NotifyState {
  notis: { id: string; text: string }[];
  add: (message: string) => void;
  remove: () => void;
}

function randomId() {
  return Math.random().toString(36).substr(2, 9);
}

export const useNotify = create<NotifyState>((set) => ({
  notis: [],
  add: (message: string) => {
    set((state) => {
      if (state.notis.some((noti) => noti.text === message)) return state;
      return { notis: [...state.notis, { id: randomId(), text: message }] };
    });
  },
  remove: () => {
    set((state) => ({ notis: state.notis.slice(1) }));
  },
}));

export function addNoti(message: string) {
  useNotify.getState().add(message);
}
