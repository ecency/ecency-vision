import React from "react";

interface Props {
  content: string | JSX.Element;
  children: JSX.Element;
}

// TODO: create styled tooltip
export default function ({ content, children }: Props) {
  return React.cloneElement(children, { title: content });
}
