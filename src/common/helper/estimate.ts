import { votingPower } from "../api/hive";
import { ActiveUser } from "../store/active-user/types";
import { DynamicProps } from "../store/dynamic-props/types";
import { Entry } from "../store/entries/types";
import parseAsset from "./parse-asset";

export const estimate = (
  entry: Entry,
  activeUser: ActiveUser,
  dynamicProps: DynamicProps,
  percent: number
): number => {
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
};
