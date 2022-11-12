import React from "react";
import { SortCommunities } from "./index";
import renderer from "react-test-renderer";
import { _t } from "../../i18n";

const props = {
  sortCommunitiesInAsc: () => {},
  sortCommunitiesInDsc: () => {}
};

const component = renderer.create(<SortCommunities {...props} />);

it("(1) Default render", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
