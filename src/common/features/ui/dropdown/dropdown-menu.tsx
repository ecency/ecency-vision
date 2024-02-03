import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { useFilteredProps } from "../../../util/props-filter";

interface Props {
  align?: "left" | "right" | "top" | "bottom";
}

export function DropdownMenu(props: HTMLProps<HTMLDivElement> & Props) {
  const { show } = useContext(DropdownContext);

  const nativeProps = useFilteredProps(props, ["align"]);

  return show ? (
    <div
      {...nativeProps}
      className={classNameObject({
        "z-[1000] ecency-dropdown-menu absolute flex flex-col items-start border border-[--border-color] min-w-[200px] py-2 gap-2 pr-3 rounded-xl bg-white":
          true,
        "right-0": props.align === "right",
        "top-[100%]": (props.align ?? "bottom") === "bottom",
        "bottom-[100%]": props.align === "top",
        [props.className ?? ""]: !!props.className
      })}
    />
  ) : (
    <></>
  );
}
