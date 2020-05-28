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

const component = renderer.create(<MyDropDown {...props}/>);

it('(1) Default render', () => {
    expect(component.toJSON()).toMatchSnapshot();
});

it('(2) Show menu', () => {
    // @ts-ignore
    component.getInstance().showMenu();
    expect(component.toJSON()).toMatchSnapshot();
});

it('(3) Hide menu', () => {
    // @ts-ignore
    component.getInstance().hideMenu();
    expect(component.toJSON()).toMatchSnapshot();
});
