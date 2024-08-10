"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import "./_index.scss";
import * as ss from "@/utils/session-storage";
import { LoginRequired } from "@/features/shared";
import useClickAway from "react-use/lib/useClickAway";
import { useGlobalStore } from "@/core/global-store";
import { chevronUpSvgForVote } from "@ui/svg";
import { EntryVoteDialog } from "@/features/shared/entry-vote-btn/entry-vote-dialog";
import { useEntryVote } from "@/api/mutations";
import { Account, Entry, EntryVote } from "@/entities";
import { getActiveVotes } from "@/api/hive";
import { prepareVotes } from "@/features/shared/entry-vote-btn/utils";
import { classNameObject } from "@ui/util";
import { EcencyEntriesCacheManagement } from "@/core/caches";

interface Props {
  entry: Entry;
  account?: Account;
  isPostSlider: boolean;
}

export function EntryVoteBtn({ entry: originalEntry, isPostSlider, account }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: entry } =
    EcencyEntriesCacheManagement.getEntryQuery(originalEntry).useClientQuery();

  const [dialog, setDialog] = useState(false);
  const [tipDialog, setTipDialog] = useState(false);
  const [previousVotedValue, setPreviousVotedValue] = useState<number>();

  const { mutateAsync: voteInAPI, isPending: isVotingLoading } = useEntryVote(entry);

  const isVoted = useMemo(() => {
    if (!activeUser) {
      return { upVoted: false, downVoted: false };
    }
    const upVoted =
      entry?.active_votes?.some(
        (v: EntryVote) => v.voter === activeUser.username && v.rshares >= 0
      ) ?? false;
    const downVoted =
      entry?.active_votes?.some(
        (v: EntryVote) => v.voter === activeUser.username && v.rshares < 0
      ) ?? false;

    return { upVoted, downVoted };
  }, [activeUser, entry?.active_votes]);
  const tooltipClass = useMemo(() => {
    if (dialog) {
      return "tooltip-vote";
    }

    return "";
  }, [dialog]);

  useClickAway(rootRef, () => {
    !tipDialog && dialog && setDialog(false);
  });

  const vote = useCallback(
    async (percent: number, estimated: number) => {
      const weight = Math.ceil(percent * 100);

      await voteInAPI({ weight, estimated });

      setDialog(false);
    },
    [voteInAPI]
  );
  const getPreviousVote = useCallback(async () => {
    const { upVoted, downVoted } = isVoted;
    let previousVote;
    if (!activeUser || !entry) {
      return null;
    }

    if (upVoted || downVoted) {
      let username = activeUser?.username! + "-" + entry.post_id;
      let type = upVoted ? "up" : "down";
      let sessValue = ss.get(`vote-value-${type}-${username}`, null);

      if (sessValue !== null) {
        return sessValue;
      }

      const retData = await getActiveVotes(entry?.author, entry?.permlink);
      let votes = prepareVotes(entry, retData);
      previousVote = votes.find((x) => x.voter === activeUser.username);
      return previousVote === undefined ? null : previousVote.percent;
    } else {
      return null;
    }
  }, [activeUser, entry, isVoted]);
  const toggleDialog = useCallback(async () => {
    //if dialog is closing do nothing and close
    if (!dialog) {
      const preVote = await getPreviousVote();
      setPreviousVotedValue(preVote);
    }

    setDialog(!dialog);
  }, [dialog, getPreviousVote]);

  return (
    <LoginRequired>
      <div ref={rootRef}>
        <div className="entry-vote-btn" onClick={toggleDialog}>
          <div
            className={classNameObject({
              "btn-vote btn-up-vote": true,
              "in-progress": isVotingLoading,
              "btn-vote voted": isVoted.downVoted || isVoted.upVoted,
              "btn-up-vote primary-btn-done": isVoted.upVoted,
              "btn-down-vote secondary-btn-done": isVoted.downVoted,
              "primary-btn secondary-btn": !isVoted.upVoted || !isVoted.downVoted
            })}
          >
            <div className={tooltipClass}>
              <span
                className={`btn-inner ${
                  tooltipClass.length > 0
                    ? isVoted.upVoted
                      ? "primary-btn-done"
                      : isVoted.downVoted
                        ? "secondary-btn-done"
                        : "primary-btn"
                    : ""
                }`}
              >
                {chevronUpSvgForVote}
              </span>
              {entry && activeUser && tooltipClass.length > 0 && (
                <div>
                  <div className="tooltiptext" onClick={(e) => e.stopPropagation()}>
                    <EntryVoteDialog
                      account={account}
                      isPostSlider={isPostSlider}
                      upVoted={isVoted.upVoted}
                      downVoted={isVoted.downVoted}
                      previousVotedValue={previousVotedValue}
                      entry={entry}
                      setTipDialogMounted={(d) => setTipDialog(d)}
                      onClick={vote}
                      handleClickAway={() => setDialog(false)}
                      isVoted={isVoted}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </LoginRequired>
  );
}
