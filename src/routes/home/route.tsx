import { Socials } from "@/components/Socials";
import { TitleButtons } from "@/kit/tauri/TitleBar";
import { useAuth } from "@/store/auth";
import { useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { platform } from "@tauri-apps/plugin-os";
import { useState } from "react";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const remote = useRemote();
  const auth = useAuth();
  const [accountModal, setAccountModal] = useState(false);
  return (
    <>
      <div className="flex *:relative size-full relative">
        <img
          draggable="false"
          src="/bg.jpg"
          loading="eager"
          className="!absolute brightness-50 inset-0 size-full"
          alt=""
        />
        <nav className="w-28 p-5 flex flex-col gap-4 bg-gradient-to-t from-black via-black/80 to-black/0">
          {platform() == "macos" && <TitleButtons className="mx-auto mt-1" />}
          <div className="aspect-square p-2 flex items-center jsucer-content bg-element rounded-lg">
            <img src="/allay.webp" alt="" />
          </div>
          <div className="hr"></div>
          <ul className="flex flex-col h-full pt-0 p-1 gap-1.5">
            <Link to="/home" className="NavButton">
              <Icon icon="mdi:home" className="text-3xl" />
            </Link>
            <Link to="/home/about" className="NavButton">
              <Icon icon="mdi:information" className="text-3xl" />
            </Link>
            {remote.website && (
              <a href={remote.website} target="_blank" className="NavButton">
                <Icon icon="mdi:web" className="text-3xl" />
              </a>
            )}
            <Link to="/home/settings" className="NavButton mt-auto">
              <Icon icon="mdi:cog" className="text-3xl" />
            </Link>
          </ul>
        </nav>
        <div className="flex flex-col flex-1">
          <header
            data-tauri-drag-region
            className={`h-16 relative *:relative flex pl-12 pr-1.5`}
          >
            <div className="w-full pointer-events-none scale-100 h-16 -mt-6 !absolute bg-black inset-0 mx-auto blur-xl"></div>
            {auth.user ? (
              <span className="relative flex flex-col">
                <div
                  onClick={() => {
                    setAccountModal((prev) => !prev);
                  }}
                  className="gap-2 h-full rounded-lg hover:bg-white/3 ease-in-out duration-300 px-4 cursor-pointer flex items-center justify-center"
                >
                  <img
                    className="size-8"
                    src={`https://visage.surgeplay.com/face/${
                      auth.user?.username ?? "MHF_Steve"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://visage.surgeplay.com/face/MHF_Steve"; // Fallback image
                    }}
                    alt=""
                  />
                  <span>
                    <h3 className={`font-semibold text-2xl leading-[100%]`}>
                      {auth.user?.username}
                    </h3>
                    <p className="text-sm font-extralight leading-[100%]">
                      {auth.user.access_token
                        ? "Microsoft Account"
                        : "Offline Account"}
                    </p>
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  {accountModal && (
                    <motion.section
                      initial={{
                        opacity: 0,
                        y: -12,
                        scale: 0.95,
                        filter: "blur(2px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -12,
                        scale: 0.95,
                        filter: "blur(2px)",
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                      style={{
                        transformOrigin: "top center",
                      }}
                      className="absolute top-full mt-1 z-50 bg-black/50 backdrop-blur-2xl h-max flex flex-col p-2 w-full rounded-lg"
                    >
                      <h3 className="text-center !text-base mb-2">
                        Account Settings
                      </h3>
                      <ul className="flex flex-col">
                        <button className="hover:bg-white/12 rounded-sm text-sm h-8 text-white/80 hover:text-white ease-in-out duration-200">
                          Manage Account
                        </button>
                        <button className="hover:bg-white/12 rounded-sm text-sm h-8 text-white/80 hover:text-white ease-in-out duration-200">
                          Change Account
                        </button>
                        <button className="hover:bg-red-500/12 rounded-sm text-sm h-8 text-red-500/80 hover:text-red-500 ease-in-out duration-200">
                          Log Out!
                        </button>
                      </ul>
                    </motion.section>
                  )}
                </AnimatePresence>
              </span>
            ) : (
              <>Loading...</>
            )}
            <ul className="flex flex-col ml-auto justify-center items-center px-4 gap-2 relative">
              <Socials axis="x" />
            </ul>
            {platform() != "macos" && <TitleButtons className="ml-auto" />}
          </header>
          <main className="flex-1 px-12 pt-12"></main>
        </div>
      </div>
    </>
  );
}
