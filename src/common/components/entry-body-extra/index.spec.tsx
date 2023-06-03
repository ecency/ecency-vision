import React from "react";
import renderer from "react-test-renderer";
import EntryBodyExtra from "./index";
import { entryInstance1, globalInstance } from "../../helper/test-helper";

describe("EntryBodyExtra component", () => {
  const props = {
    entry: { ...entryInstance1 },
    global: globalInstance
  };

  it("renders correctly", () => {
    const tree = renderer.create(<EntryBodyExtra {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
