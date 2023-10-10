import React, { forwardRef, HTMLProps } from "react";
import { classNameObject } from "../../../../helper/class-name-object";
import { INPUT_DARK_STYLES, INPUT_STYLES, INVALID_INPUT_STYLES } from "./input-styles";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  type: "text" | "password" | "number" | "email" | "range";
  noStyles?: boolean;
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
        [INPUT_STYLES]: !(props.noStyles ?? false),
        [INPUT_DARK_STYLES]: !(props.noStyles ?? false),
        [INVALID_INPUT_STYLES]: !(props.noStyles ?? false),
        [props.className ?? ""]: !!props.className
      })}
    />
  );
});
