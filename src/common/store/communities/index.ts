import {Dispatch} from 'redux';
import {Community, getCommunity} from '../../api/hive';

import {Actions, ActionTypes, State, FetchedAction} from './types';

export const initialState: State = {
    list: {}
};

export default (state: State = initialState, action: Actions): State => {
    switch (action.type) {
        case ActionTypes.FETCHED: {
            const {list} = state;

            list[action.name] = action.data;

            return {...state, list: {...list}};
        }
        default:
            return state;
    }
}

/* Actions */
export const fetchCommunity = (name: string) =>
    (dispatch: Dispatch) => {
        getCommunity(name).then(r => {
            if (!r) return;

            dispatch(fetchedAct(name, r));
        });
    };

export const fetchedAct = (name: string, data: Community): FetchedAction => {
    return {
        type: ActionTypes.FETCHED,
        name,
        data
    }
};
