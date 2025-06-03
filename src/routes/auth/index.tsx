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
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
          className="TextField text-center"
        />
        <button type="submit" className="Button">
          Log In
        </button>
        <p className="!text-xs text-white/50 mt-1 text-center">
          Don't have an account?{" "}
          <a href="" className="text-primary hover:underline">
            Sign Up!
          </a>
        </p>
      </form>
    </>
  );
}
