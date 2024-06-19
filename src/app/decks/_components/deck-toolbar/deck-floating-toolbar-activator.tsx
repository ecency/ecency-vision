import React, { useState } from "react";
import { upArrowSvg } from "../../../img/svg";
import "./_deck-floating-toolbar-activator.scss";
import { classNameObject } from "../../../helper/class-name-object";
import { Button } from "@ui/button";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
}

export const DeckFloatingToolbarActivator = ({ open, setOpen }: Props) => {
  const [touched, setTouched] = useState(false);

  return (
    <Button
      className={classNameObject({
        "deck-floating-toolbar-activator": true,
        open
      })}
      onTouchStart={() => setTouched(true)}
      onTouchEnd={() => {
        setOpen(!open);
        setTimeout(() => setTouched(false), 1);
      }}
      onClick={() => {
        if (!touched) {
          setOpen(!open);
        }
      }}
    >
      {upArrowSvg}
    </Button>
  );
};
