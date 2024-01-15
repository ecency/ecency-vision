import React, { HTMLProps, useContext } from "react";
import { DropdownContext } from "./dropdown-context";
import { classNameObject } from "@/features/ui/util";
import { chevronUpSvg } from "@ui/svg";
import { useFilteredProps } from "@/utils/props-filter";

interface Props {
  withChevron?: boolean;
}

export function DropdownToggle(props: HTMLProps<HTMLDivElement> & Props) {
  const { setShow, show } = useContext(DropdownContext);

  const nativeProps = useFilteredProps(props, ["withChevron"]);

  return (
    <div
      {...nativeProps}
      className={classNameObject({
        "cursor-pointer": true,
        "flex items-center": !!props.withChevron,
        [props.className ?? ""]: !!props.className
      })}
      onClick={(e) => {
        setShow(!show);
        props.onClick?.(e);
      }}
    >
      {props.children}
      {props.withChevron && (
        <i className={classNameObject({ "inline-flex origin-center": true, "rotate-180": !show })}>
          {chevronUpSvg}
        </i>
      )}
    </div>
  );
}
