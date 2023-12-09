import React from "react";

import { Preferences } from "./index";

import renderer from "react-test-renderer";

import { activeUserInstance, globalInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    global: globalInstance,
    muteNotifications: () => {},
    unMuteNotifications: () => {},
    setCurrency: () => {},
    setLang: () => {},
    setNsfw: () => {},
    toggleTheme: () => {},
    setShowSelfVote: () => {},
    setShowRewardSplit: () => {},
    setLowRewardThreshold: () => {},
    setShowFrontEnd: (v: boolean) => {},
    setFooter: (v: string) => {}
  };

  const component = renderer.create(<Preferences {...props} activeUser={activeUserInstance} />);
  expect(component.toJSON()).toMatchSnapshot();
});
