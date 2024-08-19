import { PropsWithChildren, useRef, useState } from "react";
import { usePopper } from "react-popper";
import { Placement } from "@popperjs/core";
import { AnimatePresence, motion } from "framer-motion";
import useClickAway from "react-use/lib/useClickAway";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  placement?: Placement;
  host: any;
  stopPropagationForChild?: boolean;
  customClassName?: string;
}

export function PopoverPopper({
  children,
  setShow,
  show,
  placement,
  host,
  customClassName,
  stopPropagationForChild
}: PropsWithChildren<Props>) {
  const popoverContentRef = useRef<HTMLDivElement | null>(null);
  const [popperElement, setPopperElement] = useState<any>();
  const popper = usePopper(host, popperElement, {
    placement: placement ?? "top"
  });

  useClickAway(popoverContentRef, () => show && setShow(false));

  return (
    <div
      className="z-[1060]"
      style={popper.styles.popper}
      {...popper.attributes.popper}
      ref={setPopperElement}
      onMouseLeave={(e) => stopPropagationForChild && setShow(false)}
    >
      <AnimatePresence>
        {show && (
          <motion.div
            ref={popoverContentRef}
            className={customClassName ?? "bg-white border rounded-xl"}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
