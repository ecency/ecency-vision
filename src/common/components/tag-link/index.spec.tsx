import React from 'react';

import TagLink from './index';
import TestRenderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

it('(1) Default render', () => {
    const props = {
        history: createBrowserHistory(),
        global: {
            tag: 'bitcoin',
            filter: 'hot'
        },
        tag: 'bitcoin'
    };

    // @ts-ignore
    const renderer = TestRenderer.create(<TagLink {...props}><span>bitcoin</span></TagLink>);
    expect(renderer.toJSON()).toMatchSnapshot();
});
