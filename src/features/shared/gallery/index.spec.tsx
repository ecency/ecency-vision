import * as React from "react";
import renderer from "react-test-renderer";

import { Gallery } from "./index";

import { activeUserInstance, globalInstance, allOver } from "../../helper/test-helper";

let TEST_MODE = 0;

jest.mock("../../api/private-api", () => ({
  getImages: () =>
    new Promise((resolve) => {
      if (TEST_MODE === 0) {
        resolve([]);
      }

      if (TEST_MODE === 1) {
        resolve([
          {
            created: "Sat Aug 08 2020 12:50:55 GMT+0200 (Central European Summer Time)",
            url: "https://images.ecency.com/DQmSoXUteHvx1evzu27Xn5xbf6Mrn29L9Swn2yH2h4keuSQ/test-3.jpg",
            _id: "5f2e838fbaede01c77aa13a1",
            timestamp: 1596883855848
          },
          {
            created: "Sat Aug 08 2020 12:57:47 GMT+0200 (Central European Summer Time)",
            url: "https://images.ecency.com/DQmYFWxjApdbdFVYdG6RMGh1vHQdAsAek38ePF3UsRbUYJv/test-10.jpg",
            _id: "5f2e852bbaede01c77aa13a2",
            timestamp: 1596884267539
          },
          {
            created: "Sat Aug 08 2020 12:57:53 GMT+0200 (Central European Summer Time)",
            url: "https://images.ecency.com/DQmRJdj2PZmKHz3zZ31CUC6fpHuQaxsQCvpEp15rX3RpTFG/test-9.jpg",
            _id: "5f2e8531baede01c77aa13a3",
            timestamp: 1596884273695
          },
          {
            created: "Sat Aug 08 2020 12:58:15 GMT+0200 (Central European Summer Time)",
            url: "https://images.ecency.com/DQmce1GReq9pwLiEHLsf2hKhAmouZnNSgnH95udH4g2VzAH/test-8.jpg",
            _id: "5f2e8547baede01c77aa13a4",
            timestamp: 1596884295409
          }
        ]);
      }
    })
}));

it("(1) Default render.", async () => {
  const props = {
    global: globalInstance,
    users: [],
    activeUser: { ...activeUserInstance },
    onHide: () => {}
  };

  const component = await renderer.create(<Gallery {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});

it("(2) Test with data.", async () => {
  TEST_MODE = 1;

  const props = {
    global: globalInstance,
    activeUser: { ...activeUserInstance },
    onPick: () => {},
    onHide: () => {}
  };

  const component = renderer.create(<Gallery {...props} />);
  await allOver();
  expect(component.toJSON()).toMatchSnapshot();
});
