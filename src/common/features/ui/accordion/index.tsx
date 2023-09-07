import React from "react";
import { PropsWithChildren } from "react";

export function Accordion(props: PropsWithChildren<{}>) {
  return <div>{props.children}</div>;
}
