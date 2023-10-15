import React, { HTMLProps, useContext, useRef } from "react";
import { AccordionContext } from "@ui/accordion/accordion-context";
import { classNameObject } from "../../../helper/class-name-object";
import { useFilteredProps } from "../../../util/props-filter";

export function AccordionCollapse(props: HTMLProps<HTMLDivElement> & { eventKey: string }) {
  const { show } = useContext(AccordionContext);
  const collapseRef = useRef<HTMLDivElement | null>(null);
  const nativeProps = useFilteredProps(props, ["eventKey"]);

  return (
    <div
      className={classNameObject({
        "overflow-hidden": true,
        hidden: !show[props.eventKey]
      })}
    >
      <div {...nativeProps} ref={collapseRef} />
    </div>
  );
}
