import React from "react";

import MarketData from "./index";

import TestRenderer from "react-test-renderer";

const allOver = () => new Promise((resolve) => setImmediate(resolve));

jest.mock("../../api/misc", () => ({
    getMarketData: () =>
        new Promise((resolve) => {
            resolve({
                    prices: [
                        [1606241449397, 0.13003589875846425],
                        [1606245028098, 0.13019780734868572],
                        [1606248712873, 0.13324647886102334],
                        [1606252325163, 0.13286365923945537],
                        [1606255905578, 0.13136200461008427],
                        [1606259465523, 0.1309844714477785],
                        [1606263079046, 0.13343380921775128]
                    ]
                }
            );
        }),
}));

// see https://stackoverflow.com/a/53449595/3720614
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

it("(1) Default render", async () => {
    const renderer = TestRenderer.create(<MarketData/>);
    await allOver();
    expect(renderer.toJSON()).toMatchSnapshot();
});
