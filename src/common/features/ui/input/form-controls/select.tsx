import React, { HTMLProps, ReactNode } from "react";
import { classNameObject } from "../../../../helper/class-name-object";
import { INPUT_DARK_STYLES, INPUT_STYLES } from "@ui/input/form-controls/input-styles";
import { useFilteredProps } from "../../../../util/props-filter";

// TODO: Add styles for select in input-group

export interface SelectProps extends Omit<HTMLProps<HTMLSelectElement>, "size"> {
  type: "select";
  children: ReactNode;
  full?: boolean;
  size?: "md" | "xs";
}

export function Select(props: SelectProps) {
  const nativeProps = useFilteredProps(props, ["full"]);

  return (
    <select
      {...nativeProps}
      className={classNameObject({
        [INPUT_STYLES]: true,
        [INPUT_DARK_STYLES]: true,
        "px-2 py-1 text-sm": props.size === "xs",
        [props.className ?? ""]: true,
        "!w-auto": props.full === false
      })}
    >
      {props.children}
    </select>
  );
}
