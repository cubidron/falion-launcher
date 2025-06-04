import { useAlert } from ".";
import { clearLoading } from "../loading";

export default function AlertComponent() {
  const alert_store = useAlert();
  return (
    <>
      {alert_store.status && (
        console.log(alert_store.bg),
        clearLoading(),
        <section
          onClick={() => {
            if (!alert_store.force) {
              alert_store.clear();
            }
          }}
          data-tauri-drag-region
          className={`fixed z-[100] inset-0 bg-black/40 flex !bg-center ${alert_store.bg ? "bg-[url('/images/bg.png')]" : ""} bg-blend-darken !bg-cover flex-col items-center justify-center`}>
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="w-64 p-4 bg-body/60 backdrop-blur-2xl shadow-xl shadow-black/20 rounded-lg flex flex-col items-center justify-center">
            <h1 className="font-bold text-base text-center mt-1">
              {alert_store.title}
            </h1>
            <p className="text-xs !select-all text-center font-light">
              {alert_store.message}
            </p>
            <div className="flex  w-full mt-auto pt-4 justify-end gap-2">
              {!alert_store.force && (
                <button
                  className={`px-5 w-full py-0.5 cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-2 bg-primary rounded-lg flex items-center justify-center outline-none ${alert_store.action ? "!bg-white/6" : "!bg-primary"}`}
                  onClick={alert_store.clear}
                  type="button">
                  {alert_store.action ? "Cancel" : "Done"}
                </button>
              )}
              {alert_store.action && (
                <button
                  className="px-5 w-full py-0.5 cursor-pointer ease-smooth duration-200 hover:saturate-150 gap-2 bg-primary rounded-lg flex items-center justify-center outline-none"
                  onClick={async () => {
                    await alert_store.action?.();
                    alert_store.beforeAction?.();
                    alert_store.clear();
                  }}
                  type="button"
                  autoFocus>
                  Done
                </button>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
