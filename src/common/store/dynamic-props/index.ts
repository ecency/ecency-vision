import { Dispatch } from "redux";

import { DynamicProps, State, Actions, ActionTypes, FetchedAction } from "./types";

import { getDynamicGlobalProperties, getFeedHistory, getRewardFund } from "../../api/hive";

import parseAsset from "../../helper/parse-asset";

export const initialState: State = {
  hivePerMVests: 1,
  base: 1,
  quote: 1,
  fundRewardBalance: 1,
};

export default (state: State = initialState, action: Actions): State => {
  switch (action.type) {
    case ActionTypes.FETCHED: {
      return { ...action.props };
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchDynamicProps = () => async (dispatch: Dispatch) => {
  const globalDynamic = await getDynamicGlobalProperties();
  const feedHistory = await getFeedHistory();
  const rewardFund = await getRewardFund();

  const hivePerMVests =
    (parseAsset(globalDynamic.total_vesting_fund_steem).amount /
      parseAsset(globalDynamic.total_vesting_shares).amount) *
    1e6;
  const base = parseAsset(feedHistory.current_median_history.base).amount;
  const quote = parseAsset(feedHistory.current_median_history.quote).amount;
  const fundRewardBalance = parseAsset(rewardFund.reward_balance).amount;
  
  const props = { hivePerMVests, base, quote, fundRewardBalance };

  dispatch(fetchedAct(props));
};

/* Action Creators */
export const fetchedAct = (props: DynamicProps): FetchedAction => {
  return {
    type: ActionTypes.FETCHED,
    props,
  };
};
