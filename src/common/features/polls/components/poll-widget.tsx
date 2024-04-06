import React, { useEffect, useMemo, useState } from "react";
import { PollSnapshot } from "./polls-creation";
import { dateToFullRelative } from "../../../helper/parse-date";
import { _t } from "../../../i18n";
import { Button } from "@ui/button";
import { Entry } from "../../../store/entries/types";
import { useGetPollDetailsQuery, useSignPollVoteByKey } from "../api";
import { PollOption } from "./poll-option";
import { PollOptionWithResults } from "./poll-option-with-results";
import { PollVotesListDialog } from "./poll-votes-list-dialog";
import { UilPanelAdd } from "@iconscout/react-unicons";
import { useMappedStore } from "../../../store/use-mapped-store";

interface Props {
  poll: PollSnapshot;
  isReadOnly: boolean;
  entry?: Entry;
}

export function PollWidget({ poll, isReadOnly, entry }: Props) {
  const { activeUser } = useMappedStore();

  const pollDetails = useGetPollDetailsQuery(entry);
  const activeUserVote = useMemo(
    () => (pollDetails.data?.poll_voters ?? []).find((pv) => pv.name === activeUser?.username),
    [pollDetails.data?.poll_voters, activeUser?.username]
  );

  const { mutateAsync: vote, isLoading: isVoting } = useSignPollVoteByKey(pollDetails.data);

  const [activeChoice, setActiveChoice] = useState<string>();
  const [resultsMode, setResultsMode] = useState(false);
  const [isVotedAlready, setIsVotedAlready] = useState(false);

  const endTimeFormat = useMemo(
    () => dateToFullRelative(poll.endTime.toISOString()),
    [poll.endTime]
  );

  useEffect(() => {
    if (activeUserVote) {
      const choice = pollDetails.data?.poll_choices.find(
        (pc) => pc.choice_num === activeUserVote.choice_num
      );
      setActiveChoice(choice?.choice_text);
    }
  }, [activeUserVote, pollDetails.data]);

  useEffect(() => {
    setResultsMode(isVotedAlready);
  }, [isVotedAlready]);

  useEffect(() => {
    setIsVotedAlready(!!activeUserVote);
  }, [activeUserVote]);

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-4 sm:col-span-3 xl:col-span-2 flex flex-col gap-4 border border-[--border-color] rounded-3xl p-4 dark:border-gray-900">
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
          {poll.choices.map((choice) =>
            resultsMode ? (
              <PollOptionWithResults
                key={choice}
                entry={entry}
                choice={choice}
                activeChoice={activeChoice}
              />
            ) : (
              <PollOption
                choice={choice}
                key={choice}
                setActiveChoice={setActiveChoice}
                activeChoice={activeChoice}
              />
            )
          )}
        </div>
        {pollDetails.data?.status === "Active" && (
          <>
            {!resultsMode && (
              <Button
                disabled={isReadOnly || !activeChoice || isVoting}
                icon={<UilPanelAdd />}
                iconPlacement="left"
                size="lg"
                className="font-semibold text-sm px-4 mt-4"
                onClick={() => {
                  setIsVotedAlready(false);
                  vote({ choice: activeChoice!! });
                }}
              >
                {_t(isVoting ? "polls.voting" : "polls.vote")}
              </Button>
            )}
            <Button appearance="link" size="sm" onClick={() => setResultsMode(!resultsMode)}>
              {_t(resultsMode ? "polls.back-to-vote" : "polls.view-votes")}
            </Button>
            {resultsMode && <PollVotesListDialog entry={entry} />}
          </>
        )}
      </div>
    </div>
  );
}
