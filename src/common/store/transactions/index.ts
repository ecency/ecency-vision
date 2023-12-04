import { Dispatch } from "redux";
import { utils } from "@hiveio/dhive";

import {
  OperationGroup,
  Transaction,
  Transactions,
  Actions,
  ActionTypes,
  FetchAction,
  FetchedAction,
  FetchErrorAction,
  ResetAction,
  setOldestAction
} from "./types";

import { getAccountHistory } from "../../api/hive";

const ops = utils.operationOrders;

export const ACCOUNT_OPERATION_GROUPS: Record<OperationGroup, number[]> = {
  transfers: [
    ops.transfer,
    ops.transfer_to_savings,
    ops.cancel_transfer_from_savings,
    ops.recurrent_transfer,
    ops.fill_recurrent_transfer,
    ops.proposal_pay
  ],
  "market-orders": [
    ops.fill_convert_request,
    ops.fill_order,
    ops.fill_collateralized_convert_request,
    ops.limit_order_create2,
    ops.limit_order_create,
    ops.limit_order_cancel
  ],
  interests: [ops.interest],
  "stake-operations": [
    ops.return_vesting_delegation,
    ops.withdraw_vesting,
    ops.transfer_to_vesting,
    ops.set_withdraw_vesting_route,
    ops.update_proposal_votes,
    ops.fill_vesting_withdraw,
    ops.account_witness_proxy,
    ops.delegate_vesting_shares
  ],
  rewards: [
    ops.author_reward,
    ops.curation_reward,
    ops.producer_reward,
    ops.claim_reward_balance,
    ops.comment_benefactor_reward,
    ops.liquidity_reward,
    ops.comment_reward
  ]
};

const ALL_ACCOUNT_OPERATIONS = [...Object.values(ACCOUNT_OPERATION_GROUPS)].reduce(
  (acc, val) => acc.concat(val),
  []
);

export const initialState: Transactions = {
  list: [],
  loading: false,
  group: "",
  newest: null,
  oldest: null,
  debug: ""
};

