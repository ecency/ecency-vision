import React, { HTMLProps, useContext } from "react";
import { DropdownContext } from "@ui/dropdown/dropdown-context";
import { classNameObject, useFilteredProps } from "@ui/util";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  align?: "left" | "right" | "top" | "bottom";
  size?: "small" | "medium" | "large";
}

export function DropdownMenu(props: Omit<HTMLProps<HTMLDivElement>, "size"> & Props) {
  const { show } = useContext(DropdownContext);

  const nativeProps = useFilteredProps(props, ["align"]);

  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          key="dropdown"
          initial={{
            opacity: 0,
            scale: 0.95,
            y: -8
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0
          }}
          exit={{
            opacity: 0,
            scale: 0.95,
            y: -8
          }}
          {...nativeProps}
          className={classNameObject({
            "z-[1000] ecency-dropdown-menu absolute flex flex-col items-start border border-[--border-color] rounded-xl bg-white":
              true,
            "right-0": props.align === "right",
            "top-[100%]": (props.align ?? "bottom") === "bottom",
            "bottom-[100%]": props.align === "top",
            "min-w-[200px] py-2 gap-2 pr-3": !props.size || props.size === "medium",
            "min-w-[150px] py-1 gap-1 pr-2": !props.size || props.size === "small",
            [props.className ?? ""]: !!props.className
          })}
        />
      ) : (
        <></>
      )}
    </AnimatePresence>
  );
}
