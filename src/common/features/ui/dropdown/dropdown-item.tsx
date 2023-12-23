import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { DropdownContext } from "@ui/dropdown/dropdown-context";

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

export function DropdownItemWithIcon(props: HTMLProps<HTMLDivElement>) {
  return <DropdownItem {...props} className="flex items-center gap-3 [&>svg]:w-3.5" />;
}
