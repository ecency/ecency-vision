import {Dispatch} from "redux";

import {
    Points,
    PointTransaction,
    Actions,
    ActionTypes,
    FetchAction,
    FetchedAction,
} from "./types";

import {getPoints, getPointTransactions} from "../../api/private";

export const initialState: Points = {
    points: "0.000",
    uPoints: "0.000",
    transactions: []
};

export default (state: Points = initialState, action: Actions): Points => {
    switch (action.type) {
        case ActionTypes.FETCH: {
            return {...initialState};
        }
        case ActionTypes.FETCHED: {
            return {
                points: action.points,
                uPoints: action.uPoints,
                transactions: action.transactions || [...state.transactions]
            }
        }
        default:
            return state;
    }
}

/* Actions */

export const fetchPoints = (username: string, transactions?: boolean) => async (dispatch: Dispatch) => {
    dispatch(fetchAct());

    const name = username.replace("@", "");

    let points;
    try {
        points = await getPoints(name);
    } catch (e) {
        return;
    }

    dispatch(fetchedAct(points.points, points.unclaimed_points));

    if (transactions) {
        let trx;
        try {
            trx = await getPointTransactions(name);
        } catch (e) {
            return;
        }

        dispatch(fetchedAct(points.points, points.unclaimed_points, trx));
    }

}


export const resetPoints = () => (dispatch: Dispatch) => {
    dispatch(fetchAct());
};


/* Action Creators */
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
