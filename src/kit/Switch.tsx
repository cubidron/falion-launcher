import { motion } from "motion/react";

export default function Switch(props: {
  value: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => props.onChange(!props.value)}
      className={`bg-dark w-10 flex relative rounded-full p-0.5 h-6 ${
        props.value ? "justify-end bg-primary" : "justify-start"
      } ${props.className}`}>
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 35 }}
        className={`rounded-full h-full aspect-square w-auto ${
          props.value ? "bg-white" : "bg-white mix-blend-luminosity"
        }`}></motion.div>
    </button>
  );
}
