import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Falion Launcher</h1>
      <h4>Welcome to our server.</h4>
      <h2>Log In!</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          //Login logic
        }}
        className="flex flex-col gap-1.5"
      >
        <input
          type="text"
          name="name"
          id="name"
          placeholder="Nickname"
          className="TextField text-center"
        />
        <button type="submit" className="Button">
          Log In
        </button>
        <span className="flex w-full items-center my-2 gap-2 text-xs">
          <div className="hr" />
          <span className="size-max text-nowrap">OR</span>
          <div className="hr" />
        </span>
        <button className="Button flex items-center justify-center !h-20">
          {/* log in with microsoft icon from fluent */}
          <Icon icon="logos:microsoft" className="text-3xl" />
        </button>
        <p className="!text-xs text-white/50 mt-1 text-center">
          Don't have an account?{" "}
          <a
            href="https://minecraft.net"
            target="_blank"
            className="text-primary hover:underline"
          >
            Sign Up!
          </a>
        </p>
      </form>
    </>
  );
}
