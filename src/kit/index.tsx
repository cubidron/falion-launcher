import AlertComponent from "./alert/Alert";
import "./kit.css";
import Loading from "./loading/Loading";
import { ModalRoot } from "./Modal";
import NotifyComponent from "./notification/Notify";

export function RootComponent() {
  return (
    <>
      <Loading />
      <AlertComponent />
      <NotifyComponent />
      <ModalRoot />
    </>
  );
}
