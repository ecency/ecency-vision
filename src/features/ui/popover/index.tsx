"use client";

import { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useFilteredProps } from "../util";
import { AnimatePresence, motion } from "framer-motion";
import useMountedState from "react-use/lib/useMountedState";
import { Placement } from "@popperjs/core";

interface ShowProps {
  show: boolean;
  setShow: (v: boolean) => void;
  children: ReactNode;
  stopPropagationForChild?: boolean;
  placement?: Placement;
}

interface Props {
  children: ReactNode;
  anchorParent?: boolean;
  stopPropagationForChild?: boolean;
  customClassName?: string;
}

export function Popover(props: (ShowProps | Props) & HTMLAttributes<HTMLDivElement>) {
  const isMounted = useMountedState();

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const popper = usePopper(host, popperElement, {
    placement: "placement" in props ? props.placement : "top"
  });
  const [show, setShow] = useState((props as ShowProps).show ?? false);

  const nativeProps = useFilteredProps(props, ["anchorParent", "show", "setShow"]);

  useEffect(() => {
    if ((props as Props).anchorParent && host) {
      host.parentElement.addEventListener("mouseenter", () => setShow(true));
      host.parentElement.addEventListener(
        "mouseleave",
        () => !props.stopPropagationForChild && setShow(false)
      );
    }
  }, [host, props]);

  useEffect(() => {
    setShow((props as ShowProps).show ?? false);
  }, [props]);

  return (
    <div {...nativeProps} ref={setHost}>
      {isMounted() &&
        createPortal(
          <div
            className="z-[1060]"
            style={popper.styles.popper}
            {...popper.attributes.popper}
            ref={setPopperElement}
            onMouseLeave={(e) => props.stopPropagationForChild && setShow(false)}
          >
            <AnimatePresence>
              {show && (
                <motion.div
                  className={
                    "customClassName" in props
                      ? props.customClassName
                      : "bg-white border rounded-xl"
                  }
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  {props.children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.querySelector("#popper-container")!!
        )}
    </div>
  );
}

export function PopoverTitle({ children }: { children: ReactNode }) {
  return <div className="p-2 border-b">{children}</div>;
}

export function PopoverContent({ children }: { children: ReactNode }) {
  return <div className="p-2">{children}</div>;
}
