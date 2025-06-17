import { initializeDiscordState } from "@/helpers";
import Alert from "@/kit/alert";
import { setLoading, useLoading, clearLoading } from "@/kit/loading";
import { useAuth } from "@/store/auth";
import { useOptions } from "@/store/options";
import { useRemote } from "@/store/remote";
import {
  createRootRoute,
  Outlet,
  useNavigate,
} from "@tanstack/react-router";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { info, error } from "@tauri-apps/plugin-log";
import { useEffect } from "react";
import { start } from "tauri-plugin-drpc";

export const Route = createRootRoute({
  component: () => <Layout />,
});

const disableShortcuts = (event: KeyboardEvent) => {
  if (
    (event.ctrlKey && event.code === "KeyQ") ||
    (event.ctrlKey && event.code === "KeyP") ||
    (event.ctrlKey && event.code === "KeyF") ||
    event.code === "F5"
  ) {
    event.preventDefault();
  }
};
const disableContextMenu = (e: MouseEvent) => e.preventDefault();
const disableCombinationClicks = (e: MouseEvent) => {
  if (e.ctrlKey || e.altKey) {
    e.preventDefault();
  }
};


function Layout() {
  const auth = useAuth();
  const nav = useNavigate();
  const remote = useRemote();
  const options = useOptions();

  useEffect(() => {
    info("Mounting root component");
    nav({
      to: "/auth",
    });
    let unlisten: UnlistenFn[] | undefined;
    (async () => {
      try {
        info("Checking updates");
        setLoading("Please wait", "Loading settings...");
        await options.init();
        setLoading("Please wait", "Initializing authentication...");
        await auth.init();
        if (useAuth.getState().user?.username) {
          console.log(useAuth.getState().user)
          nav({
              to: "/home",
            });
        }
        setLoading("Please wait", "Remote initialization...");
        await remote.init();
        if (useOptions.getState().discordRpc) {
          try {
            info("Initializing Discord RPC");
            await start(useRemote.getState().discordRpc?.clientId!);
            await initializeDiscordState(useRemote.getState().discordRpc!);
            info("Discord RPC initialized");
          } catch (e: any) {
            error(
              `Error initializing Discord RPC: ${typeof e === "string" ? e : e?.message}`,
            );
          } // Ignore error.
        }
        setLoading("Please wait", "Finalizing...");
        unlisten = [
          await listen(
            "progress",
            (event: {
              payload: {
                current: number;
                total: number;
                path: string;
                fileType: string;
              };
            }) => {
              let subText;
              switch (event.payload.fileType) {
                case "Asset":
                  subText = `Downloading assets...`;
                  break;
                case "Library":
                  subText = `Downloading libraries...`;
                  break;
                case "Java":
                  subText = `Downloading Java...`;
                  break;
                case "Custom":
                  subText = `Downloading custom files...`;
                  break;
              }

              useLoading.setState({
                currentProgress: event.payload.current,
                maxProgress: event.payload.total,
                subText,
              });
            },
          ),
          await listen("clear-loading", (_) => {
            clearLoading();
          }),
          await listen("crash", (event: any) => {
            Alert({
              title: event.payload.title,
              message: event.payload.message,
            });
          }),
        ];
        clearLoading();
      } catch (e: any) {
        error(
          `Error initializing frontend: ${typeof e === "string" ? e : e?.message}`,
        );
        return Alert({
          title: "Error",
          message:
            "An error occurred during initialization. Please try again or contact support.",
          force: true,
          bg: true,
          action() {
            window.location.reload();
          },
        });
      }
    })();

    window.addEventListener("contextmenu", disableContextMenu);
    window.addEventListener("keydown", disableShortcuts);
    window.addEventListener("click", disableCombinationClicks);

    return () => {
      unlisten?.map((fn) => fn());
      window.removeEventListener("contextmenu", disableContextMenu);
      window.removeEventListener("keydown", disableShortcuts);
      window.removeEventListener("click", disableCombinationClicks);
    };
  }, []);

  return (
    <div className="flex flex-col relative w-svw h-svh bg-darker">
      <Outlet />
    </div>
  );
}
