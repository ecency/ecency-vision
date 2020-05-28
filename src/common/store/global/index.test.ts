import reducer, {initialState, themeChangeAct, hideIntroAct, listStyleChangeAct} from './index';

import {State, Theme, ListStyle} from './types';
import {locationChangeAct} from '../common';

let state: State = initialState;

it('1- default state', () => {
    expect(state).toMatchSnapshot();
});

it('2- location change. should change filter and tag', () => {
    state = reducer(state, locationChangeAct('/trending/bitcoin'));
    expect(state).toMatchSnapshot();
});

it('3- theme change', () => {
    state = reducer(state, themeChangeAct(Theme.night));
    expect(state).toMatchSnapshot();
});

it('4- hide intro', () => {
    state = reducer(state, hideIntroAct());
    expect(state).toMatchSnapshot();
});

it('5- list style change', () => {
    state = reducer(state, listStyleChangeAct(ListStyle.grid));
    expect(state).toMatchSnapshot();
});
