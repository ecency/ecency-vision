import React, { HTMLProps } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { useFilteredProps } from "../../../util/props-filter";

interface Props {
  defer?: boolean;
  inline?: boolean;
  grid?: boolean;
  scrollable?: boolean;
}

export function List(props: HTMLProps<HTMLDivElement> & Props) {
  const nativeProps = useFilteredProps(props, ["defer", "inline"]);

  return (
    <div
      {...nativeProps}
      className={classNameObject({
        flex: !props.grid ?? true,
        "grid sm:grid-cols-2": props.grid ?? false,
        "gap-3": props.defer ?? false,
        "flex-row flex-wrap": props.inline ?? false,
        "flex-col rounded-xl border border-[--border-color] bg-gray-100 dark:bg-gray-900":
          !props.inline,
        "overflow-hidden": !props.scrollable,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}

interface ListItemProps extends HTMLProps<HTMLDivElement> {
  small?: boolean;
  styledDefer?: boolean;
}

export function ListItem(props: ListItemProps) {
  const nativeProps = useFilteredProps(props, ["small", "styledDefer"]);

  return (
    <div
      {...nativeProps}
      className={classNameObject({
        "list-item text-sm text-gray-600 border-b border-[--border-color] last:border-b-0": true,
        "px-2 py-3": props.small ?? false,
        "px-3 py-4": !props.small,
        "rounded-xl border border-[--border-color] bg-gray-100 dark:bg-gray-900": props.styledDefer,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}
