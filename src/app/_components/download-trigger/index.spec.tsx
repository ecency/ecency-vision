import React from "react";

import renderer from "react-test-renderer";

import { DialogContent } from "./index";

import { allOver } from "../../helper/test-helper";

let MOCK: string = "";

Object.defineProperty(global.navigator, "appVersion", {
  get: () => {
    if (MOCK === "MacOS") {
      return "5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36";
    }

    if (MOCK === "WindowsOS") {
      return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36";
    }

    if (MOCK === "LinuxOS") {
      return "Mozilla/5.0 (X11; Linux x86_64; rv:52.0) Gecko/20100101 Firefox/52.0";
    }

    if (MOCK === "AndroidOS") {
      return "Mozilla/5.0 (Linux; Android 6.0.1; RedMi Note 5 Build/RB3N5C; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/68.0.3440.91 Mobile Safari/537.36";
    }

    if (MOCK === "iOS") {
      return "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0 like Mac OS X) AppleWebKit/602.1.38 (KHTML, like Gecko) Version/10.0 Mobile/14A5297c Safari/602.1";
    }

    return "";
  }
});

it("(1) Mac.", async () => {
  MOCK = "MacOS";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Windows.", async () => {
  MOCK = "WindowsOS";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Linux.", async () => {
  MOCK = "LinuxOS";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Android.", async () => {
  MOCK = "AndroidOS";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(5) iOS.", async () => {
  MOCK = "iOS";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(6) Other.", async () => {
  MOCK = "";
  const component = await renderer.create(<DialogContent />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
