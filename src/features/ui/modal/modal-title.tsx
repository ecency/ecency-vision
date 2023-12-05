import React, { HTMLProps } from "react";
import { classNameObject } from "@/features/ui/util";

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
