import React from "react";
import "./_index.scss";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  labels: string[];
  selected: number;
  className?: string;
  setSelected: (i: number) => void;
}

export const ButtonGroup = ({ labels, selected, className, setSelected }: Props) => {
  return (
    <div
      className={classNameObject({
        "grid gap-4 rounded-[1rem] p-2 bg-gray-100": true,
        [className ?? ""]: !!className
      })}
      style={{
        gridTemplateColumns: `repeat(${labels.length}, 1fr)`
      }}
    >
      {labels.map((label, key) => (
        <span
          key={label}
          className={classNameObject({
            "duration-300 flex items-center justify-center rounded-[0.5rem] p-2 border cursor-pointer border-transparent":
              true,
            "bg-blue-dark-sky text-white": selected === key,
            "hover:border-blue-dark-sky-hover hover:text-blue-dark-sky": selected !== key
          })}
          onClick={() => setSelected(key)}
        >
          {label}
        </span>
      ))}
    </div>
  );
};
