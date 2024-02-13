import React from "react";

import Comment from "./index";

import { UiInstance, globalInstance, entryInstance1 } from "../../helper/test-helper";

import renderer from "react-test-renderer";

import emojiData from "../../../../public/emoji.json";

jest.mock("../../api/misc", () => ({
  getEmojiData: () =>
    new Promise((resolve) => {
      resolve(emojiData);
    })
}));

const defProps = {
  defText: "",
  submitText: "Reply",
  users: [],
  global: globalInstance,
  activeUser: null,
  ui: UiInstance,
  entry: entryInstance1,
  inProgress: false,
  isCommented: false,
  cancellable: false,
  autoFocus: true,
  inputRef: null,
  location: {} as any,
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  onSubmit: () => Promise.resolve(),
  onCancel: () => {},
  toggleUIProp: () => {},
  resetSelection: () => {}
};

it("(1) Default render", () => {
  const props = { ...defProps };

  const component = renderer.create(<Comment {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Cancellable, in progress", () => {
  const props = { ...{ inProgress: true, cancellable: true, defText: "foo" }, ...defProps };

  const component = renderer.create(<Comment {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});
