import React, { HTMLProps, useContext, useRef, useState } from "react";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { classNameObject } from "../../../helper/class-name-object";
import useClickAway from "react-use/lib/useClickAway";
import { UIContext } from "@ui/core";

export * from "./dropdown-item";
export * from "./dropdown-menu";
export * from "./dropdown-toggle";

export function Dropdown(props: HTMLProps<HTMLDivElement>) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { openPopovers } = useContext(UIContext);

  useClickAway(ref, () => {
    if (openPopovers.size === 0) {
      setShow(false);
    }
  });

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
