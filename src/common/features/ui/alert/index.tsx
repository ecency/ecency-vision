import React, { HTMLProps } from "react";
import { Props } from "./types";
import { classNameObject } from "../../../helper/class-name-object";
import { ALERT_STYLES } from "@ui/alert/styles";

export function Alert(props: HTMLProps<HTMLDivElement> & Props) {
  return (
    <div
      {...props}
      className={classNameObject({
        "text-sm p-3 rounded-[1rem]": true,
        [ALERT_STYLES[props.appearance ?? "primary"]]: true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
