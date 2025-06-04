import { create } from "zustand";

export interface IAlert {
  title: string;
  message: string;
  force?: boolean;
  bg?: boolean;
  action?: () => void | Promise<void>;
  beforeAction?: () => void;
}
export interface IAlertStore extends IAlert {
  status: boolean;
  clear: () => void;
}

// export function alert(
//   title: string,
//   message: string,
//   action?: () => void,
//   force?: boolean,
//   bg?: boolean
// ) {
//   if (!useAlert.getState().status) {
//     useAlert.getState().set(title, message, action, force || false, bg);
//   }
// }

export const useAlert = create<IAlertStore>((set) => ({
  status: false,
  title: "",
  message: "",
  clear: () => {
    set({
      status: false,
      title: "",
      message: "",
      action: () => { },
      force: false,
    });
  },
}));
export default function Alert(props: IAlert) {
  useAlert.setState({
    status: true,
    title: props.title,
    message: props.message,
    action: props.action,
    beforeAction: props.beforeAction,
    force: props.force || false,
    bg: props.bg || false,
  })
}