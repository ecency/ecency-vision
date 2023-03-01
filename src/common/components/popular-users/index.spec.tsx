import React from "react";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { PopularUsers } from "./index";

import { globalInstance, allOver, accountSearchResultInstance } from "../../helper/test-helper";
import { withStore } from "../../tests/with-store";

jest.mock("../../api/search-api", () => ({
  searchAccount: (duration: string) =>
    new Promise((resolve) => {
      resolve(accountSearchResultInstance);
    })
}));

it("(1) Render with data.", async () => {
  const props = {
    global: globalInstance,
    history: createBrowserHistory(),
    addAccount: () => {}
  };

  const component = await withStore(<PopularUsers {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
