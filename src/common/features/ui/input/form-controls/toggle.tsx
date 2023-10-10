import React, { HTMLProps } from "react";
import { classNameObject } from "../../../../helper/class-name-object";

export interface ToggleProps extends Omit<HTMLProps<HTMLElement>, "onChange"> {
  type: "checkbox";
  checked: boolean;
  onChange: (e: boolean) => void;
  label?: string;
  isToggle?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <div
      className={classNameObject({
        "ecency-toggle cursor-pointer flex items-center gap-3": true
      })}
      onClick={() => onChange(!checked)}
    >
      <div
        className={classNameObject({
          "border-2 rounded-full bg-gray-100 p-0.5 w-[2.5rem] duration-300": true,
          "bg-green border-green": checked
        })}
      >
        <div
          className={classNameObject({
            "ecency-toggle-icon rounded-full w-3.5 h-3.5 duration-300": true,
            "bg-white translate-x-[1.125rem]": checked,
            "bg-gray-300": !checked,
            "opacity-50": disabled
          })}
        />
      </div>
      {label && <div>{label}</div>}
    </div>
  );
}
