import React from "react";

import renderer from "react-test-renderer";

import EmojiPicker from "./index-old";

import emojiData from "../../../../public/emoji.json";

jest.mock("../../api/misc", () => ({
  getEmojiData: () =>
    new Promise((resolve) => {
      resolve(emojiData);
    })
}));

jest.mock("../../util/local-storage", () => ({
  get: () => ["dog2", "wink"]
}));

const detailProps = {
  fallback: () => {}
};

const component = renderer.create(<EmojiPicker {...detailProps} />);

it("(1) Default full render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Filter", () => {
  const instance: any = component.getInstance();
  instance.setState({ filter: "dog" });
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Filter - No result", () => {
  const instance: any = component.getInstance();
  instance.setState({ filter: "loremipsumdolorsit" });
  expect(component.toJSON()).toMatchSnapshot();
});
