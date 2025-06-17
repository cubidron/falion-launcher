import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import Switch from "./Switch";
import { useOptions } from "../store/options";
import { IOptionalMod, useRemote } from "@/store/remote";

export default function Mods({ mods }: { mods: IOptionalMod[] }) {
  const [loading, setLoading] = useState(false);
  const remote = useRemote();
  const options = useOptions();

  const handleSwitchChange = (mod: IOptionalMod) => {
    const currentServer =
      remote.games?.find((s) => s.id === options.selectedGame) ||
      remote.games?.[0]!;

    currentServer.minecraft?.optionalMods.forEach((m) => {
      if (m.fileName === mod.fileName) {
        m.enabled = !m.enabled;
      }
    });

    let optionalMods =
      currentServer.minecraft?.optionalMods.map((m) => ({
        fileName: m.fileName,
        enabled: m.enabled!,
        profile: options.selectedGame!,
      })) || [];

    optionalMods = optionalMods.concat(
      options.optionalMods?.filter((m) => m.profile !== options.selectedGame) ||
        []
    );

    options.set({ optionalMods });
  };

  return (
    <span className="w-[32rem]">
      <h1 className="text-xl leading-3 flex items-center justify-between font-medium">
        Optional Mods
      </h1>
      <ul className="flex mt-4 gap-2 overflow-y-auto pr-2 max-h-full w-full flex-col">
        {mods && mods.length > 0 ? (
          mods.map((mod, i) => (
            <div
              key={i}
              className={`w-full flex items-center p-2 gap-4 rounded-lg ${i % 2 === 0 ? "bg-white/5" : "bg-white/10"}`}>
              <div className="h-10 w-10 grid place-items-center aspect-square rounded bg-body">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6"
                  viewBox="0 0 16 16">
                  <path
                    fill="none"
                    className={`ease-in-out duration-300 origin-center ${mod.enabled ? "stroke-primary scale-100" : "stroke-primary mix-blend-luminosity scale-[0.85]"}`}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.625 1.5H14.5v4.875H9.625ZM1.5 9.625h4.875V14.5H1.5Zm8.125 2.438a2.438 2.437 0 1 0 4.875 0a2.438 2.437 0 1 0-4.875 0M1.5 3.938a2.438 2.437 0 1 0 4.875 0a2.438 2.437 0 1 0-4.875 0"
                  />
                </svg>
              </div>
              <p>{mod.name.replace(".ignored", "")}</p>
              <Switch
                className={`ml-auto ${mod.enabled || (i % 2 === 0 ? "bg-white/10" : "bg-white/5")}`}
                value={mod.enabled!}
                onChange={() => handleSwitchChange(mod)}
              />
            </div>
          ))
        ) : (
          <p className="text-white/60">Aucun mod trouvé</p>
        )}
      </ul>
    </span>
  );
}
