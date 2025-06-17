import React, { useRef, ReactNode, useEffect } from "react";

export default function DragWrapper({
  rootClass = "",
  children,
}: {
  rootClass?: string;
  children: ReactNode;
}) {
  const sliderRef = useRef<HTMLElement>(null);
  const isMouseDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDown.current = true;
    const slider = sliderRef.current;
    if (!slider) return;

    slider.style.scrollBehavior = "auto";
    startX.current = e.clientX - slider.offsetLeft;
    scrollLeft.current = slider.scrollLeft;

    // Add native event listeners for smoother tracking
    slider.addEventListener("mousemove", handleMouseMove);
    slider.addEventListener("mouseup", handleMouseUp);
    slider.addEventListener("mouseleave", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isMouseDown.current || !sliderRef.current) return;
    e.preventDefault();

    const x = e.clientX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Direct 1:1 movement ratio
    sliderRef.current.scrollLeft = scrollLeft.current - walk;
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
    const slider = sliderRef.current;
    if (!slider) return;

    slider.style.scrollBehavior = "smooth";

    // Clean up native listeners
    slider.removeEventListener("mousemove", handleMouseMove);
    slider.removeEventListener("mouseup", handleMouseUp);
    slider.removeEventListener("mouseleave", handleMouseUp);
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (sliderRef.current) {
        sliderRef.current.removeEventListener("mousemove", handleMouseMove);
        sliderRef.current.removeEventListener("mouseup", handleMouseUp);
        sliderRef.current.removeEventListener("mouseleave", handleMouseUp);
      }
    };
  }, []);

  return (
    <div
      className={`${rootClass} w-full`}
      style={{
        scrollBehavior: "inherit",
      }}>
      {React.cloneElement(children as React.ReactElement, {
        ref: sliderRef,
        onMouseDown: handleMouseDown,
        style: { cursor: "grab", userSelect: "none" },
      })}
    </div>
  );
}
