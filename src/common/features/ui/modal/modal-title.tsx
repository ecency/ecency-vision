import React, { HTMLProps } from "react";
import { classNameObject } from "../../../helper/class-name-object";

export function ModalTitle(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNameObject({
        "text-xl": true,
        [props.className ?? ""]: true
      })}
    />
  );
}
