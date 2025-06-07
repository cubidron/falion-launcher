import React, { useState } from "react";
import { motion } from "motion/react";

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  steps?: boolean;
  value?: number;
  onChange?: (value: number) => void;
}

const Slider: React.FC<SliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  steps = false,
  value: propValue,
  onChange,
}) => {
  const [internalValue, setInternalValue] = useState(propValue || 0);
  const value = propValue !== undefined ? propValue : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (propValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  return (
    <div className="relative h-6 overflow-hidden rounded-md bg-element w-72">
      <motion.div
        className="absolute inset-0 left-0 h-6 my-auto bg-white"
        style={{ width: `${(value / max) * 100}%` }}
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.2 }}
      />
      {steps && (
        <div className="absolute left-0 flex flex-row w-full h-full">
          {Array.from({ length: max }).map((_, index) => (
            <div
              key={index}
              className={`w-full min-w-1 h-4 my-auto col-span-1 border-r border-gray-600 ${
                index === max - 1 ? "!border-r-0" : ""
              }`}
            />
          ))}
        </div>
      )}
      <input
        className="relative slider"
        type="range"
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        style={{
          WebkitAppearance: "none",
          appearance: "none",
          width: "100%",
          height: "100%",
          background: "transparent",
          outline: "none",
        }}
      />

      <style>{`
        .slider:hover {
          opacity: 1;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 2px;
          height: 100%;
          background: transparent;
          cursor: pointer;
        }

        .slider::-moz-range-thumb {
          width: 25px;
          height: 25px;
          background: transparent;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default Slider;
