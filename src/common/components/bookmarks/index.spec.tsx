import React from "react";
import renderer from "react-test-renderer";

import { createBrowserHistory } from "history";

import { Bookmarks, Favorites } from "./index";

import { globalInstance, activeUserInstance, allOver } from "../../helper/test-helper";

let TEST_MODE = 0;

jest.mock("../../api/private-api", () => ({
  getBookmarks: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            author: "tarazkp",
            permlink: "she-ll-be-apples",
            created: "Wed Aug 12 2020 15:31:29 GMT+0200 (Central European Summer Time)",
            _id: "5f33ef31baede01c77aa1809",
            timestamp: 1597239089185
          },
          {
            author: "bluemoon",
            permlink: "on-an-island",
            created: "Wed Aug 12 2020 16:18:50 GMT+0200 (Central European Summer Time)",
            _id: "5f33fa4abaede01c77aa1825",
            timestamp: 1597241930103
          },
          {
            author: "acidyo",
            permlink: "dissolution-f2p-crypto-futuristic-fps",
            created: "Wed Aug 12 2020 16:19:29 GMT+0200 (Central European Summer Time)",
            _id: "5f33fa71baede01c77aa1826",
            timestamp: 1597241969917
          },
          {
            author: "johnvibes",
            permlink:
              "after-multiple-ft-hood-soldiers-murdered-2-more-soldiers-arrested-in-child-trafficking-sting",
            created: "Wed Aug 12 2020 16:20:37 GMT+0200 (Central European Summer Time)",
            _id: "5f33fab5baede01c77aa182c",
            timestamp: 1597242037781
          },
          {
            author: "kommienezuspadt",
            permlink: "iexnncxb",
            created: "Wed Aug 12 2020 16:20:45 GMT+0200 (Central European Summer Time)",
            _id: "5f33fabdbaede01c77aa182d",
            timestamp: 1597242045183
          }
        ]);
      }
    }),

  getFavorites: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            account: "kommienezuspadt",
            _id: "5f355a2cbaede01c77aa1954",
            timestamp: 1597332012551
          },
          {
            account: "purepinay",
            _id: "5f35622bbaede01c77aa1966",
            timestamp: 1597334059308
          }
        ]);
      }
    })
}));

it("(1) Bookmarks - No data.", async () => {
  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: { ...activeUserInstance },
    onHide: () => {}
  };

  const component = await renderer.create(<Bookmarks {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Bookmarks - Test with data.", async () => {
  TEST_MODE = 1;

  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: { ...activeUserInstance },
    onHide: () => {}
  };

  const component = await renderer.create(<Bookmarks {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(3) Favorites - No data.", async () => {
  TEST_MODE = 0;

  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: { ...activeUserInstance },
    addAccount: () => {},
    onHide: () => {}
  };

  const component = await renderer.create(<Favorites {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(4) Favorites - Test with data.", async () => {
  TEST_MODE = 1;

  const props = {
    history: createBrowserHistory(),
    global: globalInstance,
    activeUser: { ...activeUserInstance },
    addAccount: () => {},
    onHide: () => {}
  };

  const component = await renderer.create(<Favorites {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
