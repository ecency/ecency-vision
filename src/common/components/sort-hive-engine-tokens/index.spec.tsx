import React from "react";
import { SortEngineTokens } from "./index";
import renderer from "react-test-renderer";

const props = {
  sortTokensInAscending: () => {},
  sortTokensInDescending: () => {},
  sortTokensbyValue: () => {},
  sortTokensbyStake: () => {},
  sortTokensbyBalance: () => {},
  sortByDelegationIn: () => {},
  sortByDelegationOut: () => {}
};

const component = renderer.create(<SortEngineTokens {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
