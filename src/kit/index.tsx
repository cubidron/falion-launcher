import AlertComponent from "./alert/Alert";
import "./kit.css";
import Loading from "./loading/Loading";
import NotifyComponent from "./notification/Notify";

export function RootComponent() {
  return (
    <>
      <Loading />
      <AlertComponent />
      <NotifyComponent />
    </>
  );
}
