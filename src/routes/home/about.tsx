import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/home/about")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="p-12 space-y-4">
      <section className="p-6 relative rounded-2xl flex flex-col gap-2 bg-dark">
        <span className="items-start flex gap-4">
          <span className="text-4xl font-bold mr-auto">Falion</span>
          <span className="px-4 py-1 text-xs w-max rounded-full bg-primary/24 outline outline-primary/48">
            Minecraft Server Provider
          </span>
        </span>
        <p className="text-base font-light text-white/50">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit odio
          alias quibusdam quia molestias vitae! Nihil eius ducimus numquam
          debitis sunt soluta nam totam, temporibus placeat iste similique
          ratione architecto.
        </p>
      </section>
      <section className="p-6 relative rounded-2xl flex flex-col gap-2 bg-dark">
        <span className="items-start flex gap-4">
          <span className="text-4xl font-bold mr-auto">Cubidron</span>
          <span className="px-4 py-1 text-xs w-max rounded-full bg-primary/24 outline outline-primary/48">
            Launcher Developer
          </span>
        </span>
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
