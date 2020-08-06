import React from 'react';

import TestRenderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

import {globalInstance} from "../../helper/test-helper";

import {NotificationListItem} from './index';

import {
    apiVoteNotification,
    apiMentionNotification,
    apiFollowNotification,
    apiUnfollowNotification,
    apiReplyNotification,
    apiReblogNotification,
    apiTransferNotification
} from "../../helper/test-helper";


describe('(1) NotificationListItem', () => {

    const defProps = {
        global: globalInstance,
        history: createBrowserHistory(),
        markNotifications: () => {

        },
        addAccount: () => {

        },
        toggleUIProp: () => {

        }
    }

    it('(1) Vote ', () => {
        const props = {...defProps, notification: apiVoteNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(2) Mention ', () => {
        const props = {...defProps, notification: apiMentionNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(3) Follow ', () => {
        const props = {...defProps, notification: apiFollowNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(4) Unfollow ', () => {
        const props = {...defProps, notification: apiUnfollowNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(5) Reply ', () => {
        const props = {...defProps, notification: apiReplyNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(6) Reblog ', () => {
        const props = {...defProps, notification: apiReblogNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });

    it('(7) Transfer ', () => {
        const props = {...defProps, notification: apiTransferNotification,};
        const renderer = TestRenderer.create(
            <NotificationListItem {...props}/>
        );

        expect(renderer.toJSON()).toMatchSnapshot();
    });
})

