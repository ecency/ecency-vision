import React from 'react';

import renderer from "react-test-renderer";

import {createBrowserHistory} from "history";
import {StaticRouter} from "react-router-dom";

import {globalInstance, UiInstance, proposalInstance, dynamicPropsIntance1, activeUserMaker} from "../../helper/test-helper";

import {ProposalListItem} from './index';

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/hive", () => ({
    getProposalVotes: (proposalId: number, voter: string = "", limit: number = 300) =>
        new Promise((resolve) => {
            resolve([]);
        }),
}));


const defProps = {
    history: createBrowserHistory(),
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
