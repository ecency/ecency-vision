import { classNameObject } from "@ui/util";
import { PropsWithChildren, useEffect, useState } from "react";
import { Modal } from "@/features/ui";
import { useTimeoutFn } from "react-use";
import { motion } from "framer-motion";

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  placement: "right" | "left";
  className?: string;
}

export function ModalSidebar({
  children,
  show,
  setShow,
  placement,
  className
}: PropsWithChildren<Props>) {
  const [showAnimated, setShowAnimated] = useState(false);

  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [reset, show]);

  return (
    <Modal animation={false} show={show} onHide={() => setShow(false)} className={className}>
      <motion.div
        initial={{
          x: (placement === "right" ? 1 : -1) * 320
        }}
        animate={{
          x: 0
        }}
        transition={{
          duration: 0.3,
          stiffness: 0
        }}
        exit={{
          x: (placement === "right" ? 1 : -1) * 320
        }}
        className={classNameObject({
          "h-full-dynamic overflow-y-auto no-scrollbar bg-white dark:bg-dark-700 absolute w-[20rem] top-0 bottom-0":
            true,
          "right-0 rounded-l-2xl": placement === "right",
          "left-0 rounded-r-2xl": placement === "left",
          [className ?? ""]: !!className
        })}
      >
        {children}
      </motion.div>
    </Modal>
  );
}
