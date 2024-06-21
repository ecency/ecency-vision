import React, { HTMLProps } from "react";
import { classNameObject } from "@ui/util";

export function ModalFooter(props: HTMLProps<HTMLDivElement> & { sticky?: boolean }) {
  return (
    <div
      {...props}
      className={classNameObject({
        "p-3": true,
        "sticky bottom-0 bg-white border-t border-[--border-color]": props.sticky ?? false,
        [props.className ?? ""]: true
      })}
    />
  );
}
