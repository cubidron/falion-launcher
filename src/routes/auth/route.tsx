import { Socials } from "@/components/Socials";
import { DragRegion, TitleButtons } from "@/kit/tauri/TitleBar";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { platform } from "@tauri-apps/plugin-os";

export const Route = createFileRoute("/auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="relative flex size-full">
        <img
          draggable="false"
          src="/bg.jpg"
          className="absolute brightness-50 inset-0 size-full"
          alt=""
        />
        <ul className="flex flex-col justify-center items-center px-4 gap-2 relative">
          <div className="h-8/12 -left-[200%] absolute bg-black rounded-full aspect-[8/24] blur-2xl"></div>
          <Socials axis="y" />
        </ul>
        <main className="absolute gap-2.5 inset-0 m-auto py-[6%] w-[32rem] mx-auto bg-gradient-to-t from-darker/96 to-darker/0 flex flex-col items-center justify-start size-full">
          <img
            draggable="false"
            src="/logo.gif"
            className="w-auto h-56"
            alt=""
          />
          <Outlet />
        </main>
        <span
          className={`absolute inset-0 size-max z-50 flex w-full ${platform() != "macos" ? "justify-end" : "p-3"}`}
        >
          <TitleButtons className="z-50 relative" />
          <DragRegion />
        </span>
      </div>
    </>
  );
}
