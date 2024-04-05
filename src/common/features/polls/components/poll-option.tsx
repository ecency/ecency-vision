import { classNameObject } from "../../../helper/class-name-object";
import React from "react";
import { UilCheck } from "@iconscout/react-unicons";

export function PollCheck({ checked }: { checked: boolean }) {
  return (
    <div className="rounded-full min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      {checked && <UilCheck size={16} className="text-blue-dark-sky" />}
    </div>
  );
}

export interface Props {
  activeChoice?: string;
  choice: string;
  setActiveChoice: (choice?: string) => void;
}

export function PollOption({ activeChoice, choice, setActiveChoice }: Props) {
  return (
    <div
      className={classNameObject({
        "hover:bg-gray-300 flex items-center gap-4 dark:hover:bg-gray-900 duration-300 cursor-pointer text-sm px-4 py-3 rounded-2xl":
          true,
        "bg-gray-200 dark:bg-dark-200": activeChoice !== choice,
        "bg-blue-dark-sky bg-opacity-50": activeChoice === choice
      })}
      onClick={() =>
        activeChoice === choice ? setActiveChoice(undefined) : setActiveChoice(choice)
      }
    >
      <PollCheck checked={activeChoice === choice} />
      {choice}
    </div>
  );
}
