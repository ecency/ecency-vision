import React, { HTMLProps } from "react";
import { INPUT_STYLES } from "@ui/input/form-controls/input-styles";

export interface InputProps extends HTMLProps<HTMLInputElement> {
  type: "text" | "password" | "number" | "email";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input(props: InputProps) {
  return <input {...props} className={INPUT_STYLES + " " + props.className} />;
}
