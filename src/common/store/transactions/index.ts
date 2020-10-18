import {Dispatch} from "redux";

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

import {getAccountHistory} from "../../api/hive";

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
            return {...initialState};
        }
        default:
            return state;
    }
};

/* Actions */
export const fetchTransactions = (username: string) => (dispatch: Dispatch) => {
    dispatch(fetchAct());

    const name = username.replace("@", "");

    getAccountHistory(name).then(r => {

        const mapped: Transaction[] = r.map((x: any): Transaction[] | null => {
            const {op} = x[1];
            const {timestamp} = x[1];
            const opName = op[0];
            const opData = op[1];

            if (["curation_reward",
                "author_reward",
                "comment_benefactor_reward",
                "claim_reward_balance",
                "transfer",
                "transfer_to_vesting",
                "withdraw_vesting",
                "fill_order"].includes(opName)) {
                return {
                    num: x[0],
                    type: opName,
                    timestamp,
                    ...opData,
                };
            }

            return null;
        });

        const transactions: Transaction[] = mapped
            .filter(x => x !== null)
            .sort((a, b) => {
                return a.num > b.num ? 1 : -1
            });

        dispatch(fetchedAct(transactions));
    }).catch(() => {
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
