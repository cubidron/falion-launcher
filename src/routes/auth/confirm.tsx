import { useAuth } from "@/store/auth";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/confirm")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  return (
    <>
      <h1>Falion Launcher</h1>
      <h4>Confirm your account.</h4>
      <div className="flex w-80 flex-col gap-1.5">
        <span className="bg-element py-4 gap-1 rounded-lg flex flex-col items-center justify-center">
          {auth.user && (
            <>
              <img
                className="size-20 rounded-md bg-white/12 p-1.5"
                src={`https://visage.surgeplay.com/face/${
                  auth.user?.username ?? "MHF_Steve"
                }`}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://visage.surgeplay.com/face/MHF_Steve"; // Fallback image
                }}
                alt=""
              />

              <h2 className={`font-semibold text-2xl leading-[100%]`}>
                {auth.user?.username}
              </h2>
              <p className="text-base font-extralight leading-[100%]">
                {auth.user.access_token
                  ? "Microsoft Account"
                  : "Offline Account"}
              </p>
            </>
          )}
        </span>
        <Link
          to="/home"
          type="submit"
          className="Button items-center justify-center flex"
        >
          Confirm
        </Link>
        <p className="!text-xs text-white/50 mt-1 text-center">
          Isn't this you?{" "}
          <Link to="/auth" className="text-primary hover:underline">
            Cancel
          </Link>
        </p>
      </div>
    </>
  );
}
