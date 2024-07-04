import React from "react";

import { Preferences } from "./index";

import renderer from "react-test-renderer";

import { activeUserInstance, globalInstance } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

it("(1) Default render", () => {
  const props = {
    global: globalInstance,
    activeUser: activeUserInstance,
    muteNotifications: () => {},
    unMuteNotifications: () => {},
    setCurrency: () => {},
    setLang: () => {},
    setNsfw: () => {},
    toggleTheme: () => {},
    updateNotificationsSettings: () => {},
    setNotificationsSettingsItem: () => {}
  };

  const renderer = withStore(<Preferences {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
