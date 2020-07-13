import React from 'react';
import renderer from "react-test-renderer";

import {ActiveUser} from "../../store/active-user/types";
import FollowControls from './index';

const allOver = () => new Promise((resolve) => setImmediate(resolve));

let MOCK_MODE: number = 0;

jest.mock("../../api/hive", () => ({
    getFollowing: (follower: string,
                   startFollowing: string,
                   followType: string,
                   limit: number) =>
        new Promise((resolve) => {

            if (MOCK_MODE === 1) {
                resolve([]);
                return;
            }

            if (MOCK_MODE === 2) {
                resolve([{
                    follower: 'fooo1',
                    following: 'bar'
                }]);
                return;
            }

            if (MOCK_MODE === 3) {
                if (followType === 'ignore') {
                    resolve([{
                        follower: 'fooo1',
                        following: 'bar'
                    }]);

                } else {
                    resolve([]);
                }
                return;
            }
        }),
}));

const defProps = {
    users: [],
    activeUser: null,
    targetUsername: 'bar',
    setActiveUser: () => {
    },
    updateActiveUser: () => {
    },
    deleteUser: () => {
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

        const activeUser: ActiveUser = {
            username: 'fooo1',
            data: {name: 'fooo1'}
        }

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

        const activeUser: ActiveUser = {
            username: 'fooo1',
            data: {name: 'fooo1'}
        }

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

        const activeUser: ActiveUser = {
            username: 'fooo1',
            data: {name: 'fooo1'}
        }

        const props = {
            ...defProps,
            activeUser
        };

        const component = renderer.create(<FollowControls {...props}/>);
        await allOver();
        expect(component.toJSON()).toMatchSnapshot();
    });
});
