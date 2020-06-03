import React from "react";

import EntryVotes, { EntryVotesDetail } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, entryInstance1 } from "../../helper/test-helper";

jest.mock("../../constants/defaults.json", () => ({
  imageServer: "https://images.esteem.app",
}));

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance },
    entry: { ...entryInstance1 },
    addAccount: (data: any) => {},
  };

  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) No votes", () => {
  const props = {
    history: createBrowserHistory(),
    global: { ...globalInstance },
    entry: { ...entryInstance1, ...{ stats: { ...entryInstance1.stats, ...{ total_votes: 0 } } } },
    addAccount: (data: any) => {},
  };

  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

const detailProps = {
  history: createBrowserHistory(),
  global: { ...globalInstance },
  entry: { ...entryInstance1 },
  addAccount: (data: any) => {},
};

const component = renderer.create(<EntryVotesDetail {...detailProps} />);

it("(3) Default render of detail", () => {
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Render of detail with votes", () => {
  const instance: any = component.getInstance();
  instance.setVotes(entryInstance1.active_votes);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(5) Move next on detail", () => {
  const instance: any = component.getInstance();
  instance.next();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(6) Move prev on detail", () => {
  const instance: any = component.getInstance();
  instance.prev();
  expect(component.toJSON()).toMatchSnapshot();
});
