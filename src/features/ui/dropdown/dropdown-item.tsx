import React, { HTMLProps, useContext } from "react";
import { DropdownContext } from "@/features/ui/dropdown/dropdown-context";
import { classNameObject } from "@/features/ui/util";

export function DropdownItem(props: HTMLProps<HTMLDivElement>) {
  const { setShow } = useContext(DropdownContext);

  return (
    <div
      {...props}
      className={classNameObject({
        "min-w-[80%] cursor-pointer px-3 py-2 text-dark-default dark:text-white hover:bg-blue-dark-sky-040 hover:text-blue-dark-sky dark:hover:bg-gray-900 rounded-tr-2xl rounded-br-2xl":
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
