import React, { forwardRef, HTMLProps } from "react";
import { classNameObject } from "@/features/ui/util";

export const Form = forwardRef<HTMLFormElement, HTMLProps<HTMLFormElement>>((props, ref) => {
  return (
    <form
      {...props}
      ref={ref}
      className={classNameObject({
        block: true,
        [props.className ?? ""]: true
      })}
    />
  );
});
