import React, { useCallback, useMemo, useState } from "react";
import * as ls from "@/utils/local-storage";
import moment from "moment/moment";
import { Button } from "@ui/button";
import i18next from "i18next";
import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "@ui/svg";
import { EntryTipBtn, FormattedCurrency } from "@/features/shared";
import { getVoteValue, setVoteValue } from "@/features/shared/entry-vote-btn/utils";
import { useGlobalStore } from "@/core/global-store";
import { InputVote } from "@ui/input";
import { parseAsset } from "@/utils";
import { votingPower } from "@/api/hive";
import { useDynamicPropsQuery } from "@/api/queries";
import { Account, Entry } from "@/entities";

type Mode = "up" | "down";

interface VoteDialogProps {
  account?: Account;
  entry: Entry;
  downVoted: boolean;
  upVoted: boolean;
  isPostSlider?: boolean;
  previousVotedValue: number | undefined;
  setTipDialogMounted: (d: boolean) => void;
  onClick: (percent: number, estimated: number) => void;
  handleClickAway: () => void;
  isVoted: { upVoted: boolean; downVoted: boolean };
}

export function EntryVoteDialog({
  entry,
  previousVotedValue,
  upVoted,
  isPostSlider,
  downVoted,
  onClick,
  isVoted,
  setTipDialogMounted,
  handleClickAway,
  account
}: VoteDialogProps) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { data: dynamicProps } = useDynamicPropsQuery();

  const getUpVotedValue = useCallback(
    () =>
      getVoteValue(
        "up",
        activeUser?.username! + "-" + entry.post_id,
        getVoteValue("upPrevious", activeUser?.username!, 100, isPostSlider),
        isPostSlider
      ),
    [activeUser?.username, entry.post_id, isPostSlider]
  );
  const getDownVotedValue = useCallback(
    () =>
      getVoteValue(
        "down",
        activeUser?.username! + "-" + entry.post_id,
        getVoteValue("downPrevious", activeUser?.username!, -1, isPostSlider),
        isPostSlider
      ),
    [activeUser?.username, entry.post_id, isPostSlider]
  );

  const [mode, setMode] = useState<Mode>(downVoted ? "down" : "up");
  const [upSliderVal, setUpSliderVal] = useState(
    upVoted && previousVotedValue ? previousVotedValue : getUpVotedValue()
  );
  const [downSliderVal, setDownSliderVal] = useState(
    downVoted && previousVotedValue ? previousVotedValue : getDownVotedValue()
  );
  const [initialVoteValues, setInitialVoteValues] = useState({
    up: upVoted && previousVotedValue ? previousVotedValue : getUpVotedValue(),
    down: downVoted && previousVotedValue ? previousVotedValue : getDownVotedValue()
  });
  const [wrongValueUp, setWrongValueUp] = useState(false);
  const [wrongValueDown, setWrongValueDown] = useState(false);
  const [showRemove, setShowRemove] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const days = useMemo(() => {
    const createdDate = entry.created;
    const past = moment(createdDate);
    const now = moment(new Date());
    const duration = moment.duration(now.diff(past));
    return duration.asDays();
  }, [entry]);

  const upSliderChanged = useCallback(
    (value: number) => {
      const upSliderVal = Number(value.toFixed(1));
      setUpSliderVal(upSliderVal);
      setWrongValueUp(upSliderVal === initialVoteValues.up && upVoted);
      setShowRemove(upSliderVal === 0 && upVoted);
      setShowWarning(
        (upSliderVal < initialVoteValues.up || upSliderVal > initialVoteValues.up) &&
          upSliderVal > 0 &&
          upVoted
      );
    },
    [initialVoteValues.up, upVoted]
  );

  const downSliderChanged = useCallback(
    (value: number) => {
      const downSliderVal = Number(value.toFixed(1));
      setDownSliderVal(downSliderVal);
      setWrongValueDown(downSliderVal === initialVoteValues.down && downVoted);
      setShowRemove(downSliderVal === 0 && downVoted);
      setShowWarning(
        (downSliderVal > initialVoteValues.down || downSliderVal < initialVoteValues.down) &&
          downSliderVal < 0 &&
          downVoted
      );
    },
    [downVoted, initialVoteValues.down]
  );

  const estimate = useCallback(
    (percent: number): number => {
      if (!activeUser) {
        return 0;
      }

      const { fundRecentClaims, fundRewardBalance, base, quote } = dynamicProps;
      const { data: account } = activeUser;

      if (!account.__loaded) {
        return 0;
      }

      const sign = percent < 0 ? -1 : 1;
      const postRshares = entry.net_rshares;

      const totalVests =
        parseAsset(account.vesting_shares).amount +
        parseAsset(account.received_vesting_shares).amount -
        parseAsset(account.delegated_vesting_shares).amount;

      const userVestingShares = totalVests * 1e6;

      const userVotingPower = votingPower(account) * Math.abs(percent);
      const voteEffectiveShares = userVestingShares * (userVotingPower / 10000) * 0.02;

      // reward curve algorithm (no idea whats going on here)
      const CURVE_CONSTANT = 2000000000000;
      const CURVE_CONSTANT_X4 = 4 * CURVE_CONSTANT;
      const SQUARED_CURVE_CONSTANT = CURVE_CONSTANT * CURVE_CONSTANT;

      const postRsharesNormalized = postRshares + CURVE_CONSTANT;
      const postRsharesAfterVoteNormalized = postRshares + voteEffectiveShares + CURVE_CONSTANT;
      const postRsharesCurve =
        (postRsharesNormalized * postRsharesNormalized - SQUARED_CURVE_CONSTANT) /
        (postRshares + CURVE_CONSTANT_X4);
      const postRsharesCurveAfterVote =
        (postRsharesAfterVoteNormalized * postRsharesAfterVoteNormalized - SQUARED_CURVE_CONSTANT) /
        (postRshares + voteEffectiveShares + CURVE_CONSTANT_X4);

      const voteClaim = postRsharesCurveAfterVote - postRsharesCurve;

      const proportion = voteClaim / fundRecentClaims;
      const fullVote = proportion * fundRewardBalance;

      const voteValue = fullVote * (base / quote);

      if (sign > 0) {
        return Math.max(voteValue * sign, 0);
      }

      return voteValue * sign;
    },
    [activeUser, dynamicProps, entry.net_rshares]
  );

  const upVoteClicked = useCallback(() => {
    const { upVoted } = isVoted;
    if (!upVoted || (upVoted && initialVoteValues.up !== upSliderVal)) {
      const estimated = Number(estimate(upSliderVal).toFixed(3));
      onClick(upSliderVal, estimated);
      setVoteValue("up", `${activeUser?.username!}-${entry.post_id}`, upSliderVal);
      setVoteValue("upPrevious", `${activeUser?.username!}-${entry.post_id}`, upSliderVal);
      setWrongValueUp(false);
      setWrongValueDown(false);
      ls.set(isPostSlider ? "post_upSlider_value" : "comment_upSlider_value", upSliderVal);
    } else if (upVoted && initialVoteValues.up === upSliderVal) {
      setWrongValueUp(true);
      setWrongValueDown(false);
    }
  }, [
    activeUser?.username,
    entry.post_id,
    estimate,
    initialVoteValues.up,
    isPostSlider,
    isVoted,
    onClick,
    upSliderVal
  ]);

  const downVoteClicked = useCallback(() => {
    const { downVoted } = isVoted;
    const downSliderValue = downSliderVal * -1;

    if (!downVoted || (downVoted && initialVoteValues.down !== downSliderValue)) {
      const estimated = Number(estimate(downSliderValue).toFixed(3));
      onClick(downSliderValue, estimated);
      setWrongValueDown(false);
      setWrongValueUp(false);
      setVoteValue("down", `${activeUser?.username!}-${entry.post_id}`, downSliderValue);
      setVoteValue("downPrevious", `${activeUser?.username!}-${entry.post_id}`, downSliderValue);
      ls.set(isPostSlider ? "post_downSlider_value" : "comment_downSlider_value", downSliderVal);
    } else if (downVoted && initialVoteValues.down === downSliderValue) {
      setWrongValueDown(true);
      setWrongValueUp(false);
    }
  }, [
    activeUser?.username,
    downSliderVal,
    entry.post_id,
    estimate,
    initialVoteValues.down,
    isPostSlider,
    isVoted,
    onClick
  ]);

  return (
    <>
      {mode === "up" && (
        <>
          <div className={`voting-controls voting-controls-up ${days > 7.0 ? "disable" : ""}`}>
            <Button
              noPadding={true}
              className="w-8"
              size="xs"
              icon={chevronUpSvgForSlider}
              onClick={upVoteClicked}
              outline={true}
            />
            <div className="estimated">
              <FormattedCurrency value={estimate(upSliderVal)} fixAt={3} />
            </div>
            <div className="space" />
            <div className="slider slider-up">
              <InputVote value={upSliderVal} setValue={(x) => upSliderChanged(x)} />
            </div>
            <div className="percentage" />
            <Button
              noPadding={true}
              className="w-8"
              appearance="danger"
              outline={true}
              size="xs"
              icon={chevronDownSvgForSlider}
              onClick={() => setMode("down")}
            />
          </div>
          {wrongValueUp && (
            <div className="vote-error">
              <p>{i18next.t("entry-list-item.vote-error")}</p>
            </div>
          )}
          {showWarning && (
            <div className="vote-warning">
              <p>{i18next.t("entry-list-item.vote-warning")}</p>
            </div>
          )}
          {showRemove && (
            <div className="vote-remove">
              <p>{i18next.t("entry-list-item.vote-remove")}</p>
            </div>
          )}
        </>
      )}

      {mode === "down" && (
        <>
          <div className={`voting-controls voting-controls-down ${days > 7.0 ? "disable" : ""}`}>
            <Button
              noPadding={true}
              className="w-8"
              size="xs"
              icon={chevronUpSvgForSlider}
              onClick={() => setMode("up")}
              outline={true}
            />
            <div className="estimated">
              <FormattedCurrency value={estimate(downSliderVal)} fixAt={3} />
            </div>
            <div className="slider slider-down">
              <InputVote
                mode="negative"
                value={downSliderVal}
                setValue={(x) => downSliderChanged(x)}
              />
            </div>
            <div className="space" />
            <div className="percentage" />
            <Button
              noPadding={true}
              className="w-8"
              size="xs"
              appearance="danger"
              outline={true}
              icon={chevronDownSvgForSlider}
              onClick={downVoteClicked}
            />
          </div>

          {wrongValueDown && (
            <div className="vote-error">
              <p>{i18next.t("entry-list-item.vote-error")}</p>
            </div>
          )}
          {showWarning && (
            <div className="vote-warning">
              <p>{i18next.t("entry-list-item.vote-warning")}</p>
            </div>
          )}
          {showRemove && (
            <div className="vote-remove">
              <p>{i18next.t("entry-list-item.vote-remove")}</p>
            </div>
          )}
        </>
      )}

      {days >= 7.0 && (
        <div className="vote-error error-message">
          <p>{i18next.t("entry-list-item.old-post-error")}</p>
          <div className="vote-error-suggestion">
            {i18next.t("entry-list-item.old-post-error-suggestion")}
            <div className="tipping-icon">
              <EntryTipBtn
                account={account}
                entry={entry}
                setTipDialogMounted={setTipDialogMounted}
                handleClickAway={handleClickAway}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
