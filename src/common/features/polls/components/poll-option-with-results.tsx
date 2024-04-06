import { classNameObject } from "../../../helper/class-name-object";
import React, { useMemo } from "react";
import { PollCheck } from "./poll-option";
import { useGetPollDetailsQuery } from "../api";
import { Entry } from "../../../store/entries/types";
import { _t } from "../../../i18n";

export interface Props {
  activeChoice?: string;
  choice: string;
  entry?: Entry;
}

export function PollOptionWithResults({ choice, activeChoice, entry }: Props) {
  const pollDetails = useGetPollDetailsQuery(entry);

  const votesCount = useMemo(
    () =>
      pollDetails.data?.poll_choices.find((pc) => pc.choice_text === choice)?.votes?.total_votes ??
      0,
    [choice, pollDetails.data?.poll_choices]
  );
  const totalVotes = useMemo(
    () => Math.max(pollDetails.data?.poll_stats.total_voting_accounts_num ?? 0, 1),
    [pollDetails.data?.poll_stats.total_voting_accounts_num]
  );

  return (
    <div
      className={classNameObject({
        "min-h-[52px] relative overflow-hidden flex items-center gap-4 duration-300 cursor-pointer text-sm px-4 py-3 rounded-2xl":
          true,
        "bg-gray-200 dark:bg-dark-200": true
      })}
    >
      <div
        className={classNameObject({
          "bg-blue-dark-sky bg-opacity-50 min-h-[52px] absolute top-0 left-0 bottom-0": true
        })}
        style={{
          width: `${(votesCount * 100) / totalVotes}%`
        }}
      />
      {activeChoice === choice && <PollCheck checked={activeChoice === choice} />}
      <div className="flex w-full gap-2 justify-between">
        <span>{choice}</span>
        <span className="text-xs whitespace-nowrap">
          {(votesCount * 100) / totalVotes}% ({votesCount} {_t("polls.votes")})
        </span>
      </div>
    </div>
  );
}
