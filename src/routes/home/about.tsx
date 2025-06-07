import { useRemote } from "@/store/remote";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/about")({
  component: RouteComponent,
});

function RouteComponent() {
  const remote = useRemote();
  return (
    <div className="p-12 *:relative space-y-4 relative size-full bg-darker">
      <div
        className="!absolute inset-0 w-full opacity-60 h-full bg-[url('/row.png')] border-t-8 border-l-8 border-r-8 border-darker/40"
        style={{
          backgroundSize: "auto 192px",
          backgroundPosition: "center center",
        }}
      />
      <section className="p-6 relative rounded-2xl flex flex-col gap-2 bg-dark/40 backdrop-blur">
        <span className="text-4xl flex font-bold">
          Falion
          <a
            href={remote.website}
            className="ml-auto p-1.5 rounded-full hover:bg-element border border-transparent ease-gentle duration-300 hover:border-white/12"
            target="_blank"
          >
            <Icon icon="mdi:external-link" width={24} />
          </a>
        </span>
        <span className="text-lg font-light">Minecraft Server Provider</span>
        <p className="text-base font-light text-white/50">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit odio
          alias quibusdam quia molestias vitae! Nihil eius ducimus numquam
          debitis sunt soluta nam totam, temporibus placeat iste similique
          ratione architecto.
        </p>
      </section>
      <section className="p-6 relative rounded-2xl flex flex-col gap-2 bg-dark/40 backdrop-blur">
        <span className="text-4xl flex font-bold">
          Cubidron
          <a
            href="https://cubidron.com"
            className="ml-auto p-1.5 rounded-full hover:bg-element border border-transparent ease-gentle duration-300 hover:border-white/12"
            target="_blank"
          >
            <Icon icon="mdi:external-link" width={24} />
          </a>
        </span>
        <span className="text-lg font-light">Launcher Developer</span>
        <p className="text-base font-light text-white/50">
          We are design and technology enthusiasts, combining up-to-date, fast
          and secure technologies with modern and creative designs. We are here
          to develop as much as we can in many areas such as Web applications,
          Desktop and Mobile applications and turn what we know into great
          things.
        </p>
      </section>
    </div>
  );
}
