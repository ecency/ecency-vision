import React from "react";
import "./_index.scss";

interface Props {
  labels: string[];
  selected: number;
  className?: string;
  setSelected: (i: number) => void;
}

export const ButtonGroup = ({ labels, selected, className, setSelected }: Props) => {
  return (
    <div className={"toggle-with-label " + className}>
      {labels.map((label, key) => (
        <span
          key={label}
          className={selected === key ? "selected" : ""}
          onClick={() => setSelected(key)}
        >
          {label}
        </span>
      ))}
    </div>
  );
};
