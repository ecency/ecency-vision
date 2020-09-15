import {Dispatch} from "redux";

import {Community, Communities, Actions, ActionTypes, AddAction} from "./types";

export const initialState: Communities = [];

export default (state: Communities = initialState, action: Actions): Communities => {
    switch (action.type) {
        case ActionTypes.ADD: {
            const {data} = action;

            return [...state.filter((x) => x.name !== data.name), data];
        }
        default:
            return state;
    }
};

/* Actions */
export const addCommunity = (data: Community) => (dispatch: Dispatch) => {
    dispatch(addAct(data));
};


/* Action Creators */

export const addAct = (data: Community): AddAction => {
    return {
        type: ActionTypes.ADD,
        data,
    };
};
