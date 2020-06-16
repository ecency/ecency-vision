import { Dispatch } from "redux";

import {
  Transaction,
  Transactions,
  Actions,
  ActionTypes,
  FetchAction,
  FetchedAction,
  FetchErrorAction,
  ResetAction,
} from "./types";

import { getState } from "../../api/hive";

export const initialState: Transactions = {
  list: [],
  loading: false,
  error: false,
};

export default (state: Transactions = initialState, action: Actions): Transactions => {
  switch (action.type) {
    case ActionTypes.FETCH: {
      return {
        list: [],
        loading: true,
        error: false,
      };
    }
    case ActionTypes.FETCHED: {
      return {
        list: action.transactions,
        loading: false,
        error: false,
      };
    }
    case ActionTypes.FETCH_ERROR: {
      return {
        list: [],
        loading: false,
        error: true,
      };
    }
    case ActionTypes.RESET: {
      return { ...initialState };
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchTransactions = (username: string) => (dispatch: Dispatch) => {
  dispatch(fetchAct());

  const name = username.replace("@", "");

  getState(`/@${name}/transfers`)
    .then((r) => {
      const { accounts } = r;

      if (Object.keys(accounts).length === 0) {
        return;
      }

      const { transfer_history: transferHistory } = accounts[name];

      const transfers = transferHistory.slice(Math.max(transferHistory.length - 50, 0));
      transfers.sort((a: any, b: any) => b[0] - a[0]);

      const transactions: Transaction[] = transfers.map((tr: any) => {
        const { op } = tr[1];
        const { timestamp } = tr[1];
        const opName = op[0];
        const opData = op[1];

        return {
          num: tr[0],
          type: opName,
          timestamp,
          ...opData,
        };
      });

      dispatch(fetchedAct(transactions));
    })
    .catch(() => {
      dispatch(fetchErrorAct());
    });
};

export const resetTransactions = () => (dispatch: Dispatch) => {
  dispatch(resetAct());
};

/* Action Creators */
export const fetchAct = (): FetchAction => {
  return {
    type: ActionTypes.FETCH,
  };
};

export const fetchedAct = (transactions: Transaction[]): FetchedAction => {
  return {
    type: ActionTypes.FETCHED,
    transactions,
  };
};

export const fetchErrorAct = (): FetchErrorAction => {
  return {
    type: ActionTypes.FETCH_ERROR,
  };
};

export const resetAct = (): ResetAction => {
  return {
    type: ActionTypes.RESET,
  };
};
