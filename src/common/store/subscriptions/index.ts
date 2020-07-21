import {Subscription, Actions, ActionTypes} from "./types";

export const initialState: Subscription[] = [];

export default (state: Subscription[] = initialState, action: Actions): Subscription[] => {
    switch (action.type) {
        case ActionTypes.UPDATE:
            return [...action.list]
        default:
            return state;
    }
}
