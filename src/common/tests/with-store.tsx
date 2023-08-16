import React from "react";
import configureStore from "../store/configure";
import initialState from "../store/initial-state";
import TestRenderer from "react-test-renderer";
import { Provider } from "react-redux";
import {
  activeUserInstance,
  globalInstance,
  notificationsInstance1,
  TrendingTagsInstance,
  UiInstance
} from "../helper/test-helper";
import { AppState } from "../store";

export function withStore(
  ui: JSX.Element,
  additionalState: Partial<AppState> = {},
  store = configureStore({
    ...{
      ...initialState,
      global: globalInstance,
      ui: UiInstance,
      activeUser: activeUserInstance,
      trendingTags: TrendingTagsInstance,
      notifications: notificationsInstance1
    },
    ...additionalState
  })
) {
  return TestRenderer.create(<Provider store={store}>{ui}</Provider>);
}
