import { classNameObject } from "../../../helper/class-name-object";
import React from "react";
import { UilCheck } from "@iconscout/react-unicons";

export function PollCheck({ checked }: { checked: boolean }) {
  return (
    <div className="rounded-full relative min-w-[28px] min-h-[28px] max-w-[28px] max-h-[28px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
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
        "flex items-center gap-4 duration-300 cursor-pointer text-sm px-4 py-3 rounded-2xl": true,
        "bg-gray-200 hover:bg-gray-300 dark:bg-dark-200 dark:hover:bg-gray-900":
          activeChoice !== choice,
        "bg-blue-dark-sky hover:bg-blue-dark-sky-hover bg-opacity-50 hover:bg-opacity-50 text-blue-dark-sky-active dark:text-blue-dark-sky-010":
          activeChoice === choice
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
