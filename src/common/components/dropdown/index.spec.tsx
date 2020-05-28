import React from 'react';

import MyDropDown from './index';
import renderer from 'react-test-renderer';
import {createBrowserHistory} from 'history';

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

it('(1) Default render', () => {
    const component = renderer.create(<MyDropDown {...props}/>);
    expect(component.toJSON()).toMatchSnapshot();
});

it('(2) Toggle menu ', () => {
    const component = renderer.create(<MyDropDown {...props}/>);
    // @ts-ignore
    component.getInstance().toggleMenu();
    expect(component.toJSON()).toMatchSnapshot();
});
