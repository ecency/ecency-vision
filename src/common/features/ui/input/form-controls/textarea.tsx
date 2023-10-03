import React, { HTMLProps } from "react";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  INPUT_DARK_STYLES,
  INPUT_STYLES,
  INVALID_INPUT_STYLES
} from "@ui/input/form-controls/input-styles";

export interface TextareaProps extends HTMLProps<HTMLTextAreaElement> {
  type: "textarea";
}

export function Textarea(props: TextareaProps) {
  return (
    <textarea
      {...props}
      className={classNameObject({
        [INPUT_STYLES]: true,
        [INPUT_DARK_STYLES]: true,
        [INVALID_INPUT_STYLES]: true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
