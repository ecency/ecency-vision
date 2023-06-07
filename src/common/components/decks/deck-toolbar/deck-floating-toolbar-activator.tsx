import React from "react";
import { upArrowSvg } from "../../../img/svg";
import "./_deck-floating-toolbar-activator.scss";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  open: boolean;
  setOpen: () => void;
}

export const DeckFloatingToolbarActivator = ({ open, setOpen }: Props) => {
  return (
    <div
      className={classNameObject({
        "deck-floating-toolbar-activator btn btn-primary": true,
        open
      })}
      onTouchEnd={setOpen}
      onClick={setOpen}
    >
      {upArrowSvg}
    </div>
  );
};
