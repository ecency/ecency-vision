import React from "react";

import EntryVotes, { EntryVotesDetail } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, entryInstance1, votesInstance1 } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.ecency.com"
}));

jest.mock("moment", () => () => ({
  fromNow: () => "3 days ago",
  format: (f: string, s: string) => "2020-01-01 23:12:00"
}));

jest.mock("../../api/hive", () => ({
  getActiveVotes: () =>
    new Promise((resolve) => {
      resolve(votesInstance1);
    })
}));

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance },
    entry: { ...entryInstance1 },
    addAccount: (data: any) => {}
  };

  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) No votes", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance },
    entry: { ...entryInstance1, ...{ active_votes: [] } },
    addAccount: (data: any) => {}
  };

  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

const detailProps = {
  history: createBrowserHistory(),
  global: { ...globalInstance },
  entry: { ...entryInstance1 },
  addAccount: (data: any) => {},
  updateInputDisable: (data: any) => {},
  searchText: ""
};

const component = renderer.create(<EntryVotesDetail {...detailProps} />);

it("(3) Render of detail with votes", () => {
  expect(component.toJSON()).toMatchSnapshot();
});
