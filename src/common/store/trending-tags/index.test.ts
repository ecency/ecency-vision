import reducer, {initialState, fetchAct, fetchedAct, fetchErrorAct} from './index';

let state = initialState;

it('1- default state', () => {
    expect(state).toMatchSnapshot();
});


it('2- fetch', () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it('3- fetch error', () => {
    state = reducer(state, fetchErrorAct());
    expect(state).toMatchSnapshot();
});

it('4- fetch', () => {
    state = reducer(state, fetchAct());
    expect(state).toMatchSnapshot();
});

it('5- fetched', () => {
    state = reducer(state, fetchedAct(['bitcoin', 'hive', 'photography']));
    expect(state).toMatchSnapshot();
});

