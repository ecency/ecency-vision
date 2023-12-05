import React from "react";

import UserAvatar from "./index";
import TestRenderer from "react-test-renderer";

import { globalInstance } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

describe("UserAvatar", () => {
  it("(1) Should render small size", () => {
    const props = { username: "good-karma", size: "small" };
    const renderer = withStore(<UserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(2) Should render normal size", () => {
    const props = { username: "good-karma", size: "normal" };
    const renderer = withStore(<UserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(3) Should render medium size", () => {
    const props = { username: "good-karma", size: "medium" };
    const renderer = withStore(<UserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(4) Should render large size", () => {
    const props = { username: "good-karma", size: "large" };
    const renderer = withStore(<UserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });

  it("(5) Should render xlarge size", () => {
    const props = { username: "good-karma", size: "xLarge" };
    const renderer = withStore(<UserAvatar {...props} />);
    expect(renderer.toJSON()).toMatchSnapshot();
  });
});
