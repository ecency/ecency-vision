import React from 'react';

import AccountLink from './index';
import TestRenderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

it('(1) Render', () => {
    const props = {
        history: createBrowserHistory(),
        children: <span>username</span>,
        username: 'username'
    };
    const renderer = TestRenderer.create(
        <AccountLink {...props}/>
    );
    expect(renderer.toJSON()).toMatchSnapshot();
});
