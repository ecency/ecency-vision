import React from "react";

import renderer from "react-test-renderer";

import { createBrowserHistory, createLocation } from "history";
import { StaticRouter } from "react-router-dom";

import {
  globalInstance,
  UiInstance,
  proposalInstance,
  dynamicPropsIntance1,
  activeUserMaker,
  allOver
} from "../../helper/test-helper";

import { ProposalListItem } from "./index";
import { withStore } from "../../tests/with-store";

jest.mock("../../util/now", () => () => new Date("November 22, 2020 03:24:00"));

jest.mock("../../api/hive", () => ({
  getProposalVotes: (proposalId: number, voter: string = "", limit: number = 300) =>
    new Promise((resolve) => {
      resolve([]);
    })
}));

const defProps = {
  history: createBrowserHistory(),
  location: createLocation({}),
  global: globalInstance,
  dynamicProps: dynamicPropsIntance1,
  users: [],
  activeUser: activeUserMaker("foo"),
  ui: UiInstance,
  signingKey: "",
  addAccount: () => {},
  proposal: proposalInstance,
  setActiveUser: () => {},
  updateActiveUser: () => {},
  deleteUser: () => {},
  toggleUIProp: () => {},
  setSigningKey: () => {}
};

it("(1) Default render.", async () => {
  const props = { ...defProps };
  const component = withStore(
    <StaticRouter location="/" context={{}}>
      <ProposalListItem {...props} />
    </StaticRouter>
  );
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

// Return proposal is dynamic now, disabled this test.
/*it('(2) Return proposal.', async () => {
    const props = {
        ...defProps,
        isReturnProposalId: 0,
        proposal: {...proposalInstance, id: 0, proposal_id: 0}
    }

    const component = await renderer.create(
        <StaticRouter location="/" context={{}}>
            <ProposalListItem {...props}/>
        </StaticRouter>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});*/
