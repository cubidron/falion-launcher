import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/home")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div className="relative size-full">
        <img
          src="/bg.jpg"
          className="absolute brightness-50 inset-0 size-full"
          alt=""
        />
        <main className="relative flex flex-col items-start justify-start size-full">
          <Outlet />
        </main>
      </div>
    </>
  );
}
