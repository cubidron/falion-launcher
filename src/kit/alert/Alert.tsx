import { useAlert } from ".";
import { clearLoading } from "../loading";

export default function AlertComponent() {
  const alert_store = useAlert();
  return (
    <>
      {alert_store.status &&
        (console.log(alert_store.bg),
        clearLoading(),
        (
          <section
            onClick={() => {
              if (!alert_store.force) {
                alert_store.clear();
              }
            }}
            data-tauri-drag-region
            className={`fixed z-[100] inset-0 bg-black/40 flex !bg-center ${alert_store.bg ? "bg-[url('/images/bg.png')]" : ""} bg-blend-darken !bg-cover flex-col items-center justify-center`}
          >
            <div
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-64 p-4 px-6 bg-element/60 backdrop-blur-2xl shadow-xl shadow-black/20 rounded-lg flex flex-col items-start justify-center"
            >
              <h1 className="font-bold text-xl mt-1">{alert_store.title}</h1>
              <p className="text-base !select-all font-light">
                {alert_store.message}
              </p>
              <div className="flex  w-full mt-auto pt-4 justify-end gap-2">
                {!alert_store.force && (
                  <button
                    className={`Button w-full ${alert_store.action ? "!bg-element" : "!bg-primary"}`}
                    onClick={alert_store.clear}
                    type="button"
                  >
                    {alert_store.action ? "Cancel" : "Done"}
                  </button>
                )}
                {alert_store.action && (
                  <button
                    className="Button w-full"
                    onClick={async () => {
                      alert_store.clear();
                      await alert_store.action?.();
                    }}
                    type="button"
                    autoFocus
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </section>
        ))}
    </>
  );
}
