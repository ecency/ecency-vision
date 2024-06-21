import React, { useState } from "react";
import "./_deck-floating-toolbar-activator.scss";
import { Button } from "@ui/button";
import { classNameObject } from "@ui/util";
import { upArrowSvg } from "@ui/svg";

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
