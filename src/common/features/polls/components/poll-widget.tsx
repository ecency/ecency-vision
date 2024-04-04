import React, { useMemo, useState } from "react";
import { PollSnapshot } from "./polls-creation";
import { dateToFullRelative } from "../../../helper/parse-date";
import { _t } from "../../../i18n";
import { UilCheck, UilPanelAdd } from "@iconscout/react-unicons";
import { Button } from "@ui/button";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  poll: PollSnapshot;
  isReadOnly: boolean;
}

function PollCheck({ checked }: { checked: boolean }) {
  return (
    <div className="rounded-full w-[28px] h-[28px] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      {checked && <UilCheck size={16} className="text-blue-dark-sky" />}
    </div>
  );
}

export function PollWidget({ poll, isReadOnly }: Props) {
  const [activeChoice, setActiveChoice] = useState<string>();

  const endTimeFormat = useMemo(
    () => dateToFullRelative(poll.endTime.toISOString()),
    [poll.endTime]
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2">
      <div className="col-span-1 flex flex-col gap-4 border border-[--border-color] rounded-3xl p-4 dark:border-gray-900">
        <div className="text-xs uppercase tracking-wide font-semibold opacity-50">
          {_t("polls.post-poll")}
          {isReadOnly && <span>({_t("polls.preview-mode")})</span>}
        </div>
        <div className="mb-4">
          <div>{poll.title}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {_t("polls.end-time")}:
            <span className="text-blue-dark-sky pl-1 font-semibold">{endTimeFormat}</span>
          </div>
        </div>
        {poll.filters.accountAge > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {_t("polls.account-age-hint", { n: poll.filters.accountAge })}
          </div>
        )}
        <div className="flex flex-col gap-3">
          {poll.choices.map((choice, key) => (
            <div
              className={classNameObject({
                "hover:bg-gray-300 flex items-center gap-4 dark:hover:bg-gray-900 duration-300 cursor-pointer text-sm px-4 py-3 rounded-2xl":
                  true,
                "bg-gray-200 dark:bg-dark-200": activeChoice !== choice,
                "bg-blue-dark-sky bg-opacity-50": activeChoice === choice
              })}
              key={choice}
              onClick={() =>
                activeChoice === choice ? setActiveChoice(undefined) : setActiveChoice(choice)
              }
            >
              <PollCheck checked={activeChoice === choice} />
              {choice}
            </div>
          ))}
        </div>
        <Button
          disabled={isReadOnly || !activeChoice}
          icon={<UilPanelAdd />}
          size="lg"
          className="font-semibold text-sm px-4 mt-4"
        >
          {_t("polls.vote")}
        </Button>
      </div>
    </div>
  );
}
