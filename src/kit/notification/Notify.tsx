import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNotify } from ".";

export default function NotifyComponent() {
  const notify = useNotify();
  const notis = notify.notis;

  useEffect(() => {
    let i = setInterval(() => {
      notify.remove();
    }, 3000);
    return () => clearInterval(i);
  }, [notify]);

  return (
    <div className="flex flex-col-reverse h-max gap-2 w-[440px] py-12 pointer-events-none fixed z-[900] inset-0 mx-auto">
      {notis.length > 0 && (
        <AnimatePresence mode="popLayout">
          {notis.map((noti) => (
            <motion.div
              key={noti.id}
              layout
              animate={{ opacity: 1, y: 0, scale: 1 }}
              initial={{ opacity: 0, y: -100, scale: 1.1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 30, stiffness: 200 }}
              className="bg-body/60 backdrop-blur-2xl relative text-white !rounded-xl px-6 py-2 text-sm text-center font-medium">
              {noti.text}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
