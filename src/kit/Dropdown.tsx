import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SelectBoxProps<T> {
  midi?: boolean;
  options: T[];
  id: string;
  value: T;
  onChange: (value: T) => void;
  displayValue: (item: T) => string;
}

export default function Dropdown<T>({
  midi,
  options,
  id,
  value,
  onChange,
  displayValue,
}: SelectBoxProps<T>) {
  const [modal, setModal] = useState(false);
  const [maxWidth, setMaxWidth] = useState(96);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // set initial selected value
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.${id}`)) {
        setModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    setTimeout(() => {
      setModal(false);
    }, 0);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const buttons = containerRef.current.querySelectorAll("button");
      let maxButtonWidth = 0;
      buttons.forEach((btn) => {
        const width = btn.clientWidth;
        if (width > maxButtonWidth) {
          maxButtonWidth = width;
        }
      });
      setMaxWidth(maxButtonWidth);
    }
  }, [modal, options]);

  return (
    <span
      key={id}
      style={{
        maxWidth: `${maxWidth < 360 ? maxWidth : 360}px`,
      }}
      className={`relative min-w-36 ${id}`}
      ref={containerRef}>
      <button
        onClick={() => {
          setModal(!modal);
        }}
        className={`flex relative w-full text-start items-center justify-between h-10 px-3 rounded-lg text-sm font-normal bg-dark`}>
        <span className="flex-1 truncate">{displayValue(value)}</span>
        <div className="h-5 grid p-1 place-items-center w-max aspect-square">
          <svg
            width="9"
            height="6"
            viewBox="0 0 9 6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0.76001 1.11279C0.899474 0.973502 1.08852 0.895264 1.28563 0.895264C1.48274 0.895264 1.67179 0.973502 1.81126 1.11279L4.5088 3.81034L7.20634 1.11279C7.34734 0.981406 7.53384 0.909879 7.72653 0.913279C7.91923 0.916679 8.10309 0.994741 8.23936 1.13102C8.37564 1.2673 8.45371 1.45115 8.45711 1.64385C8.46051 1.83655 8.38898 2.02304 8.25759 2.16404L5.03442 5.38721C4.89496 5.5265 4.70591 5.60474 4.5088 5.60474C4.31169 5.60474 4.12264 5.5265 3.98318 5.38721L0.76001 2.16404C0.620719 2.02458 0.54248 1.83553 0.54248 1.63842C0.54248 1.44131 0.620719 1.25226 0.76001 1.11279Z"
              fill="white"
            />
          </svg>
        </div>
      </button>
      <AnimatePresence>
        {modal && (
          <motion.ul
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute flex flex-col z-50 gap-1 backdrop-blur p-1 min-w-full left-0 top-full mt-2 w-max h-max bg-dark/90 shadow-lg shadow-black/25 rounded-xl overflow-hidden">
            {options.map((item, idx) => (
              <button
                title={displayValue(item)}
                key={idx}
                onClick={() => {
                  onChange(item);
                  setModal(false);
                }}
                className={`flex text-start items-center justify-start w-full rounded-lg px-3 h-8 text-sm font-normal hover:bg-primary ${
                  item === value ? "bg-primary" : ""
                }`}>
                <span className="flex-1 truncate">{displayValue(item)}</span>
              </button>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </span>
  );
}
