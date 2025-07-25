import Alert from "@/kit/alert";
import { clearLoading, setLoading } from "@/kit/loading";
import { useAuth } from "@/store/auth";
import { microsoftAuth } from "@/tauri/commands";
import { Icon } from "@iconify/react/dist/iconify.js";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleMicrosoftLogin = async () => {
    try {
      setLoading("Please wait", "Logging in with Microsoft...");
      const res = await microsoftAuth();
      clearLoading();
      if (res) {
        auth.online(res);
        navigate({
          to: "/auth/confirm",
        });
      }
    } catch (error) {
      Alert({
        title: "There is an error!",
        message: "We cannot logged in!",
      });
    }
  };

  return (
    <>
      <h1 className="text-4xl font-extrabold">Falion Launcher</h1>
      <p className="font-light">Welcome to our server.</p>
      <h3 className="text-2xl font-semibold">Log In!</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          // @ts-ignore
          const username = (e.target as HTMLFormElement).name.value;
          let regex = /^[a-zA-Z0-9_]{2,16}$/;
          if (!username || !regex.test(username)) {
            Alert({
              title: "Invalid Nickname",
              message:
                "Nickname must be 2-16 characters long and can only contain letters, numbers, and underscores.",
            });
            return;
          }
          const res = await auth.offline(username);
          if (res) {
            navigate({
              to: "/auth/confirm",
            });
          } else {
            Alert({
              title: "There is an error!",
              message: "We cannot logged in!",
            });
          }
        }}
        className="flex w-80 flex-col gap-1.5">
        <input
          type="text"
          name="name"
          id="name"
          spellCheck="false"
          autoComplete="off"
          autoCorrect="off"
          placeholder="Nickname"
          className="TextField text-center"
        />
        <button type="submit" className="Button">
          <p>Log In </p>
          <Icon icon="mdi:arrow-right" />
        </button>
        <span className="flex w-full items-center my-2 gap-2 text-xs">
          <div className="hr" />
          <span className="size-max text-nowrap">OR</span>
          <div className="hr" />
        </span>
        <button
          onClick={async () => await handleMicrosoftLogin()}
          type="button"
          className="Button flex items-center justify-center !h-20">
          {/* log in with microsoft icon from fluent */}
          <Icon icon="logos:microsoft" className="text-3xl" />
        </button>
        <p className="!text-xs text-white/50 mt-1 text-center">
          Don't have an account?{" "}
          <a
            href="https://minecraft.net"
            target="_blank"
            className="text-primary hover:underline">
            Sign Up!
          </a>
        </p>
      </form>
    </>
  );
}
