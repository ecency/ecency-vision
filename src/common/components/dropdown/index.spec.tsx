import React from "react";

import MyDropDown from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

const props = {
  history: createBrowserHistory(),
  label: "Trending",
  items: [
    {
      label: "Trending",
      href: "/trending",
      active: true,
    },
    {
      label: "Hot",
      href: "/hot",
    },
  ],
};

const component = renderer.create(<MyDropDown {...props} float="left" />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Show menu", () => {
  const instance: any = component.getInstance();
  instance.showMenu();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Hide menu", () => {
  const instance: any = component.getInstance();
  instance.hideMenu();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) With custom label and header text", () => {
  const component2 = renderer.create(
    <MyDropDown {...props} float="left" label={<span>open menu</span>} header="My menu" />
  );
  const instance: any = component2.getInstance();
  instance.showMenu();
  expect(component2.toJSON()).toMatchSnapshot();
});
