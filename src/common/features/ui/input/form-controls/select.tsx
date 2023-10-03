import React, { HTMLProps, ReactNode } from "react";
import { classNameObject } from "../../../../helper/class-name-object";
import { INPUT_DARK_STYLES, INPUT_STYLES } from "@ui/input/form-controls/input-styles";

// TODO: Add styles for select in input-group

export interface SelectProps extends HTMLProps<HTMLSelectElement> {
  type: "select";
  children: ReactNode;
}

export function Select(props: SelectProps) {
  return (
    <select
      {...props}
      className={classNameObject({
        [INPUT_STYLES]: true,
        [INPUT_DARK_STYLES]: true,
        [props.className ?? ""]: true
      })}
    >
      {props.children}
    </select>
  );
}
