import React from "react";

import EntryVotes, { EntryVotesDetail } from "./index";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

const entry = {
  pending_payout_value: "14.057 HBD",
  author_payout_value: "0.000 HBD",
  curator_payout_value: "0.000 HBD",
  stats: {
    total_votes: 10,
  },
};

const global = {
  currencyRate: 1,
  currencySymbol: "$",
};

const votes = [
  { rshares: "26378927132310", voter: "user1" },
  { rshares: "15949716587", voter: "user2" },
  { rshares: "761139959", voter: "user3" },
  { rshares: "77289021734", voter: "user4" },
  { rshares: "19611165695", voter: "user5" },
  { rshares: "70001333175", voter: "user6" },
  { rshares: "542943147396", voter: "user7" },
  { rshares: "11322370177", voter: "user8" },
  { rshares: "5775938903", voter: "user9" },
  { rshares: "1387767696", voter: "user10" },
];

it("(1) Default render", () => {
  const props = {
    history: createBrowserHistory(),
    global,
    entry,
  };

  // @ts-ignore
  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) No votes", () => {
  const props = {
    history: createBrowserHistory(),
    global,
    entry: {
      stats: {
        total_votes: 0,
      },
    },
  };

  // @ts-ignore
  const component = renderer.create(<EntryVotes {...props} />);
  expect(component.toJSON()).toMatchSnapshot();
});

const detailProps = {
  history: createBrowserHistory(),
  global,
  entry,
};

// @ts-ignore
const component = renderer.create(<EntryVotesDetail {...detailProps} />);

it("(3) Default render of detail", () => {
  expect(component.toJSON()).toMatchSnapshot();

  // @ts-ignore
  //component.getInstance().setVotes(votes);
});

it("(4) Render of detail with votes", () => {
  // @ts-ignore
  component.getInstance().setVotes(votes);

  expect(component.toJSON()).toMatchSnapshot();
});

it("(5) Move next on detail", () => {
  // @ts-ignore
  component.getInstance().next();

  expect(component.toJSON()).toMatchSnapshot();
});

it("(6) Move prev on detail", () => {
    // @ts-ignore
    component.getInstance().prev();
  
    expect(component.toJSON()).toMatchSnapshot();
  });
  