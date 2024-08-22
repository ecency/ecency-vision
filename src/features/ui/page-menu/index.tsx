import { HTMLProps, PropsWithChildren } from "react";
import { classNameObject } from "@ui/util";

export function PageMenu(props: HTMLProps<PropsWithChildren>) {
  return (
    <div
      className={classNameObject({
        "flex items-center justify-between w-full": true,
        [props.className ?? ""]: !!props.className
      })}
    >
      {props.children}
    </div>
  );
}

export * from "./page-menu-link";
export * from "./page-menu-items";
export * from "./page-menu-mobile-dropdown";
