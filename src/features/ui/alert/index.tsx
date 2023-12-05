import React, { HTMLProps } from "react";
import { Props } from "./types";
import { classNameObject, useFilteredProps } from "@/features/ui/util";
import { ALERT_STYLES } from "@/features/ui/alert/styles";

export function Alert(props: HTMLProps<HTMLDivElement> & Props) {
  const nativeProps = useFilteredProps(props, ["appearance"]);

  return (
    <div
      {...nativeProps}
      className={classNameObject({
        "text-sm p-3 rounded-[1rem]": true,
        [ALERT_STYLES[props.appearance ?? "primary"]]: true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