export default (state: Transactions = initialState, action: Actions): Transactions => {
  switch (action.type) {
    case ActionTypes.FETCH: {
      if (action.clear || action.group !== state.group) {
        return {
          ...state,
          newest: null,
          oldest: null,
          group: action.group,
          list: [],
          loading: true
        };
      } else {
        return {
          ...state,
          loading: true
        };
      }
    }
    case ActionTypes.FETCHED: {
      let { begin, end } = action;
      let { newest, oldest } = state;
      let debug = `fetched ope  rations ${end}...${begin}`;
      const measured_first_num =
        (() => action.transactions[action.transactions.length - 1]?.num)() ?? null;
      const measured_last_num = (() => state.list[0]?.num)() ?? null;
      if (state.newest == null && state.oldest == null) {
        newest = begin;
        oldest = end;
        return {
          ...state,
          newest,
          oldest,
          list: action.transactions,
          loading: false,
          debug: `replacing list : ${oldest}..${newest}`
        };
      } else if (newest === null || oldest === null) {
        console.log("unaccounted for state");
        return { ...initialState };
      } else if (state.newest === action.begin && state.oldest == action.end) {
        return {
          ...state,
          loading: false,
          debug: action.debug + " but no change"
        };
      } else if (begin + 1 == oldest) {
        // load more case.
        oldest = end;
        if (measured_first_num < end) {
          end = measured_first_num;
        }
        return {
          ...state,
          oldest: end,
          list: [...state.list, ...action.transactions],
          loading: false,
          debug: `updating list [${state.oldest}..${state.newest}]=>[${end}..${newest}] actual though is [${measured_first_num}..${measured_last_num}]`
        };
      } else if (begin == oldest) {
        // off by one error
        oldest = end;
        if (measured_first_num < end) {
          end = measured_first_num;
        }
        return {
          ...state,
          oldest: end,
          list: [...state.list, ...action.transactions],
          loading: false,
          debug: `updating list [${state.oldest}..${state.newest}]=>[${end}..${newest}] actual though is [${measured_first_num}..${measured_last_num}]`
        };
      } else {
        return {
          ...state,
          debug: `Cannot reconcile the data ranges incoming:${begin}..${end} and state:${state.oldest}..${state.newest}`,
          loading: false
        };
      }
    }
    case ActionTypes.FETCH_ERROR: {
      return {
        ...state,
        list: [],
        loading: false,
        newest: null,
        oldest: null
      };
    }
    case ActionTypes.RESET: {
      return { ...initialState };
    }
    case ActionTypes.SET_OLDEST: {
      const { newest, oldest } = state;
      const measured_first_num = (() => state.list[state.list.length - 1]?.num)() ?? null;
      const measured_last_num = (() => state.list[0]?.num)() ?? null;
      return {
        ...state,
        oldest: action.oldest,
        debug: `updating list [${state.oldest}..${state.newest}]=>[${action.oldest}..${newest}] actual though is [${measured_first_num}..${measured_last_num}]`
      };
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchTransactions =
  (username: string, group: OperationGroup | "" = "", start: number = -1, limit: number = 20) =>
  (dispatch: Dispatch) => {
    dispatch(fetchAct(group, start === -1));

    const name = username.replace("@", "");

    let filters: any[] = [];
    switch (group) {
      case "transfers":
        filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["transfers"]);
        break;
      case "market-orders":
        filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["market-orders"]);
        break;
      case "interests":
        filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["interests"]);
        break;
      case "stake-operations":
        filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["stake-operations"]);
        break;
      case "rewards":
        filters = utils.makeBitMaskFilter(ACCOUNT_OPERATION_GROUPS["rewards"]);
        break;
      default:
        filters = utils.makeBitMaskFilter(ALL_ACCOUNT_OPERATIONS); // all
    }

    getAccountHistory(name, filters, start, limit)
      .then((r) => {
        const mapped: Transaction[] = r.map((x: any): Transaction[] | null => {
          const { op } = x[1];
          const { timestamp, trx_id } = x[1];
          const opName = op[0];
          const opData = op[1];

          return {
            num: x[0],
            type: opName,
            timestamp,
            trx_id,
            ...opData
          };
        });

        const transactions: Transaction[] = mapped
          .filter((x) => x !== null)
          .sort((a: any, b: any) => b.num - a.num);

        dispatch(fetchedAct(transactions, start, limit));
      })
      .catch((e) => {
        console.log(
          `caught exception ${e} from handler to a call of getAccountHistory(... start=${start}, limit=${limit}`,
          e
        );
        try {
          if (
            e.jse_info.stack[0].format ===
            "total_processed_items < 2000: Could not find filtered operation in ${total_processed_items} operations, to continue searching, set start=${sequence}."
          ) {
            if (start === 0 || start - 2000 < 0) {
              return;
            }
            dispatch(setOldestAct(start - 1999));
            fetchTransactions(username, group, start - 2000, limit)(dispatch);
            return;
          }
        } catch (e2) {
          console.log(e2);
        }
        console.error(e);
        dispatch(fetchErrorAct());
      });
  };

export const resetTransactions = () => (dispatch: Dispatch) => {
  dispatch(resetAct());
};

export const fetchSetOldest = (oldest: number) => (dispatch: Dispatch) => {
  dispatch(setOldestAct(oldest));
};

/* Action Creators */
export const fetchAct = (group: OperationGroup | "", clear: boolean): FetchAction => {
  return {
    type: ActionTypes.FETCH,
    clear,
    group
  };
};

export const fetchedAct = (
  transactions: Transaction[],
  start: number,
  limit: number
): FetchedAction => {
  // note: begin > end.
  let begin = start;
  let end = start - limit + 1;

  if (start < 0 && transactions.length > 0) {
    begin = transactions[0].num;
    end = transactions[0].num - limit + 1;
  }

  if (end < 0) {
    end = 0;
  }

  return {
    type: ActionTypes.FETCHED,
    transactions,
    begin,
    end,
    debug: `fetched txes from : ${begin} to ${end}`
  };
};

export const fetchErrorAct = (): FetchErrorAction => {
  return {
    type: ActionTypes.FETCH_ERROR
  };
};

export const resetAct = (): ResetAction => {
  return {
    type: ActionTypes.RESET
  };
};

export const setOldestAct = (oldest: number): setOldestAction => {
  return {
    type: ActionTypes.SET_OLDEST,
    oldest
  };
};
