import React, { HTMLProps } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { BADGE_STYLES, BadgeAppearance } from "@ui/badge/badge-styles";
import { useFilteredProps } from "../../../util/props-filter";

interface Props {
  appearance?: BadgeAppearance;
}

export function Badge(props: HTMLProps<HTMLDivElement> & Props) {
  const nativeProps = useFilteredProps(props, ["appearance"]);

  return (
    <div
      {...nativeProps}
      className={classNameObject({
        "flex items-center rounded-full px-2 py-0.5 text-sm": true,
        [BADGE_STYLES[props.appearance ?? "primary"]]: true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
