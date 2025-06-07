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
    <motion.div className="size-full flex flex-col">
      <motion.section
        layout="position"
        className="flex flex-col mt-auto items-start p-12 pb-4"
      >
        <motion.img
          key={game.id + 3}
          initial={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            delay: 0.4,
          }}
          className="h-32 mt-auto mb-3"
          src={game.icon}
          alt={`${game.title} icon`}
        />
        <motion.h1
          className="text-5xl font-extrabold mb-2"
          key={game.id + 2}
          initial={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            delay: 0.3,
          }}
        >
          {game.title}
        </motion.h1>
        <motion.p
          key={game.id + 1}
          initial={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            delay: 0.2,
          }}
          className="line-clamp-3 max-w-[32rem] mb-3 text-lg text-white/80 font-light leading-6"
        >
          {game.description}
        </motion.p>
        <motion.span
          key={game.id + 0}
          initial={{ opacity: 0, x: 20, scale: 0.95, filter: "blur(4px)" }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
          transition={{
            type: "spring",
            damping: 30,
            stiffness: 300,
            delay: 0.1,
          }}
        >
          <button className="relative outline-4 hover:outline-offset-0 -outline-offset-4 hover:outline-accent  active:scale-y-95 active:scale-x-105 overflow-hidden flex gap-1.5 rounded-xl group px-14 pl-12 py-4 ease-in-out duration-300 bg-white hover:bg-primary items-center justify-center">
            {/* <div className="absolute opacity-0 group-hover:opacity-100 duration-300 ease-in-out inset-0 size-full bg-gradient-to-br from-white/72 via-white/0 to-white/0" /> */}
            <Icon
              icon="mdi:play"
              className="text-3xl relative text-black group-hover:text-white duration-300 ease-in-out"
            />
            <p className="relative font-black text-xl text-black group-hover:text-white duration-300 ease-in-out">
              PLAY
            </p>
          </button>
        </motion.span>
      </motion.section>
      <motion.section
        layout="size"
        initial={false}
        animate={{
          height: gameRow ? "auto" : 36,
        }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        className="w-full relative flex flex-col overflow-hidden"
      >
        <motion.div layout className="w-full shrink-0 h-9">
          <motion.button
            layout="position"
            onClick={() => setGameRow(!gameRow)}
            className="flex flex-col shrink-0 size-max cursor-pointer mb-2 items-center mx-auto relative overflow-hidden"
            initial={false}
            animate={{
              paddingTop: !gameRow ? "0.75rem" : "0.25rem",
              paddingBottom: !gameRow ? "0.25rem" : "0.75rem",
              paddingLeft: "0.25rem",
              paddingRight: "0.25rem",
            }}
            transition={{
              duration: 0.4,
              delay: 0.7,
            }}
          >
            <motion.div
              initial={false}
              animate={{
                rotate: gameRow ? 180 : 0,
                y: gameRow ? 8 : -8,
              }}
              transition={{
                duration: 0.4,
                delay: 0.7,
              }}
              className="absolute top-1/2 transform -translate-y-1/2"
            >
              <Icon icon="mdi-chevron-up" className="text-2xl leading-0" />
            </motion.div>
            <motion.p className="leading-4 relative z-10 text-nowrap">
              Games
            </motion.p>
          </motion.button>
        </motion.div>
        <div className="h-full contain-content flex *:relative overflow-x-auto bg-darker relative gap-4 p-5">
          <div
            className="!absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-l-8 border-r-8 border-darker/40"
            style={{
              backgroundSize: "auto 192px",
              backgroundPosition: "center center",
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
              className={`flex cursor-pointer max-w-72 h-full w-max overflow-hidden rounded-lg bg-element/24 backdrop-blur outline-2 outline-white/12 ease-gentle duration-300 hover:outline-primary outline-offset-0 hover:outline-offset-1 ${item.id === game?.id ? "!-outline-offset-0 !outline-primary/24 bg-primary/6" : ""}`}
            >
              <div className="p-4 flex gap-1.5">
                <img
                  className="h-16 w-auto"
                  src={item.icon}
                  alt={`${item.title} icon`}
                />
                <span className="leading-4 space-y-1 flex items-start h-16 justify-center flex-col">
                  <p className="text-lg leading-4 line-clamp-1 font-bold">
                    {item.title}
                  </p>
                  <p className="line-clamp-2 leading-4 text-sm text-white/50">
                    {item.description}
                  </p>
                </span>
              </div>
            </span>
          ))}
        </div>
      </motion.section>
    </motion.div>
  ) : (
    <div>Game not found!</div>
  );
}
