import React, { forwardRef, HTMLProps } from "react";
import { classNameObject } from "@/features/ui/util";

const ForwardedForm = forwardRef<HTMLFormElement, HTMLProps<HTMLFormElement>>((props, ref) => {
  return (
    <form
      {...props}
      ref={ref}
      className={classNameObject({
        block: true,
        [props.className ?? ""]: true
      })}
    />
  );
});

ForwardedForm.displayName = "Form";

export const Form = ForwardedForm;
