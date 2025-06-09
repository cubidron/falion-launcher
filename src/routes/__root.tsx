import Alert from "@/kit/alert";
import { setLoading, useLoading, clearLoading } from "@/kit/loading";
import { useAuth } from "@/store/auth";
import useNewses from "@/store/news";
import { useOptions } from "@/store/options";
import { useRemote } from "@/store/remote";
import { load, Store } from "@tauri-apps/plugin-store";
import {
  createRootRoute,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { UnlistenFn, listen } from "@tauri-apps/api/event";
import { info, error } from "@tauri-apps/plugin-log";
import { useEffect } from "react";
export let storage: Store | undefined;

export const Route = createRootRoute({
  component: () => <Layout />,
});

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  // const auth = useAuth();
  const nav = useNavigate();
  const remote = useRemote();
  const news = useNewses();
  const options = useOptions();

  useEffect(() => {
    info("Mounting root component");
    let unlisten: UnlistenFn[] | undefined;
    (async () => {
      try {
        info("Checking updates");
        // const update = await check();
        // if (update) {
        //   info(
        //     `found update ${update.version} from ${update.date} with notes ${update.body}`,
        //   );
        //   let downloaded = 0;
        //   let contentLength = 0;
        //   await update.downloadAndInstall((event) => {
        //     switch (event.event) {
        //       case "Started":
        //         contentLength = event.data.contentLength!;
        //         setLoading(
        //           "Update",
        //           "Downloading update...",
        //         );
        //         break;
        //       case "Progress":
        //         downloaded += event.data.chunkLength;
        //         useLoading.setState({
        //           currentProgress: downloaded,
        //           maxProgress: contentLength,
        //         });
        //         break;
        //       case "Finished":
        //         break;
        //     }
        //   });

        //   return await relaunch();
        // }
        info("Loading storage");
        storage = await load("storage.json", { autoSave: true });
        setLoading("Please wait", "Loading settings...");
        await options.init();
        setLoading("Please wait", "Initializing authentication...");
        // await auth.init();
        // if (useAuth.getState().user && useAuth.getState().users.length > 0) {
        //   location.href.includes("/home") ||
        //     nav({
        //       to: "/home",
        //     });
        // }
        setLoading("Please wait", "Fetching news...");
        await news.fetch();
        setLoading("Please wait", "Remote initialization...");
        await remote.init();
        // if (useOptions.getState().discordRpc) {
        //   try {
        //     info("Initializing Discord RPC");
        //     await start(remote.discordRpc?.clientId || DISCORD_CLIENT_ID);
        //     await initializeDiscordState(useRemote.getState().discordRpc!);
        //     info("Discord RPC initialized");
        //   } catch (e: any) {
        //     error(
        //       `Error initializing Discord RPC: ${typeof e === "string" ? e : e?.message}`,
        //     );
        //   } // Ignore error.
        // }
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

    // window.addEventListener("contextmenu", disableContextMenu);
    // window.addEventListener("keydown", disableShortcuts);
    // window.addEventListener("click", disableCombinationClicks);

    return () => {
      unlisten?.map((fn) => fn());
      // window.removeEventListener("contextmenu", disableContextMenu);
      // window.removeEventListener("keydown", disableShortcuts);
      // window.removeEventListener("click", disableCombinationClicks);
    };
  }, []);

  useEffect(() => {
    if (!useAuth.getState().user) {
      location.href.includes("/onboard") ||
        nav({
          to: "/auth",
        });
    } else {
      location.href.includes("/home") ||
        nav({
          to: "/home",
        });
    }
  }, [useAuth.getState().user]);
  return (
    <div className="flex flex-col relative w-svw h-svh bg-darker">
      <Outlet />
      <div className="flex border-dashed top-2 border-red-400 p-0.5 rounded-md fixed inset-0 size-max z-50 mb-auto mb-16 mx-auto bg-white/24 backdrop-blur-2xl text-white gap-2">
        <input
          type="text"
          className="rounded-md px-2 py-1"
          value={location.href}
          onChange={(e) => {
            navigate({
              to: e.target.value,
            });
          }}
        />
      </div>
    </div>
  );
}
