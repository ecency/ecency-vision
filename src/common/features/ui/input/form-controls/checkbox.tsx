import React, { HTMLProps } from "react";
import { checkSvg } from "../../../../img/svg";
import { classNameObject } from "../../../../helper/class-name-object";

export interface CheckboxProps extends Omit<HTMLProps<HTMLElement>, "onChange"> {
  type: "checkbox";
  checked: boolean;
  onChange: (e: boolean) => void;
  label?: string;
}

export function Checkbox({ checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <div
      className="ecency-checkbox cursor-pointer flex items-center justify-center gap-3"
      onClick={() => onChange(!checked)}
    >
      <div
        className={classNameObject({
          "border-2 rounded-md w-[1.25rem] h-[1.25rem] flex items-center justify-center duration-300":
            true,
          "hover:border-gray-400": !disabled,
          "opacity-50": disabled
        })}
      >
        {checked ? checkSvg : <></>}
      </div>
      {label && <div>{label}</div>}
    </div>
  );
}
