import React from "react";

import renderer from "react-test-renderer";

import {
  globalInstance,
  dynamicPropsIntance1,
  proposalInstance,
  allOver
} from "../../helper/test-helper";

import { createBrowserHistory } from "history";

import { ProposalVotesDetail } from "./index";
import { withStore } from "../../tests/with-store";

jest.mock("../../api/hive", () => ({
  getProposalVotes: (proposalId: number, voter: string = "", limit: number = 300) =>
    new Promise((resolve) => {
      resolve([
        {
          voter: "foo"
        },
        {
          voter: "bar"
        },
        {
          voter: "baz"
        }
      ]);
    }),
  getAccounts: (usernames: string[]) => {
    return [
      {
        name: "foo",
        reputation: "737836300487609",
        vesting_shares: "246097821.767220 VESTS",
        proxied_vsf_votes: [0, 0, 0, 0]
      },
      {
        name: "bar",
        reputation: "16594056204096",
        vesting_shares: "6299727.662451 VESTS",
        proxied_vsf_votes: ["9603246791382", "1088178168454", 0, 0]
      }
    ];
  }
}));

const defProps = {
  history: createBrowserHistory(),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  proposal: proposalInstance,
  searchText: " ",
  addAccount: () => {},
  getVotesCount: () => {},
  onHide: () => {},
  checkIsMoreData: () => {}
};

it("(1) Default render.", async () => {
  const props = { ...defProps };

  const component = withStore(<ProposalVotesDetail {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
