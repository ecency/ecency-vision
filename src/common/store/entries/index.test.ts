import reducer, {
    initialState,
    fetchAct,
    fetchErrorAct,
    fetchedAct,
    invalidateAct
} from './index';

import {locationChangeAct} from '../common';

import {State} from './types';


let state: State = initialState;

it('1- default state', () => {
    expect(state).toMatchSnapshot();
});

it('2- location change. should create a group with default filter.', () => {
    state = reducer(state, locationChangeAct('/'));
    expect(state).toMatchSnapshot();
});

it('3- location change. should create a group with the filter and tag given.', () => {
    state = reducer(state, locationChangeAct('/trending/bitcoin'));
    expect(state).toMatchSnapshot();
});

it('4- location change with invalid filter. state should state same.', () => {
    state = reducer(state, locationChangeAct('/trendinx/bitcoin'));
    expect(state).toMatchSnapshot();
});

it('5- start fetching. should toggle "loading"', () => {
    const act = fetchAct('hot');
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('6- fetch error. should toggle "loading" and add error object to the group.', () => {
    const act = fetchErrorAct('hot', 'fetch error');
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('7- start fetching.', () => {
    const act = fetchAct('trending-bitcoin');
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});


it('8- fetched.', () => {
    const entries = [
        {
            author: 'lorem',
            permlink: 'lorem-ipsum-dolor-sit-amet'
        },
        {
            author: 'consectetur',
            permlink: 'consectetur-adipiscing elit-in-vel-enim-libero'
        },
        {
            author: 'nam',
            permlink: 'tempor-nibh-eget-enim-vulputate'
        },
        {
            author: 'vivamus',
            permlink: 'vivamus-ornare-at-tortor-eu-vestibulum'
        }
    ];

    // @ts-ignore
    const act = fetchedAct('trending-bitcoin', entries, true);
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('9- start fetching again (simulates user scrolling down)', () => {
    const act = fetchAct('trending-bitcoin');
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('10- fetched. should ignore posts already in store.', () => {
    const entries = [
        {
            author: 'vivamus',
            permlink: 'vivamus-ornare-at-tortor-eu-vestibulum'
        },
        {
            author: 'donec',
            permlink: 'donec-bibendum-tortor-ultricies'
        }
    ];

    // @ts-ignore
    const act = fetchedAct('trending-bitcoin', entries, false);
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('11- invalidate. should reset the group.', () => {
    const act = invalidateAct('trending-bitcoin');
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});
