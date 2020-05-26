import reducer, {initialState, fetchedAct} from './index';

import {State} from './types';

let state: State = initialState;

it('1- default state', () => {
    expect(state).toMatchSnapshot();
});

it('1- fetched', () => {
    // @ts-ignore
    state = reducer(state, fetchedAct('hive-1234', {title: 'bitcoin'}));
    expect(state).toMatchSnapshot();
});

it('2- fetched', () => {
    // @ts-ignore
    state = reducer(state, fetchedAct('hive-2345', {title: 'photography'}));
    expect(state).toMatchSnapshot();
});
