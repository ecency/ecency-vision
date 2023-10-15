import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { useFilteredProps } from "../../../util/props-filter";

interface Props {
  align?: "left" | "right";
}

export function DropdownMenu(props: HTMLProps<HTMLDivElement> & Props) {
  const { show } = useContext(DropdownContext);

  const nativeProps = useFilteredProps(props, ["align"]);

  return show ? (
    <div
      {...nativeProps}
      className={classNameObject({
        "z-[1000] absolute top-[100%] flex flex-col items-start border min-w-[200px] py-2 gap-2 pr-3 rounded-xl bg-white":
          true,
        "right-0": props.align === "right",
        [props.className ?? ""]: !!props.className
      })}
    />
  ) : (
    <></>
  );
}
