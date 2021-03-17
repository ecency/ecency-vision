import {Dispatch} from "redux";

import {
    Points,
    PointTransaction,
    Actions,
    ActionTypes,
    ResetAction,
    FetchAction,
    FetchedAction,
    ErrorAction
} from "./types";

import {getPoints, getPointTransactions} from "../../api/private-api";

export const initialState: Points = {
    points: "0.000",
    uPoints: "0.000",
    transactions: [],
    loading: false
};

export default (state: Points = initialState, action: Actions): Points => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {...state, transactions: [], loading: true}
        }
        case ActionTypes.FETCHED: {
            return {
                points: action.points,
                uPoints: action.uPoints,
                transactions: action.transactions || [...state.transactions],
                loading: false
            }
        }
        case ActionTypes.ERROR: {
            return {...state, loading: false}
        }
        case ActionTypes.RESET: {
            return {...initialState};
        }
        default:
            return state;
    }
}

/* Actions */

export const fetchPoints = (username: string, type?: number) => async (dispatch: Dispatch) => {
    dispatch(fetchAct());

    const name = username.replace("@", "");

    let points;
    try {
        points = await getPoints(name);
    } catch (e) {
        dispatch(errorAct());
        return;
    }

    let transactions;
    try {
        transactions = await getPointTransactions(name, type);
    } catch (e) {
        dispatch(errorAct());
        return;
    }

    dispatch(fetchedAct(points.points, points.unclaimed_points, transactions));
}


export const resetPoints = () => (dispatch: Dispatch) => {
    dispatch(resetAct());
};


/* Action Creators */
export const resetAct = (): ResetAction => {
    return {
        type: ActionTypes.RESET,
    };
};

export const errorAct = (): ErrorAction => {
    return {
        type: ActionTypes.ERROR,
    };
};


export const fetchAct = (): FetchAction => {
    return {
        type: ActionTypes.FETCH,
    };
};

export const fetchedAct = (points: string, uPoints: string, transactions?: PointTransaction[]): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        points,
        uPoints,
        transactions,
    };
};
