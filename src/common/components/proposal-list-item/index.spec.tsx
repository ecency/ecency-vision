import React from 'react';

import renderer from "react-test-renderer";

import {createBrowserHistory, createLocation} from "history";
import {StaticRouter} from "react-router-dom";

import {globalInstance, UiInstance, proposalInstance, dynamicPropsIntance1, activeUserMaker, allOver} from "../../helper/test-helper";

import {ProposalListItem} from './index';

jest.mock("../../util/now", () => () => new Date("November 22, 2020 03:24:00"));

jest.mock("../../api/hive", () => ({
    getProposalVotes: (proposalId: number, voter: string = "", limit: number = 300) =>
        new Promise((resolve) => {
            resolve([]);
        }),
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
    addAccount: () => {
    },
    proposal: proposalInstance,
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    toggleUIProp: () => {
    },
    setSigningKey: () => {
    },
}

it('(1) Default render.', async () => {
    const props = {...defProps};
    const component = renderer.create(
        <StaticRouter location="/" context={{}}>
            <ProposalListItem {...props}/>
        </StaticRouter>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});

it('(2) Return proposal.', async () => {
    const props = {
        ...defProps,
        proposal: {...proposalInstance, id: 0, proposal_id: 0}
    }

    const component = renderer.create(
        <StaticRouter location="/" context={{}}>
            <ProposalListItem {...props}/>
        </StaticRouter>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
