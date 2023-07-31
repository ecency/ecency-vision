import React, { HTMLProps } from "react";
import { classNameObject } from "../../helper/class-name-object";

export function ModalBody(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNameObject({
        "p-3": true,
        [props.className ?? ""]: true
      })}
    />
  );
}
