import { AnimatePresence, motion } from "motion/react";
import { create } from "zustand";

interface IModal {
  _id?: string;
  children?: React.ReactNode;
  className?: string;
}
interface IModalStore {
  modals: IModal[];
  push: (modal: IModal) => void;
  close: (id: string) => void;
}
export const useModal = create<IModalStore>((set) => ({
  modals: [],
  push: (modal) => {
    let id = crypto.randomUUID();
    modal._id = id; // Ensure modal has a unique ID
    set((state) => ({
      modals: [...state.modals, modal],
    }));
    return id;
  },
  close: (id) => {
    set((state) => ({
      modals: state.modals.filter((item, i) => item._id !== id),
    }));
  },
}));

export const Modal = {
  push: useModal.getState().push,
  close: useModal.getState().close,
};

export function ModalRoot() {
  const { modals, close } = useModal();

  return (
    <>
      <AnimatePresence mode="wait">
        {modals.map((modal, index) => (
          <motion.span
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              close(modal._id!);
            }}
            className="fixed z-[100] inset-0 bg-black/40 grid place-items-center">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
                filter: "blur(8px)",
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.9,
                filter: "blur(8px)",
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className={`max-w-[80%] max-h-[80%] size-max overflow-auto p-4 bg-element/60 backdrop-blur-lg rounded-xl flex flex-col ${modal.className}`}>
              {modal.children}
            </motion.div>
          </motion.span>
        ))}
      </AnimatePresence>
    </>
  );
}
