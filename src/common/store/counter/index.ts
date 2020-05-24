import {Dispatch} from 'redux';
import {State, Actions, ActionTypes, IncrementAction, DecrementAction} from './types';

export const initialState: State = {
    val: 0
};

export default (state: State = initialState, action: Actions) => {
    switch (action.type) {
        case ActionTypes.SET_COUNTER:
            return action.value;
        case ActionTypes.INCREMENT_COUNTER:
            return {...state, val: state.val + 1};
        case ActionTypes.DECREMENT_COUNTER:
            return {...state, val: state.val - 1};
        default:
            return state;
    }
};

/* Actions */
export const incrementCounter = () => (dispatch: Dispatch) => {
    dispatch(incrementAct());
};

export const decrementCounter = () => (dispatch: Dispatch) => {
    dispatch(decrementAct());
};

/* Action Creators */
export const incrementAct = (): IncrementAction => {
    return {
        type: ActionTypes.INCREMENT_COUNTER
    }
};

export const decrementAct = (): DecrementAction => {
    return {
        type: ActionTypes.DECREMENT_COUNTER
    }
};
