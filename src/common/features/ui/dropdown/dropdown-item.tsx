import React, { HTMLProps, ReactNode, useContext } from "react";
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

export function DropdownItemWithIcon(
  props: HTMLProps<HTMLDivElement> & { icon: ReactNode; label: ReactNode }
) {
  return (
    <DropdownItem {...props}>
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-dark-sky [&>div>svg]:w-4">
        <div>{props.icon}</div>
        <div className="text-sm font-semibold">{props.label}</div>
      </div>
    </DropdownItem>
  );
}
