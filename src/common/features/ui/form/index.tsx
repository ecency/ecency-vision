import React, { forwardRef, HTMLProps } from "react";
import { classNameObject } from "../../../helper/class-name-object";

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
