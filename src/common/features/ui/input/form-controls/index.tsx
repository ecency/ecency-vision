import React, { MutableRefObject } from "react";
import { Textarea, TextareaProps } from "./textarea";
import { Select, SelectProps } from "./select";
import { Input, InputProps } from "./input";
import { Checkbox, CheckboxProps } from "./checkbox";

type Props = (InputProps | TextareaProps | SelectProps | CheckboxProps) & {
  ref?: MutableRefObject<any>;
};

export function FormControl(props: Props) {
  switch (props.type) {
    case "textarea":
      return <Textarea {...props} />;
    case "select":
      return <Select {...props}>{props.children}</Select>;
    case "checkbox":
      return <Checkbox {...props} />;
    default:
      return <Input {...props} />;
  }
}
