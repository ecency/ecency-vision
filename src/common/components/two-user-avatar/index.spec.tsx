import React from "react";

import TwoUserAvatar from "./index";
import TestRenderer from "react-test-renderer";

import { globalInstance } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

describe("UserAvatar", () => {
  it("(1) Should render small size", () => {
    const props = { global: globalInstance, from: "good-karma", to: "demo", size: "small" };
    const renderer = TestRenderer.create(<TwoUserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(2) Should render normal size", () => {
    const props = { global: globalInstance, from: "good-karma", to: "demo", size: "normal" };
    const renderer = TestRenderer.create(<TwoUserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(3) Should render medium size", () => {
    const props = { global: globalInstance, from: "good-karma", to: "demo", size: "medium" };
    const renderer = TestRenderer.create(<TwoUserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(4) Should render large size", () => {
    const props = { global: globalInstance, from: "good-karma", to: "demo", size: "large" };
    const renderer = TestRenderer.create(<TwoUserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(5) Should render xlarge size", () => {
    const props = { global: globalInstance, from: "good-karma", to: "demo", size: "xLarge" };
    const renderer = TestRenderer.create(<TwoUserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
