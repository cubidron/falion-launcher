import Dropdown from "@/kit/Dropdown";
import Slider from "@/kit/range";
import Switch from "@/kit/Switch";
import { useOptions } from "@/store/options";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";

export const Route = createFileRoute("/home/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const options = useOptions();
  const [maxPCMemory, setMaxPCMemory] = useState(8); // gb's
  return (
    <motion.div className="p-12 *:relative relative size-full bg-darker">
      <div
        className="!absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-l-8 border-r-8 border-darker/40"
        style={{
          backgroundSize: "auto 192px",
          backgroundPosition: "center center",
        }}
      />
      <h1 className="text-2xl col-span-2 font-extrabold">
        Launcher Preferences
      </h1>
      <div className="grid grid-cols-2 mt-4 gap-4">
        <section className="p-4 col-span-1 flex flex-col gap-2 relative *:relative">
          <div className=" bg-dark/40 backdrop-blur size-full inset-0 !absolute rounded-2xl" />
          <h2 className="text-xl mb-1 font-semibold">Game Memory</h2>
          <span className="flex gap-4 items-center">
            <Slider
              min={2}
              max={maxPCMemory * 2}
              steps
              value={options.maxMemory! * 2}
              onChange={(e) => {
                options.set({
                  ...options,
                  maxMemory: e / 2,
                });
              }}
            />
            <span className="text-lg font-semibold">
              {options.maxMemory} GB
            </span>
          </span>
          <p className="text-sm text-white/50 flex items-center gap-1.5">
            <Icon icon="mdi:information" className="inline text-base" /> 2GB RAM
            is recommended, freezing may occur with lower memory amounts.
          </p>
          <span className="flex gap-4 items-center mt-auto justify-between">
            <h4 className="font-semibold">Launcher Behavior</h4>
            <Dropdown
              options={["keep", "minimize", "close"]}
              id={"launchBehavior"}
              value={options.launchBehavior ?? "keep"}
              onChange={(e) => {
                options.set({
                  ...options,
                  launchBehavior: e as "keep" | "minimize" | "close",
                });
              }}
              displayValue={(e) =>
                e === "keep"
                  ? "Keep Open"
                  : e === "minimize"
                    ? "Minimize Launcher"
                    : "Close Launcher"
              }
            />
          </span>
        </section>
        <section className="p-4 col-span-1 flex flex-col gap-2 relative *:relative">
          <div className=" bg-dark/40 backdrop-blur size-full inset-0 !absolute rounded-2xl" />
          <h1 className="text-xl mb-1 font-bold">Locations</h1>
          <h2 className="text-base font-semibold">Java Location</h2>
          <input
            type="text"
            name="javapath"
            value={options.javaPath}
            readOnly
            id="javapath"
            className="TextField max-w-[28rem]"
          />
          <h2 className="text-base mt-1 font-semibold">Application Location</h2>
          <input
            type="text"
            name="gamepath"
            value={options.appDir}
            readOnly
            id="gamepath"
            className="TextField max-w-[28rem]"
          />
        </section>
        <section className="p-4 col-span-1 flex flex-col gap-2 relative *:relative">
          <div className=" bg-dark/40 backdrop-blur size-full inset-0 !absolute rounded-2xl" />
          <h2 className="text-xl mb-1 font-semibold">Other Options</h2>
          <span className="flex gap-2">
            <Switch
              value={options.discordRpc ?? false}
              onChange={(e) => {
                options.set({
                  ...options,
                  discordRpc: e,
                });
              }}
            />
            Discord RPC
          </span>
          <span className="flex gap-2">
            <Switch
              value={options.fullScreen ?? false}
              onChange={(e) => {
                options.set({
                  ...options,
                  fullScreen: e,
                });
              }}
            />
            Fullscreen Minecraft
          </span>
        </section>
        <section className="p-4 col-span-1 flex flex-col gap-2 relative *:relative">
          <div className=" bg-dark/40 backdrop-blur size-full inset-0 !absolute rounded-2xl" />
          <div className="text-xs tracking-wider text-white/70 !font-light">
            <p className="text-lg text-white">Falion ©2025</p>
            <p>Developed by Cubidron</p>
            <p>All rights are reserved. - Not affiliated with Mojang Studios</p>
          </div>
          <span className="flex items-center gap-2 text-sm">
            Having issues?
            <button className="Button !text-xs !h-7 !w-max">Report Bug</button>
          </span>
        </section>
      </div>
    </motion.div>
  );
}
