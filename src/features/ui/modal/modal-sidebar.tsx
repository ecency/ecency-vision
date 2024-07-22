import { classNameObject } from "@ui/util";
import { PropsWithChildren, useEffect, useState } from "react";
import { Modal } from "@/features/ui";
import { useTimeoutFn } from "react-use";

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
      <div
        className={classNameObject({
          "h-full-dynamic overflow-y-auto no-scrollbar bg-white dark:bg-dark-700 absolute w-[20rem] top-0 bottom-0 duration-300":
            true,
          "right-0 rounded-l-2xl": placement === "right",
          "left-0 rounded-r-2xl": placement === "left",
          [className ?? ""]: !!className
        })}
        style={{
          transform: `translateX(${showAnimated ? 0 : 100 * (placement === "right" ? 1 : -1)}%)`
        }}
      >
        {children}
      </div>
    </Modal>
  );
}
