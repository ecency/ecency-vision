import { Dispatch } from "redux";

import {
  Transaction,
  Actions,
  ActionTypes,
  State,
  FetchAction,
  FetchedAction,
  FetchErrorAction,
  ResetAction,
} from "./types";

import { getState } from "../../api/hive";

export const initialState: State = {
  list: [],
  loading: false,
  error: false,
};

export default (state: State = initialState, action: Actions): State => {
  switch (action.type) {
    case ActionTypes.FETCH: {
      return { ...initialState };
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

      const transactions: Transaction[] = transferHistory.slice(Math.max(transferHistory.length - 50, 0));

      transactions.sort((a, b) => b[0] - a[0]);

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
