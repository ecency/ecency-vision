import React, { HTMLProps, useRef, useState } from "react";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { classNameObject } from "../../../helper/class-name-object";
import useClickAway from "react-use/lib/useClickAway";

export * from "./dropdown-item";
export * from "./dropdown-menu";
export * from "./dropdown-toggle";

export function Dropdown(props: HTMLProps<HTMLDivElement>) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useClickAway(ref, () => setShow(false));

  return (
    <DropdownContext.Provider value={{ show, setShow }}>
      <div
        {...props}
        ref={ref}
        className={classNameObject({
          relative: true,
          [props.className ?? ""]: !!props.className
        })}
      />
    </DropdownContext.Provider>
  );
}
