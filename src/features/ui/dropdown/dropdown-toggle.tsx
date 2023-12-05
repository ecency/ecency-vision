import React, { HTMLProps, useContext } from "react";
import { DropdownContext } from "./dropdown-context";
import { classNameObject } from "@/features/ui/util";

export function DropdownToggle(props: HTMLProps<HTMLDivElement>) {
  const { setShow, show } = useContext(DropdownContext);
  return (
    <div
      {...props}
      className={classNameObject({
        "cursor-pointer": true,
        [props.className ?? ""]: !!props.className
      })}
      onClick={(e) => {
        setShow(!show);
        props.onClick?.(e);
      }}
    />
  );
}
