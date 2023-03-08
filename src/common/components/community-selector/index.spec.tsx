import React from "react";
import renderer from "react-test-renderer";

import { CommunitySelector, Browser } from "./index";

import { globalInstance, activeUserMaker, allOver } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

let MOCK_MODE_1 = 1;

jest.mock("../../api/bridge", () => ({
  getCommunity: (name: string) =>
    new Promise((resolve) => {
      if (name === "hive-125125") {
        resolve({
          name: "hive-125125",
          title: "Ecency"
        });
        return;
      }

      resolve(null);
    }),
  getSubscriptions: () =>
    new Promise((resolve) => {
      resolve([
        ["hive-125125", "Ecency"],
        ["hive-131131", "Foo"],
        ["hive-145145", "Bar"]
      ]);
    })
}));

const defProps = {
  global: globalInstance,
  activeUser: activeUserMaker("foo"),
  onSelect: () => {}
};

it("(1) Empty tags.", async () => {
  const props = {
    ...defProps,
    tags: []
  };
  const component = withStore(<CommunitySelector {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Tags with no community", async () => {
  const props = {
    ...defProps,
    tags: ["foo", "bar"]
  };
  const component = withStore(<CommunitySelector {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Tags with community. but in the end", async () => {
  const props = {
    ...defProps,
    tags: ["foo", "bar", "hive-125125"]
  };
  const component = withStore(<CommunitySelector {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Tags with community.", async () => {
  const props = {
    ...defProps,
    tags: ["hive-125125", "foo", "bar"]
  };
  const component = withStore(<CommunitySelector {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(5) Tags with community. But not valid", async () => {
  const props = {
    ...defProps,
    tags: ["hive-122122", "foo", "bar"]
  };
  const component = withStore(<CommunitySelector {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(6) Browser", async () => {
  const props = {
    ...defProps,
    onHide: () => {}
  };
  const component = withStore(<Browser {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
