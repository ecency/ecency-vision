import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { DropdownContext } from "@ui/dropdown/dropdown-context";

export function DropdownItem(props: HTMLProps<HTMLDivElement>) {
  const { setShow } = useContext(DropdownContext);

  return (
    <div
      {...props}
      className={classNameObject({
        "min-w-[80%] cursor-pointer px-3 py-2 text-dark-default hover:bg-blue-dark-sky-040 hover:text-blue-dark-sky rounded-tr-2xl rounded-br-2xl":
          true,
        [props.className ?? ""]: !!props.className
      })}
      onClick={(e) => {
        setShow(false);
        props.onClick?.(e);
      }}
    />
  );
}
