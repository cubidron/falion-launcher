import { Socials } from "@/components/Socials";
import { TitleButtons } from "@/kit/tauri/TitleBar";
import { useAuth } from "@/store/auth";
import { useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { platform } from "@tauri-apps/plugin-os";
import { useEffect, useState } from "react";
import { AnimatedOutlet } from "@/kit/AOutlet";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const remote = useRemote();
  const auth = useAuth();
  const location = useLocation();
  const [accountModal, setAccountModal] = useState(false);

  useEffect(() => {
    // set initial selected value
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.account`)) {
        setAccountModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    setTimeout(() => {
      setAccountModal(false);
    }, 0);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  return (
    <div className="size-full flex flex-col">
      <div className="flex *:relative size-full relative">
        <img
          draggable="false"
          src="/bg.jpg"
          loading="eager"
          className="!absolute brightness-50 inset-0 size-full"
          alt=""
        />
        <nav className="w-28 p-5 flex flex-col gap-4 bg-black/24 backdrop-blur">
          {platform() == "macos" && (
            <TitleButtons className="mx-auto mt-1.5 mb-3" />
          )}
          <div className="aspect-square p-2 flex items-center jsucer-content bg-element/80 backdrop-blur rounded-lg">
            <img src="/allay.webp" alt="" />
          </div>
          <div className="hr"></div>
          <ul className="flex flex-col h-full pt-0 p-1 gap-2.5">
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
            className={`h-16 z-50 relative *:relative flex pl-12 ${platform() != "macos" ? "pr-1.5" : ""}`}>
            {/* <div className="w-full pointer-events-none scale-100 h-16 -mt-6 !absolute bg-black inset-0 mx-auto blur-xl"></div> */}
            <div className="bg-black/24 backdrop-blur pointer-events-none size-full !absolute left-0 top-0" />
            {auth.user ? (
              <span className="relative account flex flex-col">
                <div
                  onClick={() => {
                    setAccountModal((prev) => !prev);
                  }}
                  className="gap-2 h-full rounded-lg hover:bg-white/3 ease-in-out duration-300 px-4 cursor-pointer flex items-center justify-center">
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
                      className="absolute top-full mt-1 z-50 bg-black/50 backdrop-blur-xl h-max flex flex-col p-2 w-full rounded-lg">
                      <h3 className="text-center !text-base mb-2">
                        Account Settings
                      </h3>
                      <ul className="flex flex-col">
                        <Link
                          to="/auth"
                          className="hover:bg-white/12 flex items-center justify-center rounded-sm text-sm h-8 text-white/80 hover:text-white ease-in-out duration-200">
                          Change Account
                        </Link>
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
          <main className="flex-1 relative w-full overflow-hidden">
            {/* <Outlet /> */}
            <AnimatedOutlet
              mode="popLayout"
              initial={{
                y: "100%",
                opacity: [1, 0.9, 0.85, 0.8, 0],
                filter: "blur(4px)",
              }}
              exit={{
                y: "4%",
                scale: 0.95,
                opacity: [1, 0.9, 0.85, 0.8, 0],
                filter: "blur(2px)",
              }}
              animate={{
                y: 0,
                filter: "blur(0px)",
                opacity: [0, 0.8, 0.85, 0.9, 1],
              }}
              transition={{
                duration: 0.7,
                ease: [0.4, 0, 0.2, 1],
              }}
              className="size-full"
            />
          </main>
        </div>
      </div>
      <footer className="h-11 text-xs text-white/60 bg-darker font-light flex justify-between items-center px-4 relative">
        <div
          className="absolute inset-0 w-full opacity-60 h-full bg-[url('/footer.jpeg')]"
          style={{
            backgroundSize: "auto 128px",
            backgroundPosition: "center",
          }}
        />
        <p className="relative z-10">developed by Cubidron</p>
        <p className="relative z-10">Not affiliated with Mojang Studios</p>
        <p className="relative z-10">2025 ©Falion Launcher</p>
      </footer>
    </div>
  );
}
