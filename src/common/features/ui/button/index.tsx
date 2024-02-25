import React, { forwardRef } from "react";
import { ButtonProps } from "./props";
import { classNameObject } from "../../../helper/class-name-object";
import { BUTTON_OUTLINE_STYLES, BUTTON_SIZES, BUTTON_STYLES } from "./styles";
import { useFilteredProps } from "../../../util/props-filter";
import { Link, NavLinkProps } from "react-router-dom";

export * from "./props";

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement | NavLinkProps, ButtonProps>(
  (props, ref) => {
    const nativeProps = useFilteredProps<typeof props, Required<ButtonProps>>(props, [
      "appearance",
      "outline",
      "icon",
      "iconPlacement",
      "noPadding",
      "full"
    ]);

    const className = classNameObject({
      // Basic
      "cursor-pointer rounded-full duration-300 no-wrap": true,
      // Outline basics
      "border-[1.25px] border-solid": props.outline ?? false,
      // With icon
      "flex items-center justify-center gap-2":
        !!props.icon || ("to" in props ? !!props.to : false),
      "flex-row-reverse": props.iconPlacement === "left",

      // Styles
      [BUTTON_STYLES[props.appearance ?? "primary"]]: !props.outline ?? true,
      [BUTTON_OUTLINE_STYLES[props.appearance ?? "primary"]]: props.outline ?? false,
      [BUTTON_SIZES[props.size ?? "md"]]: true,

      // Misc
      [props.className ?? ""]: true,
      "!p-0": props.noPadding,
      "w-full": props.full ?? false
    });

    const icon = props.icon ? (
      <div
        className={classNameObject({
          "flex justify-center items-center min-w-5 min-h-5 max-w-5 max-h-5 [&>svg]:min-w-5 [&>svg]:min-h-5 [&>svg]:max-w-5 [&>svg]:max-h-5":
            true,
          [props.iconClassName ?? ""]: true
        })}
      >
        {props.icon}
      </div>
    ) : (
      <></>
    );
    const children = props.children ? <div>{props.children}</div> : <></>;

    return "href" in props ? (
      <a {...nativeProps} className={className} ref={ref as any}>
        {children}
        {icon}
      </a>
    ) : "to" in props ? (
      <Link to={(props as NavLinkProps).to} {...nativeProps} className={className} ref={ref as any}>
        {children}
        {icon}
      </Link>
    ) : (
      <button
        {...nativeProps}
        style={{
          ...props.style,
          outline: "none"
        }}
        type={props.type ?? "button"}
        className={className}
        ref={ref as any}
      >
        {children}
        {icon}
      </button>
    );
  }
);
