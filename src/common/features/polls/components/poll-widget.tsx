import React, { useEffect, useMemo, useState } from "react";
import { PollSnapshot } from "./polls-creation";
import { _t } from "../../../i18n";
import { Button } from "@ui/button";
import { Entry } from "../../../store/entries/types";
import { useGetPollDetailsQuery, useSignPollVoteByKey } from "../api";
import { PollOption } from "./poll-option";
import { PollOptionWithResults } from "./poll-option-with-results";
import { PollVotesListDialog } from "./poll-votes-list-dialog";
import { UilClock, UilPanelAdd } from "@iconscout/react-unicons";
import { useMappedStore } from "../../../store/use-mapped-store";
import { format, isBefore } from "date-fns";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";

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
  const [showEndDate, setShowEndDate] = useLocalStorage(PREFIX + "_plls_set", false);

  const endTimeFullDate = useMemo(() => format(poll.endTime, "dd.MM.yyyy HH:mm"), [poll.endTime]);
  const isFinished = useMemo(() => isBefore(poll.endTime, new Date()), [poll.endTime]);
  const showViewVotes = useMemo(
    () => poll.hide_votes && !resultsMode,
    [poll.hide_votes, resultsMode]
  );
  const showChangeVote = useMemo(
    () => poll.voteChange && resultsMode && pollDetails.data?.status === "Active",
    [resultsMode, poll.voteChange, pollDetails.data?.status]
  );
  const showVote = useMemo(
    () => pollDetails.data?.status === "Active" && !resultsMode,
    [pollDetails.data?.status, resultsMode]
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
    setResultsMode(isVotedAlready || isFinished);
  }, [isVotedAlready, isFinished]);

  useEffect(() => {
    setIsVotedAlready(!!activeUserVote);
  }, [activeUserVote]);

  return (
    <div className="grid grid-cols-4">
      <div className="col-span-4 sm:col-span-3 flex flex-col gap-4 border border-[--border-color] rounded-3xl p-4 dark:border-gray-900">
        {isReadOnly && (
          <div className="text-xs uppercase tracking-wide font-semibold opacity-50">
            {_t("polls.preview-mode")}
          </div>
        )}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="font-semibold text-lg">{poll.title}</div>
          <div className="text-sm flex items-center gap-3 text-gray-600 py-1 min-h-[3rem] dark:text-gray-400 whitespace-nowrap">
            {showEndDate &&
              (isFinished ? (
                _t("polls.finished")
              ) : (
                <div className="flex flex-col">
                  <span>{_t("polls.end-time")}</span>
                  <span className="text-blue-dark-sky font-semibold">{endTimeFullDate}</span>
                </div>
              ))}
            <Button
              noPadding={true}
              icon={<UilClock />}
              onClick={() => setShowEndDate(!showEndDate)}
              appearance="gray-link"
            />
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
        {showVote && (
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
        {showChangeVote && (
          <Button appearance="link" size="sm" onClick={() => setResultsMode(false)}>
            {_t("polls.back-to-vote")}
          </Button>
        )}
        {showViewVotes && (
          <Button appearance="link" size="sm" onClick={() => setResultsMode(true)}>
            {_t("polls.view-votes")}
          </Button>
        )}
        {resultsMode && <PollVotesListDialog entry={entry} />}
      </div>
    </div>
  );
}
