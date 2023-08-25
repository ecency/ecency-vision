import React, { HTMLProps } from "react";

export interface TextareaProps extends HTMLProps<HTMLTextAreaElement> {
  type: "textarea";
}

export function Textarea(props: TextareaProps) {
  return <textarea {...props} />;
}
