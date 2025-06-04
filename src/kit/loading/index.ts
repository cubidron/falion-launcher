import { create } from "zustand";

export interface LoadingState {
  status: boolean;
  text: string;
  currentProgress: number;
  maxProgress: number;
  subText: string;
}

export interface LoadingActions {
  set: (
    text: string,
    subText: string,
    progress?: number,
    maxProgress?: number,
    status?: boolean
  ) => void;
  clear: () => void;
}

export const useLoading = create<LoadingState & LoadingActions>((set) => ({
  status: false,
  text: "",
  currentProgress: 0,
  maxProgress: 0,
  subText: "",
  set: (text, subText, progress = 0, maxProgress = 0, status = true) =>
    set({
      status,
      text,
      subText,
      currentProgress: progress,
      maxProgress: maxProgress,
    }),
  clear: () =>
    set({
      status: false,
      text: "",
      currentProgress: 0,
      maxProgress: 0,
      subText: "",
    }),
}));

export function setLoading(
  text: string,
  subText: string,
  progress?: number,
  maxProgress?: number
) {
  useLoading.getState().set(text, subText, progress, maxProgress);
}

export function updateLoading(props: {
  text?: string;
  subText?: string;
  progress?: number;
  maxProgress?: number;
}) {
  const currentState = useLoading.getState();

  currentState.set(
    props.text ?? currentState.text,
    props.subText ?? currentState.subText,
    props.progress ?? currentState.currentProgress,
    props.maxProgress ?? currentState.maxProgress,
    currentState.status
  );
}

export function clearLoading() {
  useLoading.getState().clear();
}