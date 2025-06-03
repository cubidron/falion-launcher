import {
  createRootRoute,
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => <Layout />,
});

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col relative w-svw h-svh bg-darker">
      <Outlet />
      <div className="flex border-dashed border-2 border-red-400 p-0.5 rounded-md fixed inset-0 size-max z-50 mx-auto bg-white/24 backdrop-blur-2xl text-white gap-2">
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
      <footer className="h-11 text-xs text-white/60 bg-darker font-light flex justify-between items-center px-4 relative">
        <div
          className="absolute inset-0 w-full opacity-60 h-full bg-[url('/footer.jpeg')]"
          style={{
            backgroundSize: "auto 128px",
            backgroundPosition: "center",
          }}
        />
        <p className="relative z-10">Version 1.0.0</p>
        <p className="relative z-10">Not affiliated with Mojang Studios</p>
        <p className="relative z-10">2025 ©Falion Launcher</p>
      </footer>
    </div>
  );
}
