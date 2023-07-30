import React, { HTMLAttributes, ReactNode, useState } from "react";
import { useMountedState } from "react-use";
import { usePopper } from "react-popper";
import { createPortal } from "react-dom";

export function Popover(props: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  const isMounted = useMountedState();

  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const popper = usePopper(host, popperElement);

  return (
    <div {...props} ref={setHost}>
      {isMounted() ? (
        createPortal(
          <div
            className="z-[300] bg-white border rounded-xl"
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
