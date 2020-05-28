import React from 'react';

import MyDropDown from './index';
import TestRenderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

it('(1) Render', () => {
    const props = {
        history: createBrowserHistory(),
        label: 'Trending',
        items: [
            {
                label: 'Trending',
                href: '/trending',
                active: true
            },
            {
                label: 'Hot',
                href: '/hot'
            }
        ]
    };
    const renderer = TestRenderer.create(
        <MyDropDown {...props}/>
    );
    expect(renderer.toJSON()).toMatchSnapshot();
});
