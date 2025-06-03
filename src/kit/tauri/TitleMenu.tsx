import { listen } from "@tauri-apps/api/event";
import { Menu } from "@tauri-apps/api/menu";
import React, { useEffect } from "react";

const TitleMenu: React.FC = () => {
  const menuPromise = Menu.default();

  async function clickHandler(event: React.MouseEvent) {
    event.preventDefault();
    const menu = await menuPromise;
    menu.popup();
  }

  useEffect(() => {
    const unlistenPromise = listen<string>("menu-event", (event) => {
      switch (event.payload) {
        default:
          console.log("Unimplemented application menu id:", event.payload);
      }
    });

    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
  }, []);

  return (
    <button
      onContextMenu={clickHandler}
      onAuxClick={clickHandler}
      onClick={clickHandler}
      className="relative select-none z-10 h-6.5 p-1.5 aspect-square text-white/50 hover:bg-white/10 active:bg-white/20 active:text-white rounded-md text-xs font-normal flex items-center justify-center">
      Menu
    </button>
  );
};
export default TitleMenu;
