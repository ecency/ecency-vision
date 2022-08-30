import React from "react";

import { EditHistory } from "./index";

import TestRenderer from "react-test-renderer";

import { entryInstance1, allOver } from "../../helper/test-helper";

jest.mock("../../api/private-api", () => ({
  commentHistory: () =>
    new Promise((resolve) => {
      resolve({
        meta: { count: 2 },
        list: [
          {
            title: "a test post",
            body: "111XXX Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam rutrum eros eu sapien cursus ullamcorper ac eu justo. Fusce euismod semper tellus, et ornare libero pretium sed. Donec id bibendum orci. Quisque in interdum lectus. \n\nFusce tortor lectus, maximus vitae mollis sit amet, vehicula in lectus. Sed viverra tincidunt pulvinar. Morbi ut odio turpis. Pellentesque feugiat id urna pretium elementum. Fusce mauris nisi, tincidunt non arcu ac, laoreet sollicitudin nisl. Quisque sed mattis felis, ut facilisis quam. Sed dictum eleifend bibendum. Pellentesque mattis turpis mauris, vel interdum mi egestas vel. Phasellus ultricies tristique interdum.\n\n",
            tags: ["ecency"],
            timestamp: "2020-08-22T14:20:57+00:00",
            v: 1
          },
          {
            title: "a test post",
            body: "@@ -643,16 +643,24 @@\n istique \n+UPDATED \n interdum\n@@ -660,10 +660,8 @@\n nterdum.\n-%0A%0A\n",
            tags: ["ecency"],
            timestamp: "2020-08-26T11:50:27+00:00",
            v: 2
          }
        ]
      });
    })
}));

it("(1) Render with data", async () => {
  const props = {
    entry: entryInstance1,
    onHide: () => {}
  };
  const renderer = TestRenderer.create(<EditHistory {...props} />);
  await allOver();
  expect(renderer.toJSON()).toMatchSnapshot();
});
