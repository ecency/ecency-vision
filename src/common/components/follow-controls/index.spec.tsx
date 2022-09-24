import React from 'react';
import renderer from "react-test-renderer";

import {UiInstance, activeUserMaker, allOver} from "../../helper/test-helper";

import FollowControls from './index';

let MOCK_MODE: number = 0;

jest.mock("../../api/bridge", () => ({
    getRelationshipBetweenAccounts: () =>
        new Promise((resolve) => {

            if (MOCK_MODE === 1) {
                resolve({
                    follows: false,
                    ignores: false,
                    is_blacklisted: false,
                    follows_blacklists: false
                });
            }

            if (MOCK_MODE === 2) {
                resolve({
                    follows: true,
                    ignores: false,
                    is_blacklisted: false,
                    follows_blacklists: false
                });
            }

            if (MOCK_MODE === 3) {
                resolve({
                    follows: false,
                    ignores: true,
                    is_blacklisted: false,
                    follows_blacklists: false
                });
            }
        }),
}));

const defProps = {
    users: [],
    activeUser: null,
    targetUsername: 'bar',
    ui: UiInstance,
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
    },
    toggleUIProp: () => {

    }
};

describe('FollowControls', () => {
    it('(1) Default render. No active user.', () => {
        const props = {...defProps};

        const component = renderer.create(<FollowControls {...props}/>);
        expect(component.toJSON()).toMatchSnapshot();
    });

    it('(2) Default Render with active account.', async () => {
        MOCK_MODE = 1;

        const activeUser = activeUserMaker("fooo1");

        const props = {
            ...defProps,
            activeUser
        };

        const component = renderer.create(<FollowControls {...props}/>);
        await allOver();
        expect(component.toJSON()).toMatchSnapshot();
    });


    it('(2) Following.', async () => {
        MOCK_MODE = 2;

        const activeUser = activeUserMaker("fooo1");

        const props = {
            ...defProps,
            activeUser
        };

        const component = renderer.create(<FollowControls {...props}/>);
        await allOver();
        expect(component.toJSON()).toMatchSnapshot();
    });

    it('(2) Muted.', async () => {
        MOCK_MODE = 3;

        const activeUser = activeUserMaker("fooo1");

        const props = {
            ...defProps,
            activeUser
        };

        const component = renderer.create(<FollowControls {...props}/>);
        await allOver();
        expect(component.toJSON()).toMatchSnapshot();
    });
});
