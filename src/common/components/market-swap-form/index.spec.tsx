import renderer from "react-test-renderer";
import React from "react";
import { MarketSwapForm, Props } from "./index";

describe("MarketSwapForm", function () {
  it("should render correctly null active user", function () {
    const props: Props = {
      activeUser: null,
      global: {} as any,
      addAccount: jest.fn(),
      updateActiveUser: jest.fn(),
      signingKey: "",
      setSigningKey: jest.fn()
    };
    const component = renderer.create(<MarketSwapForm {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });

  it("should render correctly existing active user", function () {
    const props: Props = {
      activeUser: { username: "test", data: {} as any, points: null as any },
      global: {} as any,
      addAccount: jest.fn(),
      updateActiveUser: jest.fn(),
      signingKey: "",
      setSigningKey: jest.fn()
    };
    const component = renderer.create(<MarketSwapForm {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
