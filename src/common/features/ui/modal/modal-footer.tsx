import { classNameObject } from "../../../helper/class-name-object";
import React, { HTMLProps } from "react";

export function ModalFooter(props: HTMLProps<HTMLDivElement>) {
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
