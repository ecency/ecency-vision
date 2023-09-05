import React, { forwardRef } from "react";
import { ButtonProps } from "./props";
import { classNameObject } from "../../../helper/class-name-object";
import { BUTTON_OUTLINE_STYLES, BUTTON_SIZES, BUTTON_STYLES } from "./styles";

export * from "./props";

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const className = classNameObject({
      "cursor-pointer rounded-full duration-300 no-wrap": true,
      "border-[1.5px] border-solid": props.outline ?? false,
      [BUTTON_STYLES[props.appearance ?? "primary"]]: !props.outline ?? true,
      [BUTTON_OUTLINE_STYLES[props.appearance ?? "primary"]]: props.outline ?? false,
      [BUTTON_SIZES[props.size ?? "md"]]: true,
      [props.className ?? ""]: true,
      "w-full": props.full ?? false
    });

    return props.href ? (
      <a {...props} className={className} ref={ref as any} />
    ) : (
      <button {...props} className={className} ref={ref as any} />
    );
  }
);
