import React, { DetailedHTMLProps, TableHTMLAttributes } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { useFilteredProps } from "../../../util/props-filter";

export function Tr(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLTableRowElement> &
    React.HTMLAttributes<HTMLTableRowElement>
) {
  return (
    <tr
      {...props}
      className={classNameObject({
        "[&:last-child>td]:border-b-0 [&:nth-child(even)]:bg-light-200 dark:[&:nth-child(even)]:bg-dark-300":
          true,
        [props.className ?? ""]: !!props.className
      })}
    />
  );
}

export function Td(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLTableDataCellElement> &
    React.TdHTMLAttributes<HTMLTableDataCellElement>
) {
  return (
    <td
      {...props}
      className={classNameObject({
        "border-b border-r dark:border-gray-700 last:border-r-0 p-1 sm:p-2": true,
        [props.className ?? ""]: true
      })}
    />
  );
}

export function Th(
  props: JSX.IntrinsicAttributes &
    React.ClassAttributes<HTMLTableHeaderCellElement> &
    React.ThHTMLAttributes<HTMLTableHeaderCellElement>
) {
  return (
    <th
      {...props}
      className={classNameObject({
        //Basic
        "border-b dark:border-gray-700 text-left font-[500] bg-gray-100 dark:bg-dark-200 text-sm text-gray-700 dark:text-white border-r last:border-r-0 p-2":
          true,

        // Responsive
        "text-xs sm:text-sm md:text-md p-1 sm:p-2": true,

        // Misc
        [props.className ?? ""]: true
      })}
    />
  );
}

export function Table(
  props: DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement> & {
    full?: boolean;
    rounded?: boolean;
  }
) {
  const nativeProps = useFilteredProps(props, ["full", "rounded"]);

  return (
    <div
      className={classNameObject({
        "border dark:border-gray-700 overflow-hidden": true,
        "rounded-xl": props.rounded ?? true,
        "w-full": props.full
      })}
    >
      <table
        {...nativeProps}
        className={classNameObject({
          // Basic
          "table-auto border-collapse": true,

          // Responsive
          "text-xs sm:text-sm md:text-md": true,

          // Misc
          "w-full": props.full,
          [props.className ?? ""]: !!props.className
        })}
      />
    </div>
  );
}
