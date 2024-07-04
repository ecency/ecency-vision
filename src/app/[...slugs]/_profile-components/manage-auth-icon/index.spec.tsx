import React from "react";
import ManageAuthIcon from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";
import { activeUserInstance } from "../../helper/test-helper";

it("(1) Default render", () => {
  const props = {
    type: "",
    account: "",
    Pkey: "",
    label: "",
    action: "",
    keyType: "",
    activeUser: { ...activeUserInstance },
    history: createBrowserHistory(),
    onRevoke: () => {},
    onCopy: () => {},
    onImport: () => {},
    onReveal: () => {}
  };
  const component = renderer.create(<ManageAuthIcon {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
