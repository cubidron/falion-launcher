import { getCurrentWindow } from "@tauri-apps/api/window";
import React from "react";
import { Platform, platform } from "@tauri-apps/plugin-os";
import "./titlebar.css";
import { IconClose, IconMaximize, IconMinimize } from "../icons/icons";

export function DragRegion(props: { className?: string }) {
  return (
    <span
      data-tauri-drag-region
      className={`absolute inset-0 w-full h-8 bg-red-500/0 ${props.className}`}
    ></span>
  );
}
// const platform = () => "windows";
export function TitleButtons(props: {
  className?: string;
  if?: Platform;
  else?: Platform;
}) {
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  async function titleAction(e: React.MouseEvent<HTMLButtonElement>) {
    // @ts-ignore
    const action = e.target.id;
    switch (action) {
      case "close":
        if (platform() === "macos") {
          getCurrentWindow().minimize();
        } else {
          getCurrentWindow().close();
        }
        break;
      case "minimize":
        getCurrentWindow().minimize();
        break;
      case "maximize":
        if (platform() === "macos") {
          getCurrentWindow().setFullscreen(
            !(await getCurrentWindow().isFullscreen()),
          );
        } else {
          getCurrentWindow().toggleMaximize();
        }
        break;
    }
  }
  React.useEffect(() => {
    let unlisten: () => void;
    (async () => {
      unlisten = await getCurrentWindow().listen("tauri://resize", async () => {
        setIsFullScreen(await getCurrentWindow().isFullscreen());
      });
    })();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);
  if (props.if) {
    if (platform() !== props.if) return null;
  }
  if (props.else) {
    if (platform() === props.else) return null;
  }
  switch (platform()) {
    case "macos":
      if (!isFullScreen) {
        return (
          <div className={`traffic-lights ${props.className}`}>
            <button
              onClick={titleAction}
              data-no-style
              className="traffic-light traffic-light-close ease-in-out duration-200 cursor-default"
              id="close"
            ></button>
            <button
              onClick={titleAction}
              data-no-style
              className="traffic-light traffic-light-minimize ease-in-out duration-200 cursor-default"
              id="minimize"
            ></button>
            <button
              onClick={titleAction}
              data-no-style
              className="traffic-light traffic-light-maximize ease-in-out duration-200 cursor-default"
              id="maximize"
            ></button>
          </div>
        );
      } else {
        return null;
      }
    default:
      return (
        <div
          className={`col-span-12 size-max row-span-1 drag shrink-0 ${props.className}`}
        >
          <ul className="flex flex-row justify-end h-full">
            <button
              onClick={titleAction}
              id="minimize"
              className="w-12 h-8 hover:bg-white/10 ease-in-out duration-200 no-drag"
            >
              <IconMinimize className="fill-white w-3 m-auto pointer-events-none" />
            </button>
            <button
              onClick={titleAction}
              id="maximize"
              className="w-12 h-8 hover:bg-white/10 ease-in-out duration-200 no-drag"
            >
              <IconMaximize className="fill-white w-3 h-3 m-auto pointer-events-none" />
            </button>
            <button
              onClick={titleAction}
              id="close"
              className="w-12 h-8 hover:bg-[#cd1a2b] ease-in-out duration-200 no-drag"
            >
              <IconClose className="fill-white w-5 m-auto pointer-events-none" />
            </button>
          </ul>
        </div>
      );
  }
}
