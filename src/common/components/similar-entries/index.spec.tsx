import React from 'react';
import renderer from "react-test-renderer";

import {createBrowserHistory, createLocation} from "history";

import {SimilarEntries} from './index';

import {globalInstance, entryInstance1, allOver, searchResponseInstance} from "../../helper/test-helper";

let TEST_MODE = 0;


jest.mock("../../api/search-api", () => ({
    search: () =>
        new Promise((resolve) => {

            if (TEST_MODE === 0) {
                resolve({...searchResponseInstance, results: []});
            }

            if (TEST_MODE === 1) {
                const resp = {...searchResponseInstance, results: [searchResponseInstance.results[0], searchResponseInstance.results[1]]}
                resolve(resp);
            }

            if (TEST_MODE === 2) {
                const resp = {...searchResponseInstance, results: [searchResponseInstance.results[0], searchResponseInstance.results[1], searchResponseInstance.results[2]]}
                resolve(resp);
            }
        }),
}));

jest.mock("moment", () => () => ({
    fromNow: () => "3 days ago"
}));


it('(1) No data.', async () => {
    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it('(2) Less than 3 entries. Should render null', async () => {
    TEST_MODE = 1;

    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});


it('(3) Should render entries', async () => {
    TEST_MODE = 2;

    const props = {
        history: createBrowserHistory(),
        location: createLocation({}),
        global: globalInstance,
        entry: entryInstance1
    };

    const component = renderer.create(<SimilarEntries {...props}/>);
    await allOver();
    expect(component.toJSON()).toMatchSnapshot();
});
