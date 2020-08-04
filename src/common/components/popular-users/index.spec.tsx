import React from 'react';
import renderer from "react-test-renderer";
import {createBrowserHistory} from "history";

import {PopularUsers} from './index';

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/private", () => ({
    getPopularUsers: (duration: string) =>
        new Promise((resolve) => {
            resolve([
                {"name": "foo", "display_name": "Foo", "about": "Lorem ipsum dolor sit amet", "reputation": 70.44},
                {"name": "bar", "display_name": "Bar", "about": "Lorem ipsum dolor sit amet", "reputation": 72.44},
                {"name": "baz", "display_name": "Baz", "about": "Lorem ipsum dolor sit amet", "reputation": 74.44},
            ]);
        }),
}));


it('(1) Render with data.', async () => {
    const props = {
        history: createBrowserHistory(),
        addAccount: () => {
        }
    };

    const component = renderer.create(<PopularUsers {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
