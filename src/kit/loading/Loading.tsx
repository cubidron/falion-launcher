import { CSSProperties, memo } from "react";
import { useStore } from "zustand";
import Spinner from "../Spinner";
import { LoadingState, useLoading } from ".";

const Loading = () => {
  const status = useStore(useLoading, (state: LoadingState) => state.status);
  const currentProgress = useStore(
    useLoading,
    (state: LoadingState) => state.currentProgress
  );
  const maxProgress = useStore(
    useLoading,
    (state: LoadingState) => state.maxProgress
  );
  const subText = useStore(useLoading, (state: LoadingState) => state.subText);
  const text = useStore(useLoading, (state: LoadingState) => state.text);

  if (!status) return null;

  const isLoading = currentProgress <= 0 || subText.includes("Checking");

  const progressPercentage =
    maxProgress > 0 ? (currentProgress / maxProgress) * 100 : 31;

  return (
    <section
      className="fixed z-[100] inset-0 bg-black/40 flex !bg-center !bg-cover flex-col items-center justify-center"
      data-tauri-drag-region>
      <div
        className={`flex items-center bg-darker/60 backdrop-blur-2xl px-12 py-8 rounded-xl min-w-[16rem] justify-center ${
          !isLoading ? " flex-col-reverse" : "flex-col"
        }`}>
        {isLoading ? (
          <Spinner className="!h-20" />
        ) : (
          <div className="h-2.5 w-full mt-6 bg-side overflow-hidden bg-white/6 outline-1 -outline-offset-1 outline-white/6 relative rounded-2xl">
            <div
              className="h-full ease-linear duration-75 rounded-2xl bg-primary"
              style={
                {
                  width: `${progressPercentage}%`,
                } as CSSProperties
              }></div>
          </div>
        )}
        <span className="flex flex-col">
          <h1 className="font-bold text-center text-2xl mt-2">{text}</h1>
          <p className="text-sm text-center">{subText}</p>
        </span>
      </div>
    </section>
  );
};

export default memo(Loading);
