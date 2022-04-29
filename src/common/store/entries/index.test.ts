import reducer, {
    initialState,
    fetchAct,
    fetchErrorAct,
    fetchedAct,
    invalidateAct,
    updateAct
} from './index';

import {locationChangeAct} from '../common';


let state = initialState;

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
    const act = fetchErrorAct('hot', '', 'fetch error');
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
            permlink: 'lorem-ipsum-dolor-sit-amet',
            payout: 1
        },
        {
            author: 'consectetur',
            permlink: 'consectetur-adipiscing elit-in-vel-enim-libero',
            payout: 1
        },
        {
            author: 'nam',
            permlink: 'tempor-nibh-eget-enim-vulputate',
            payout: 1
        },
        {
            author: 'vivamus',
            permlink: 'vivamus-ornare-at-tortor-eu-vestibulum',
            payout: 1
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
            permlink: 'donec-bibendum-tortor-ultricies',
            payout: 1
        }
    ];

    // @ts-ignore
    const act = fetchedAct('trending-bitcoin', entries, false);
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});

it('11- location change for an extra group', () => {
    state = reducer(state, locationChangeAct('/created/bitcoin'));
    expect(state).toMatchSnapshot();
});


it('12- fetched another group.', () => {
    const entries = [
      {
        author: "nam",
        permlink: "tempor-nibh-eget-enim-vulputate",
        payout: 1,
      },
    ];

    // @ts-ignore
    const act = fetchedAct('created-bitcoin', entries, false);
    state = reducer(state, act);
    expect(state).toMatchSnapshot();
});


it("13- update a particular entry.", () => {
  const entry = {
    author: "nam",
    permlink: "tempor-nibh-eget-enim-vulputate",
    payout: 1.2,
  };

  // @ts-ignore
  const act = updateAct(entry);
  state = reducer(state, act);
  expect(state).toMatchSnapshot();
});


it("14- invalidate. should reset the group.", () => {
  const act = invalidateAct("trending-bitcoin");
  state = reducer(state, act);
  expect(state).toMatchSnapshot();
});

