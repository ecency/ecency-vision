import React, { HTMLProps, useContext, useRef } from "react";
import { AccordionContext } from "@ui/accordion/accordion-context";
import { classNameObject } from "../../../helper/class-name-object";

export function AccordionCollapse(props: HTMLProps<HTMLDivElement> & { eventKey: string }) {
  const { show } = useContext(AccordionContext);
  const collapseRef = useRef<HTMLDivElement | null>(null);
  return (
    <div
      className={classNameObject({
        "overflow-hidden": true,
        hidden: !show[props.eventKey]
      })}
    >
      <div {...props} ref={collapseRef} />
    </div>
  );
}
