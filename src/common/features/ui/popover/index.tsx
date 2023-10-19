import React, { HTMLAttributes, ReactNode, useEffect, useState } from "react";
import { useMountedState } from "react-use";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";
import { useFilteredProps } from "../../../util/props-filter";

interface ShowProps {
  show: boolean;
  setShow: (v: boolean) => void;
  children: ReactNode;
}

interface Props {
  children: ReactNode;
  anchorParent?: boolean;
}

export function Popover(props: (ShowProps | Props) & HTMLAttributes<HTMLDivElement>) {
  const isMounted = useMountedState();

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const popper = usePopper(host, popperElement, {
    placement: "top"
  });
  const [show, setShow] = useState((props as ShowProps).show ?? false);

  const nativeProps = useFilteredProps(props, ["anchorParent", "show", "setShow"]);

  useEffect(() => {
    if ((props as Props).anchorParent && host) {
      host.parentElement.addEventListener("mouseenter", () => setShow(true));
      host.parentElement.addEventListener("mouseleave", () => setShow(false));
    }
  }, [(props as Props).anchorParent, host]);

  useEffect(() => {
    setShow((props as ShowProps).show ?? false);
  }, [(props as ShowProps).show]);

  return (
    <div {...nativeProps} ref={setHost}>
      {isMounted() && show ? (
        createPortal(
          <div
            className="z-[1060] bg-white border rounded-xl"
            style={popper.styles.popper}
            {...popper.attributes.popper}
            ref={setPopperElement}
          >
            {props.children}
          </div>,
          document.querySelector("#popper-container")!!
        )
      ) : (
        <></>
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
