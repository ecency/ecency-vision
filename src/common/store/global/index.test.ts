import reducer, {initialState, themeChangeAct, hideIntroAct, listStyleChangeAct, muteNotificationsAct, unMuteNotificationsAct, setLangAct, setNsfwAct, hasKeyChainAct} from "./index";

import {Theme, ListStyle} from "./types";
import {locationChangeAct} from "../common";

let state = initialState;

it("1- default state", () => {
    expect(state).toMatchSnapshot();
});

it("2- location change. should change filter and tag", () => {
    state = reducer(state, locationChangeAct("/trending/bitcoin"));
    expect(state).toMatchSnapshot();
});

it("3- theme change", () => {
    state = reducer(state, themeChangeAct(Theme.night));
    expect(state).toMatchSnapshot();
});

it("4- hide intro", () => {
    state = reducer(state, hideIntroAct());
    expect(state).toMatchSnapshot();
});

it("5- list style change", () => {
    state = reducer(state, listStyleChangeAct(ListStyle.grid));
    expect(state).toMatchSnapshot();
});

it("6- Has keychain act", () => {
    state = reducer(state, hasKeyChainAct());
    expect(state).toMatchSnapshot();
});

it("7- Mute notifications act", () => {
    state = reducer(state, muteNotificationsAct());
    expect(state).toMatchSnapshot();
});

it("8- Unmute notifications act", () => {
    state = reducer(state, unMuteNotificationsAct());
    expect(state).toMatchSnapshot();
});

it("9- Set lang act", () => {
    state = reducer(state, setLangAct("tr-TR"));
    expect(state).toMatchSnapshot();
});

it("10- Set nsfw act", () => {
    state = reducer(state, setNsfwAct(true));
    expect(state).toMatchSnapshot();
});
