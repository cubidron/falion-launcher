import { useOptions } from "@/store/options";
import { IGame, useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute } from "@tanstack/react-router";
import { easeInOut, motion } from "motion/react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/home/")({
  component: RouteComponent,
});

function RouteComponent() {
  const remote = useRemote();
  const options = useOptions();
  const [gameRow, setGameRow] = useState(false);
  const [game, setGame] = useState<IGame>();
  useEffect(() => {
    let found = remote.games?.find((item) => item.id == options.selectedGame);
    if (found) {
      setGame(found);
    } else {
      setGame(remote.games?.[0]);
    }
  }, [options.selectedGame, remote.games]);
  return game ? (
    <motion.div layout className="size-full flex flex-col">
      <motion.section
        layout="position"
        className="flex flex-col mt-auto items-start p-12 pb-4"
      >
        <img
          className="h-32 mt-auto"
          src={game.icon}
          alt={`${game.title} icon`}
        />
        <h1>{game.title}</h1>
        <p>{game.description}</p>
        <button className="flex mt-4 gap-1.5 rounded-xl px-6 py-4 pl-4 bg-gradient-to-br from-primary/70 via-primary to-primary bg-white items-center justify-center text-xl font-bold">
          <Icon icon="mdi:play" className="text-3xl relative text-white" />
          <p className="relative font-black">PLAY</p>
        </button>
      </motion.section>
      <motion.section
        layout
        initial={false}
        animate={{ height: gameRow ? "auto" : 44 }}
        transition={{
          duration: 0.4,
          ease: easeInOut,
        }}
        className="w-full flex flex-col overflow-hidden"
      >
        <div className="w-full">
          <motion.button
            layout="position"
            onClick={() => setGameRow(!gameRow)}
            className="flex flex-col shrink-0 size-max cursor-pointer my-1 items-center mx-auto relative overflow-hidden"
            animate={{
              paddingTop: !gameRow ? "0.75rem" : "0.25rem",
              paddingBottom: !gameRow ? "0.25rem" : "0.75rem",
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
            }}
            transition={{
              duration: 0.4,
            }}
          >
            <motion.div
              animate={{
                rotate: gameRow ? 180 : 0,
                y: gameRow ? 8 : -8,
              }}
              transition={{
                duration: 0.4,
              }}
              className="absolute top-1/2 transform -translate-y-1/2"
            >
              <Icon icon="mdi-chevron-up" className="text-2xl leading-0" />
            </motion.div>
            <motion.p
              className="leading-4 relative z-10 text-nowrap"
              animate={{
                opacity: gameRow ? 0.7 : 1,
              }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0.0, 0.2, 1],
                type: "tween",
              }}
            >
              Games
            </motion.p>
          </motion.button>
        </div>
        <div className="h-full flex *:relative overflow-x-auto bg-darker relative gap-4 p-4">
          <div
            className="!absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-darker/40"
            style={{
              backgroundSize: "auto 192px",
              backgroundPosition: "center",
            }}
          />
          {remote.games?.map((item) => (
            <span
              key={item.id}
              onClick={() => {
                options.set({
                  ...options,
                  selectedGame: item.id,
                });
              }}
              className={`flex max-w-72 h-max gap-1.5 w-max p-4 overflow-hidden rounded-lg items-center justify-center bg-element/40 backdrop-blur outline-2 outline-transparent ease-gentle duration-300 hover:outline-primary outline-offset-1 ${item.id === game?.id ? "!-outline-offset-1 !outline-primary" : ""}`}
            >
              <img
                className="h-16 w-auto"
                src={item.icon}
                alt={`${item.title} icon`}
              />
              <span className="leading-4">
                <p className="text-lg line-clamp-1 font-bold">{item.title}</p>
                <p className="line-clamp-2 text-sm text-white/50">
                  {item.description}
                </p>
              </span>
            </span>
          ))}
        </div>
      </motion.section>
    </motion.div>
  ) : (
    <div>Game not found!</div>
  );
}
