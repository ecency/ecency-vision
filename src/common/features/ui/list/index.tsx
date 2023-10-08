import React, { HTMLProps } from "react";
import { classNameObject } from "../../../helper/class-name-object";

export function List(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNameObject({
        "flex flex-col rounded-xl": true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}

export function ListItem(props: HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={classNameObject({
        "text-sm bg-gray-100 text-gray-600 border px-3 py-4": true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
