import React from "react";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  expanded: boolean;
  onToggle: () => void;
}

export function NavbarToggle({ expanded, onToggle }: Props) {
  return (
    <div
      className={classNameObject({
        "navbar-toggle flex w-[1.5rem] h-[1.5rem] justify-center flex-col gap-1": true,
        expanded
      })}
      onClick={() => {
        onToggle();

        if (expanded) {
          document.body.classList.remove("overflow-hidden");
        } else {
          document.body.classList.add("overflow-hidden");
        }
      }}
    >
      <span className="bg-gray-500" />
      <span className="bg-gray-500" />
      <span className="bg-gray-500" />
    </div>
  );
}
