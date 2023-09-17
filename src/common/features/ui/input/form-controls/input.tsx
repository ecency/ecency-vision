import React, { forwardRef, HTMLProps } from "react";
import { classNameObject } from "../../../../helper/class-name-object";
import { INPUT_STYLES, INVALID_INPUT_STYLES } from "./input-styles";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  type: "text" | "password" | "number" | "email" | "range";
  // TODO: styles for that
  plaintext?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      ref={ref}
      {...props}
      className={classNameObject({
        [INPUT_STYLES]: true,
        [INVALID_INPUT_STYLES]: true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
});
