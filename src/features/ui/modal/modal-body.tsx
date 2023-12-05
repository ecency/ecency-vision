import React, { HTMLProps } from "react";
import { classNameObject } from "@/features/ui/util";

export function ModalBody(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNameObject({
        "p-3 ecency-modal-body": true,
        [props.className ?? ""]: true
      })}
    />
  );
}
