import Slider from "@/kit/range";
import { useOptions } from "@/store/options";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/home/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const options = useOptions();
  const [maxPCMemory, setMaxPCMemory] = useState(8); // gb's
  return (
    <div className="p-12 *:relative space-y-4 relative size-full bg-darker">
      <div
        className="!absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-l-8 border-r-8 border-darker/40"
        style={{
          backgroundSize: "auto 192px",
          backgroundPosition: "center center",
        }}
      />
      <h1 className="text-2xl font-extrabold">Launcher Preferences</h1>
      <section className="p-4 flex flex-col gap-2 rounded-2xl bg-dark/40 backdrop-blur">
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
          <span className="text-lg font-semibold">{options.maxMemory} GB</span>
        </span>
        <p className="text-sm text-white/50 flex items-center gap-1.5">
          <Icon icon="mdi:information" className="inline text-base" /> 2GB RAM
          is recommended, freezing may occur with lower memory amounts.
        </p>
      </section>
      <section className="p-4 flex flex-col gap-2 rounded-2xl bg-dark/40 backdrop-blur">
        <h2 className="text-xl mb-1 font-semibold">Java Location</h2>
        <input
          type="text"
          name="javapath"
          value={options.javaPath}
          readOnly
          id="javapath"
          className="TextField max-w-[28rem]"
        />
      </section>
      <section className="p-4 flex flex-col gap-2 rounded-2xl bg-dark/40 backdrop-blur">
        <h2 className="text-xl mb-1 font-semibold">Application Location</h2>
        <input
          type="text"
          name="gamepath"
          value={options.appDir}
          readOnly
          id="gamepath"
          className="TextField max-w-[28rem]"
        />
      </section>
    </div>
  );
}
