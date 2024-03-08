import Slider from "react-input-slider";
import React, { useRef } from "react";

interface Props {
  value: number;
  onChange: (v: number) => void;
}

export function ReactInputSliderWrapper({ value, onChange }: Props) {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const step = 0.1;

  const handleKeyboard = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" && value > 0) {
      onChange(value - step);
    }
    if (e.key === "ArrowRight" && value < 100) {
      onChange(value + step);
    }
  };

  return (
    <span
      ref={rootRef}
      tabIndex={0}
      className="w-full flex [&>div]:w-full"
      onKeyUp={handleKeyboard}
      onClick={() => rootRef.current?.focus()}
    >
      <Slider axis="x" xstep={step} x={value} onChange={({ x }) => onChange(x)} />
    </span>
  );
}
