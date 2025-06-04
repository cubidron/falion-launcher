import { useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  const remote = useRemote();
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
          <div className="aspect-square p-1 flex items-center jsucer-content bg-element rounded-lg">
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
          <header className="h-16 bg-blue-500/10">2</header>
          <main className="flex-1 bg-green-500/10">3</main>
        </div>
      </div>
    </>
  );
}
