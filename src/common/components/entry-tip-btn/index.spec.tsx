import React from "react";

import EntryTipBtn, { TippingDialog } from "./index";

import {
  globalInstance,
  dynamicPropsIntance1,
  UiInstance,
  entryInstance1,
  fullAccountInstance
} from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

const defProps = {
  account: {
    name: "user1"
  },
  entry: entryInstance1,
  updateWalletValues: () => {},
  setTipDialogMounted: () => {},
  handleClickAway: () => {}
};

it("(1) Default render", async () => {
  const renderer = withStore(<EntryTipBtn {...defProps} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});

it("(2) Dialog", async () => {
  const props = {
    global: globalInstance,
    dynamicProps: dynamicPropsIntance1,
    users: [],
    account: {
      name: "user1"
    },
    ui: UiInstance,
    activeUser: {
      username: "foo",
      data: {
        ...fullAccountInstance
      },
      points: {
        points: "200.000",
        uPoints: "0.000"
      }
    },
    entry: entryInstance1,
    signingKey: "",
    addAccount: () => {},
    setActiveUser: () => {},
    updateActiveUser: () => {},
    deleteUser: () => {},
    toggleUIProp: () => {},
    setSigningKey: () => {},
    fetchPoints: () => {},
    updateWalletValues: () => {},
    onHide: () => {}
  };

  const renderer = withStore(<TippingDialog {...props} />);
  expect(renderer.toJSON()).toMatchSnapshot();
});
