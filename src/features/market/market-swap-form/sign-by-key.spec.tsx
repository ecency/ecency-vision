import renderer from "react-test-renderer";
import React from "react";
import { SignByKey, Props } from "./sign-by-key";

describe("SignByKey", function () {
  it("should render correctly", function () {
    const props: Props = {
      activeUser: null,
      onBack: jest.fn(),
      onKey: jest.fn(),
      signingKey: "",
      isLoading: false,
      setSigningKey: jest.fn()
    };
    const component = renderer.create(<SignByKey {...props} />);
    expect(component.toJSON()).toMatchSnapshot();
  });
});
