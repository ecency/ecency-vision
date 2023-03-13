import React from "react";
import "./index.scss";

interface Props {
  switched: boolean;
  onChange: (value: boolean) => void;
}

export const Switch = ({ switched, onChange }: Props) => {
  return (
    <div
      className={"switch-toggler cursor-pointer " + (switched ? "switched" : "")}
      onClick={() => onChange(!switched)}
    >
      <div className="switcher" />
    </div>
  );
};
