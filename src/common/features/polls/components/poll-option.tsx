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
  activeChoices: Set<string>;
  choice: string;
  addActiveChoice: (choice: string) => void;
  removeActiveChoice: (choice: string) => void;
}

export function PollOption({ activeChoices, choice, addActiveChoice, removeActiveChoice }: Props) {
  return (
    <div
      className={classNameObject({
        "flex items-center gap-4 duration-300 cursor-pointer text-sm px-4 py-3 rounded-2xl": true,
        "bg-gray-200 hover:bg-gray-300 dark:bg-dark-200 dark:hover:bg-gray-900":
          !activeChoices.has(choice),
        "bg-blue-dark-sky hover:bg-blue-dark-sky-hover bg-opacity-50 hover:bg-opacity-50 text-blue-dark-sky-active dark:text-blue-dark-sky-010":
          activeChoices.has(choice)
      })}
      onClick={() =>
        activeChoices.has(choice) ? removeActiveChoice(choice) : addActiveChoice(choice)
      }
    >
      <PollCheck checked={activeChoices.has(choice)} />
      {choice}
    </div>
  );
}
