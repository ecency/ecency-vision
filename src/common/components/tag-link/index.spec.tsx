import React from 'react';

import TagLink from './index';
import TestRenderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

it('(1) Default render', () => {
    const props = {
        history: createBrowserHistory(),
        location: {
            pathname: '/'
        },
        global: {
            tag: 'bitcoin',
            filter: 'hot'
        },
        communities: {list: {}},
        tag: 'bitcoin',
        children: <span>bitcoin</span>,
        fetchCommunity: () => {
        }
    };

    // @ts-ignore
    const renderer = TestRenderer.create(<TagLink {...props}/>);
    expect(renderer.toJSON()).toMatchSnapshot();
});
