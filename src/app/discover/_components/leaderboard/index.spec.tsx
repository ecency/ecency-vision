import React from "react";
import renderer from "react-test-renderer";
import { createBrowserHistory } from "history";

import { globalInstance, allOver } from "../../helper/test-helper";

import { LeaderBoard } from "./index";
import { withStore } from "../../tests/with-store";

jest.mock("../../api/private-api", () => ({
  getLeaderboard: (duration: string) =>
    new Promise((resolve) => {
      resolve([
        { _id: "foo", count: 42, points: "121.325" },
        { _id: "bar", count: 40, points: "60.040" },
        { _id: "baz", count: 26, points: "44.707" },
        { _id: "zoo", count: 22, points: "55.040" }
      ]);
    })
}));

it("(1) Render with data.", async () => {
  const props = {
    global: globalInstance,
    history: createBrowserHistory(),
    addAccount: () => {}
  };

  const component = await withStore(<LeaderBoard {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
