import React from "react";
import { SortCommunities } from "./index";
import renderer from "react-test-renderer";

const props = {
  sortCommunitiesInAsc: () => {},
  sortCommunitiesInDsc: () => {}
};

const component = renderer.create(<SortCommunities {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
