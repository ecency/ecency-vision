import React, { HTMLProps } from "react";
import { classNameObject } from "@/features/ui/util";

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
