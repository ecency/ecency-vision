import React from "react";
import { SortCommunities } from "./index";
import renderer from "react-test-renderer";
import { _t } from "../../i18n";

describe("profile communities sorting component", () => {
    const component = renderer.create(<SortCommunities />);

  it("Should sort communities in ascending order", () => {
    const ascendingLabel = component.root.findByProps({ id: "ascending" });
    ascendingLabel.props.onClick();
    expect(ascendingLabel).toBeFalsy;
  });

  it("Should sort communities in descending order", () => {
    const descendingLabel = component.root.findByProps({ id: "descending" });
    descendingLabel.props.onClick();
    expect(descendingLabel).toBeFalsy;
  });
  
  it("matches snapshot", () => {
    const main = component.toJSON()
    expect(main).toMatchSnapshot()
  })
});