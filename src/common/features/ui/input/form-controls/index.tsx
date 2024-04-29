import React, { forwardRef } from "react";
import { Textarea, TextareaProps } from "./textarea";
import { Select, SelectProps } from "./select";
import { Input, InputProps } from "./input";
import { Checkbox, CheckboxProps } from "./checkbox";
import { Toggle } from "@ui/input/form-controls/toggle";

type Props = InputProps | TextareaProps | SelectProps | CheckboxProps | { type: "date" };

export const FormControl = forwardRef<any, Props>((props, ref) => {
  switch (props.type) {
    case "textarea":
      return <Textarea {...props} ref={ref} />;
    case "select":
      return (
        <Select {...props} ref={ref}>
          {props.children}
        </Select>
      );
    case "checkbox":
      if (props.isToggle) {
        return <Toggle {...props} ref={ref} />;
      }
      return <Checkbox {...props} ref={ref} />;
    default:
      return <Input {...props} ref={ref} />;
  }
}) as React.FC<Props>;

// https://github.com/storybookjs/storybook/issues/21898
// This actually relates of our version of React. Need to upgrade the package
