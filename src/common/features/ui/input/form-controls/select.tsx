import React, { HTMLProps, ReactNode } from "react";

export interface SelectProps extends HTMLProps<HTMLSelectElement> {
  type: "select";
  children: ReactNode;
}

export function Select(props: SelectProps) {
  return <select {...props}>{props.children}</select>;
}
