import { MarketAsset } from "./market-pair";
import renderer from "react-test-renderer";
import React from "react";
import { Props, SignMethods } from "./sign-methods";

describe("SignMethods", function () {
  it("should render sign methods", function () {
    const props: Props = {
      global: {} as any,
      disabled: false,
      fromAmount: "1",
      toAmount: "1",
      marketRate: 1,
      asset: MarketAsset.HIVE,
      loading: false,
      setLoading: jest.fn(),
      activeUser: {} as any,
      addAccount: jest.fn(),
      updateActiveUser: jest.fn(),
      onSuccess: jest.fn(),
      signingKey: "",
      setSigningKey: jest.fn()
    };
    const component = renderer.create(<SignMethods {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
